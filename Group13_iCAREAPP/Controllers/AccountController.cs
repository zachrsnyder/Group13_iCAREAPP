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

        // GET: Account/Login
        public ActionResult Login()
        {
            return View();
        }

        // POST: Account/Login
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Login(LoginViewModel model, string returnUrl)
        {
            if (ModelState.IsValid)
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

                                // Get user roles using navigation properties
                                var userRoles = db.UserRole
                                    .Where(r => r.iCAREUser.Any(u => u.ID == user.ID))
                                    .Select(r => r.roleName)
                                    .ToList();

                                Session["UserRoles"] = userRoles;

                                if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
                                {
                                    return Redirect(returnUrl);
                                }

                                return RedirectToAction("Index", "Home");
                            }
                        }
                        else
                        {
                            ModelState.AddModelError("", "Your account has expired.");
                        }
                    }
                    else
                    {
                        ModelState.AddModelError("", "Invalid username or password.");
                    }
                }
                else
                {
                    ModelState.AddModelError("", "Invalid username or password.");
                }
            }

            return View(model);
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