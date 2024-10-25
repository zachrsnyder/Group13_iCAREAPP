using System;
using System.Linq;
using System.Web.Mvc;
using System.Web.Security;
using Group13_iCAREAPP.ViewModels;
using Group13_iCAREAPP.Models;


namespace Group13_iCAREAPP.Controllers
{
    public class AccountController : Controller
    {
        private Group13_iCAREDBEntities db = new Group13_iCAREDBEntities();

        // POST: Account/Login
        [HttpPost]
        public ActionResult Login()
        {
            // Read the JSON from the request body
            var jsonReader = new System.IO.StreamReader(Request.InputStream);
            jsonReader.BaseStream.Position = 0;
            var jsonString = jsonReader.ReadToEnd();

            // Deserialize the JSON to your model
            var serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            var model = serializer.Deserialize<LoginViewModel>(jsonString);

            if (model != null)
            {
                var userPassword = db.UserPassword.FirstOrDefault(u => u.userName == model.UserName);
                if (userPassword != null)
                {
                    if (userPassword.encryptedPassword == model.Password)
                    {
                        if (userPassword.userAccountExpiryDate >= DateTime.Now)
                        {
                            var user = db.iCAREUser.Find(userPassword.ID);
                            if (user != null)
                            {
                                FormsAuthentication.SetAuthCookie(model.UserName, model.RememberMe);
                                Session["UserID"] = user.ID;
                                Session["UserName"] = user.name;
                                Session["UserProfession"] = user.profession;

                                var userRoles = db.UserRole
                                    .Where(r => r.iCAREUser.Any(u => u.ID == user.ID))
                                    .Select(r => r.roleName)
                                    .ToList();
                                Session["UserRoles"] = userRoles;

                                return Json(new
                                {
                                    success = true,
                                    user = new
                                    {
                                        name = user.name,
                                        profession = user.profession,
                                        roles = userRoles
                                    }
                                });
                            }
                        }
                        return Json(new { success = false, error = "Your account has expired." });
                    }
                }
                return Json(new { success = false, error = "Invalid username or password." });
            }
            return Json(new { success = false, error = "Invalid request format." });
        }
        public ActionResult Logout()
        {
            FormsAuthentication.SignOut();
            Session.Clear();
            return RedirectToAction("Login");
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