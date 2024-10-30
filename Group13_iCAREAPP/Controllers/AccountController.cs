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
        private Group13_iCAREDBEntities db = new Group13_iCAREDBEntities();

        // GET: Account/Login
        public ActionResult Login()
        {
            return View();
        }

        // POST: Account/Login
        [HttpPost]
        [ValidateInput(false)] // Add this to allow JSON in the request body
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

                // Debug logging
                System.Diagnostics.Debug.WriteLine($"Login attempt - Username: {model?.UserName}");

                // Validation
                if (model == null || string.IsNullOrEmpty(model.UserName) || string.IsNullOrEmpty(model.Password))
                {
                    return Json(new { success = false, error = "Username and password are required." });
                }

                // Find the user - using explicit query
                var userPassword = db.UserPassword.Where(up => up.userName == model.UserName).FirstOrDefault();

                // Debug logging
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

                // Check password
                //if (userPassword.encryptedPassword != model.Password)
                //{
                //    System.Diagnostics.Debug.WriteLine("Password mismatch for user: " + model.UserName);
                //    return Json(new { success = false, error = "Invalid username or password." });
                //}

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

        public ActionResult GetUserInfo()
        {
            var userId = Session["UserID"] as string;
            if (string.IsNullOrEmpty(userId))
            {
                return Json(new { error = "Not authenticated" }, JsonRequestBehavior.AllowGet);
            }

            var user = db.iCAREUser.Find(userId);
            if (user != null)
            {
                var userRoles = db.UserRole.Where(ur => ur.iCAREUser.Any(u => u.ID == userId))
                                         .Select(ur => ur.roleName)
                                         .ToList();

                var geoCode = db.GeoCodes
                               .Where(g => g.ID == user.userGeoID)
                               .Select(g => g.description)
                               .FirstOrDefault();

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