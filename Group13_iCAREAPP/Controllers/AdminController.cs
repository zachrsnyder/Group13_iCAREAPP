using System;
using System.Linq;
using System.Web.Mvc;
using System.Collections.Generic;
using Group13_iCAREAPP.Models;
using System.Data.SqlClient;
using BCrypt.Net; // Import BCrypt

namespace Group13_iCAREAPP.Controllers
{
    public class AdminController : Controller
    {
        private Group13_iCAREDBEntities db = new Group13_iCAREDBEntities();

        private bool IsAdmin()
        {
            var userRoles = Session["UserRoles"] as IEnumerable<string>;
            System.Diagnostics.Debug.WriteLine($"Checking admin status. Roles in session: {userRoles != null}");
            if (userRoles != null)
            {
                foreach (var role in userRoles)
                {
                    System.Diagnostics.Debug.WriteLine($"Found role: {role}");
                }
            }
            return userRoles != null && userRoles.Contains("Admin");
        }

        public ActionResult GetUsers()
        {
            System.Diagnostics.Debug.WriteLine("GetUsers called");
            var isAdmin = IsAdmin();
            System.Diagnostics.Debug.WriteLine($"IsAdmin check result: {isAdmin}");

            if (!isAdmin)
            {
                System.Diagnostics.Debug.WriteLine("Unauthorized access attempt to GetUsers");
                return Json(new { error = "Unauthorized" }, JsonRequestBehavior.AllowGet);
            }

            try
            {
                // Modified query to use existing navigation properties
                var users = from user in db.iCAREUser
                            join pwd in db.UserPassword on user.ID equals pwd.ID
                            select new
                            {
                                id = user.ID,
                                name = user.name,
                                userName = pwd.userName,
                                profession = user.profession,
                                adminEmail = user.adminEmail,
                                roleName = user.UserRole.FirstOrDefault().roleName // Assuming navigation property exists
                            };

                var userList = users.ToList();
                System.Diagnostics.Debug.WriteLine($"Successfully retrieved {userList.Count} users");

                // Debug output
                foreach (var user in userList)
                {
                    System.Diagnostics.Debug.WriteLine($"User: {user.name}, Role: {user.roleName}");
                }

                return Json(userList, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error in GetUsers: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"Stack trace: {ex.StackTrace}");
                return Json(new { error = "Failed to fetch users" }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult AddUser()
        {
            if (!IsAdmin())
            {
                return Json(new { success = false, error = "Unauthorized access" });
            }

            try
            {
                // Read and parse the request body
                var jsonReader = new System.IO.StreamReader(Request.InputStream);
                jsonReader.BaseStream.Position = 0;
                var jsonString = jsonReader.ReadToEnd();

                var serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
                dynamic userData = serializer.Deserialize<dynamic>(jsonString);

                // Generate new user ID
                string newId = Guid.NewGuid().ToString();

                using (var transaction = db.Database.BeginTransaction())
                {
                    try
                    {
                        // Create new iCAREUser using Entity Framework
                        string hashedPassword = BCrypt.Net.BCrypt.HashPassword((string)userData["password"]);
                        var newUser = new iCAREUser
                        {
                            ID = newId,
                            name = userData["name"],
                            profession = userData["profession"],
                            adminEmail = userData["adminEmail"],
                            dateHired = DateTime.Now
                        };
                        db.iCAREUser.Add(newUser);
                        db.SaveChanges();

                        // Insert UserPassword using direct SQL
                        string insertPasswordSql = @"
                    INSERT INTO UserPassword (ID, userName, encryptedPassword, passwordExpiryTime, userAccountExpiryDate) 
                    VALUES (@userId, @userName, @password, @expiryTime, @accountExpiry)";

                        db.Database.ExecuteSqlCommand(insertPasswordSql,
                            new SqlParameter("@userId", newId),
                            new SqlParameter("@userName", (string)userData["userName"]),
                            new SqlParameter("@password", hashedPassword),
                            new SqlParameter("@expiryTime", 90),
                            new SqlParameter("@accountExpiry", DateTime.Now.AddYears(1)));

                        // Insert role assignment using direct SQL
                        string insertRoleSql = "INSERT INTO UserRoleAssignment (userID, roleID) VALUES (@userId, @roleId)";

                        db.Database.ExecuteSqlCommand(insertRoleSql,
                            new SqlParameter("@userId", newId),
                            new SqlParameter("@roleId", (string)userData["roleID"]));

                        transaction.Commit();
                        return Json(new { success = true });
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        System.Diagnostics.Debug.WriteLine($"Transaction error: {ex.Message}");
                        throw;
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error adding user: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"Stack trace: {ex.StackTrace}");
                return Json(new { success = false, error = "Failed to add user" });
            }
        }


        [HttpDelete]
        public ActionResult DeleteUser(string id)
        {
            System.Diagnostics.Debug.WriteLine($"DeleteUser called with ID: {id}");

            if (string.IsNullOrEmpty(id))
            {
                System.Diagnostics.Debug.WriteLine("Delete failed: ID is null or empty");
                return Json(new { success = false, error = "Invalid user ID" }, JsonRequestBehavior.AllowGet);
            }

            if (!IsAdmin())
            {
                System.Diagnostics.Debug.WriteLine("Delete failed: Unauthorized access");
                return Json(new { success = false, error = "Unauthorized access" }, JsonRequestBehavior.AllowGet);
            }

            try
            {
                using (var transaction = db.Database.BeginTransaction())
                {
                    try
                    {
                        System.Diagnostics.Debug.WriteLine($"Starting delete transaction for user {id}");

                        // 1. Delete role assignments
                        var roleResult = db.Database.ExecuteSqlCommand(
                            "DELETE FROM UserRoleAssignment WHERE userID = @p0", id);
                        System.Diagnostics.Debug.WriteLine($"Deleted {roleResult} role assignments");

                        // 2. Delete password
                        var passwordResult = db.Database.ExecuteSqlCommand(
                            "DELETE FROM UserPassword WHERE ID = @p0", id);
                        System.Diagnostics.Debug.WriteLine($"Deleted {passwordResult} password records");

                        // 3. Delete the user
                        var userResult = db.Database.ExecuteSqlCommand(
                            "DELETE FROM iCAREUser WHERE ID = @p0", id);
                        System.Diagnostics.Debug.WriteLine($"Deleted {userResult} user records");

                        transaction.Commit();
                        System.Diagnostics.Debug.WriteLine("Delete transaction committed successfully");

                        return Json(new { success = true, message = "User deleted successfully" }, JsonRequestBehavior.AllowGet);
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        System.Diagnostics.Debug.WriteLine($"Transaction error: {ex.Message}");
                        System.Diagnostics.Debug.WriteLine($"Stack trace: {ex.StackTrace}");
                        return Json(new { success = false, error = ex.Message }, JsonRequestBehavior.AllowGet);
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error deleting user: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"Stack trace: {ex.StackTrace}");
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