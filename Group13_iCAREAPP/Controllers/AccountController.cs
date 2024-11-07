using System;
using System.Linq;
using System.Web.Mvc;
using System.Web.Security;
using Group13_iCAREAPP.ViewModels;
using Group13_iCAREAPP.Models;
using System.Web;

namespace Group13_iCAREAPP.Controllers
{
    public class AccountController : Controller
    {
        // Database context
        private Group13_iCAREDBEntities db = new Group13_iCAREDBEntities();

        // Vallidates login based on the user that is logging in
        // POST: Account/ValidateLogin
        [HttpPost]
        [ValidateInput(false)]
        public ActionResult ValidateLogin()
        {
            try
            {
                // Read the JSON from the request body
                var jsonReader = new System.IO.StreamReader(Request.InputStream);
                jsonReader.BaseStream.Position = 0;
                var jsonString = jsonReader.ReadToEnd();

                // Deserialize the JSON to your model
                var serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
                var model = serializer.Deserialize<LoginViewModel>(jsonString);

                System.Diagnostics.Debug.WriteLine($"Login attempt - Username: {model?.UserName}");

                // Validation, checks if a password and username is entered
                if (model == null || string.IsNullOrEmpty(model.UserName) || string.IsNullOrEmpty(model.Password))
                {
                    return Json(new { success = false, error = "Username and password are required." });
                }

                // Find user by username
                var userPassword = db.UserPassword.Where(up => up.userName == model.UserName).FirstOrDefault();

                var allUsers = db.UserPassword.ToList();
                System.Diagnostics.Debug.WriteLine($"Total users in database: {allUsers.Count}");
                foreach (var u in allUsers)
                {
                    System.Diagnostics.Debug.WriteLine($"DB User: {u.userName}, Password: {u.encryptedPassword}");
                }

                // If no matching user found
                if (userPassword == null)
                {
                    System.Diagnostics.Debug.WriteLine("No user found with username: " + model.UserName);
                    return Json(new { success = false, error = "Invalid username or password." });
                }

                // Checks if password matches BCrypt hash
                if (!BCrypt.Net.BCrypt.Verify(model.Password, userPassword.encryptedPassword))
                {
                    System.Diagnostics.Debug.WriteLine("Password mismatch for user: " + model.UserName);
                    return Json(new { success = false, error = "Invalid username or password." });
                }

                // Check expiry
                if (userPassword.userAccountExpiryDate < DateTime.Now)
                {
                    System.Diagnostics.Debug.WriteLine("Account expired for user: " + model.UserName);
                    return Json(new { success = false, error = "Your account has expired." });
                }

                // Get user details by ID
                var user = db.iCAREUser.Find(userPassword.ID);
                if (user == null)
                {
                    System.Diagnostics.Debug.WriteLine("No iCAREUser found for ID: " + userPassword.ID);
                    return Json(new { success = false, error = "User account not found." });
                }

                // Get user roles
                var userRoles = db.UserRole.Where(ur => ur.iCAREUser.Any(u => u.ID == user.ID))
                                         .Select(ur => ur.roleName)
                                         .ToList();
                // Check if user has roles
                if (!userRoles.Any())
                {
                    System.Diagnostics.Debug.WriteLine("No roles found for user: " + model.UserName);
                    return Json(new { success = false, error = "User has no assigned roles." });
                }

                // Set authentication cookie and session
                FormsAuthentication.SetAuthCookie(model.UserName, model.RememberMe);
                Session["UserID"] = user.ID;
                Session["UserName"] = user.name;
                Session["UserProfession"] = user.profession;
                Session["UserRoles"] = userRoles;

                System.Diagnostics.Debug.WriteLine("Login successful for user: " + model.UserName);

                System.Diagnostics.Debug.WriteLine($"User {model.UserName} roles:");
                foreach (var role in userRoles)
                {
                    System.Diagnostics.Debug.WriteLine($"Role: {role}");
                }

                // Return user details
                return Json(new
                {
                    success = true,
                    user = new
                    {
                        id = user.ID,
                        name = user.name,
                        profession = user.profession,
                        roles = userRoles
                    }
                });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Login error: " + ex.Message);
                return Json(new { success = false, error = "An error occurred during login. Password could be incorrect." });
            }
        }

        // Grabs the user info based on the currently logged in user
        // GET: Account/GetUserInfo
        public ActionResult GetUserInfo()
        {
            //Sets userId to the session variable as a string
            var userId = Session["UserID"] as string;
            if (string.IsNullOrEmpty(userId))
            {
                return Json(new { error = "Not authenticated" }, JsonRequestBehavior.AllowGet);
            }

            //Grabs user based on userId
            var user = db.iCAREUser.Find(userId);
            if (user != null)
            {
                //Grabs user roles based on userId
                var userRoles = db.UserRole.Where(ur => ur.iCAREUser.Any(u => u.ID == userId))
                                         .Select(ur => ur.roleName)
                                         .ToList();

                //Grabs user geoCode based on userGeoID
                var geoCode = db.GeoCodes
                               .Where(g => g.ID == user.userGeoID)
                               .Select(g => g.description)
                               .FirstOrDefault();

                //Returns user details as well as geoCode if it exists
                return Json(new
                {
                    id = user.ID,
                    name = user.name,
                    profession = user.profession,
                    roles = userRoles,
                    geoCode = geoCode ?? "No GeoCode Assigned"
                }, JsonRequestBehavior.AllowGet);
            }

            return Json(new { error = "User not found" }, JsonRequestBehavior.AllowGet);
        }

        // GET: Account/Logout
        public ActionResult Logout()
        {
            // Clear session and authentication cookies
            try
            {
                FormsAuthentication.SignOut();
                Session.Clear();
                Session.Abandon();

                // Clear authentication cookie
                var cookie = new HttpCookie(FormsAuthentication.FormsCookieName, "")
                {
                    Expires = DateTime.Now.AddYears(-1)
                };
                Response.Cookies.Add(cookie);

                return Json(new { success = true }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { success = false, error = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}