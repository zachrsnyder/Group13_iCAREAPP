using System;
using System.Linq;
using System.Web.Mvc;
using System.Collections.Generic;
using Group13_iCAREAPP.Models;
using System.Data.SqlClient;
using BCrypt.Net;

namespace Group13_iCAREAPP.Controllers
{
    public class AdminController : Controller
    {
        // Database context
        private Group13_iCAREDBEntities db = new Group13_iCAREDBEntities();

        // Checks if the user is an Admin in the database
        private bool IsAdmin()
        {
            // Retrieve the user roles from the session
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

        // Grabs all GeoCodes form the database
        public ActionResult GetGeoCodes()
        {
            System.Diagnostics.Debug.WriteLine("GetUsers called");
            // Checks if the user is an admin
            var isAdmin = IsAdmin();
            System.Diagnostics.Debug.WriteLine($"IsAdmin check result: {isAdmin}");
            if (!isAdmin)
            {
                System.Diagnostics.Debug.WriteLine("Unauthorized access attempt to GetUsers");
                return Json(new { error = "Unauthorized" }, JsonRequestBehavior.AllowGet);
            }

            try
            {
                // Selects all GeoCodes rows from the database and returns them as a list
                var geoCodes = db.GeoCodes
                               .Select(geoCode => new
                               {
                                   ID = geoCode.ID,
                                   description = geoCode.description
                               }).ToList();

                System.Diagnostics.Debug.WriteLine($"Successfully retrieved {geoCodes.Count} geocodes");

                foreach (var geoCode in geoCodes)
                {
                    System.Diagnostics.Debug.WriteLine($"ID: {geoCode.ID}, Description: {geoCode.description}");
                }

                // Returns the list of GeoCodes
                return Json(geoCodes, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error in GetGeoCodes: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"Stack trace: {ex.StackTrace}");
                return Json(new { error = "Failed to fetch GeoCodes" }, JsonRequestBehavior.AllowGet);
            }

        }

        // Grabs all users from the database
        public ActionResult GetUsers()
        {
            System.Diagnostics.Debug.WriteLine("GetUsers called");
            // Checks if the user is an admin
            var isAdmin = IsAdmin();
            System.Diagnostics.Debug.WriteLine($"IsAdmin check result: {isAdmin}");

            if (!isAdmin)
            {
                System.Diagnostics.Debug.WriteLine("Unauthorized access attempt to GetUsers");
                return Json(new { error = "Unauthorized" }, JsonRequestBehavior.AllowGet);
            }

            try
            {
                // Grabs all user rows from the database and converts to a list
                var users = from user in db.iCAREUser
                            join pwd in db.UserPassword on user.ID equals pwd.ID
                            select new
                            {
                                id = user.ID,
                                name = user.name,
                                userName = pwd.userName,
                                profession = user.profession,
                                adminEmail = user.adminEmail,
                                roleName = user.UserRole.FirstOrDefault().roleName
                            };
                var userList = users.ToList();

                System.Diagnostics.Debug.WriteLine($"Successfully retrieved {userList.Count} users");

                foreach (var user in userList)
                {
                    System.Diagnostics.Debug.WriteLine($"User: {user.name}, Role: {user.roleName}");
                }

                // Returns the list of users
                return Json(userList, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error in GetUsers: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"Stack trace: {ex.StackTrace}");
                return Json(new { error = "Failed to fetch users" }, JsonRequestBehavior.AllowGet);
            }
        }


        // Adds a new user to the database
        [HttpPost]
        public ActionResult AddUser()
        {
            // Checks if the user is an admin
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

                // Deserialize the JSON to a dynamic object
                var serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
                dynamic userData = serializer.Deserialize<dynamic>(jsonString);

                // Generates a new user ID
                string newId = Guid.NewGuid().ToString();

                // Adds a new user row to the database
                using (var transaction = db.Database.BeginTransaction())
                {
                    try
                    {
                        // Creates a new user object and adds it to the database
                        // Password is hased using BCrypt
                        string hashedPassword = BCrypt.Net.BCrypt.HashPassword((string)userData["password"]);
                        var newUser = new iCAREUser
                        {
                            ID = newId,
                            name = userData["name"],
                            profession = userData["profession"],
                            adminEmail = userData["adminEmail"],
                            dateHired = DateTime.Now,
                            userGeoID = userData["userGeoID"]
                        };
                        // Adds the new user to the database
                        db.iCAREUser.Add(newUser);
                        // Saves the changes to the database
                        db.SaveChanges();

                        // Inserts a new password row using direct SQL
                        string insertPasswordSql = @"
                    INSERT INTO UserPassword (ID, userName, encryptedPassword, passwordExpiryTime, userAccountExpiryDate) 
                    VALUES (@userId, @userName, @password, @expiryTime, @accountExpiry)";

                        // Executes the SQL query
                        db.Database.ExecuteSqlCommand(insertPasswordSql,
                            new SqlParameter("@userId", newId),
                            new SqlParameter("@userName", (string)userData["userName"]),
                            new SqlParameter("@password", hashedPassword),
                            new SqlParameter("@expiryTime", 90),
                            new SqlParameter("@accountExpiry", DateTime.Now.AddYears(1)));

                        // Inserts a new role assignment using direct SQL
                        string insertRoleSql = "INSERT INTO UserRoleAssignment (userID, roleID) VALUES (@userId, @roleId)";

                        // Executes the SQL query
                        db.Database.ExecuteSqlCommand(insertRoleSql,
                            new SqlParameter("@userId", newId),
                            new SqlParameter("@roleId", (string)userData["roleID"]));

                        // Saves the transaction and commits the changes
                        transaction.Commit();
                        // Returns success message
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


        // Deletes a user in the database
        [HttpDelete]
        public ActionResult DeleteUser(string id)
        {
            System.Diagnostics.Debug.WriteLine($"DeleteUser called with ID: {id}");

            // Checks if the id is null or empty
            if (string.IsNullOrEmpty(id))
            {
                return Json(new { success = false, error = "Invalid user ID" }, JsonRequestBehavior.AllowGet);
            }

            // Checks if the logged in user is a admin
            if (!IsAdmin())
            {
                return Json(new { success = false, error = "Unauthorized access" }, JsonRequestBehavior.AllowGet);
            }

            // Deletes the user from the database
            try
            {
                using (var transaction = db.Database.BeginTransaction())
                {
                    // Goes through related tables and deletes related rows to the user
                    // That needs to be removed
                    try
                    {
                        var docResult = db.Database.ExecuteSqlCommand(
                            "DELETE FROM DocumentMetadata WHERE userID = @p0", id);

                        var treatmentResult = db.Database.ExecuteSqlCommand(
                            "DELETE FROM TreatmentRecord WHERE userID = @p0", id);

                        var roleResult = db.Database.ExecuteSqlCommand(
                            "DELETE FROM UserRoleAssignment WHERE userID = @p0", id);

                        var workerGeoResult = db.Database.ExecuteSqlCommand(
                            "DELETE FROM WorkerGeoCode WHERE workerID = @p0", id);

                        var passwordResult = db.Database.ExecuteSqlCommand(
                            "DELETE FROM UserPassword WHERE ID = @p0", id);

                        var userResult = db.Database.ExecuteSqlCommand(
                            "DELETE FROM iCAREUser WHERE ID = @p0", id);

                        // Saves and commits the transaction
                        transaction.Commit();

                        // Returns a success message
                        return Json(new
                        {
                            success = true,
                            message = "User deleted successfully",
                            details = new
                            {
                                documentsDeleted = docResult,
                                treatmentsDeleted = treatmentResult,
                                rolesDeleted = roleResult,
                                workerGeoDeleted = workerGeoResult,
                                passwordsDeleted = passwordResult,
                                usersDeleted = userResult
                            }
                        }, JsonRequestBehavior.AllowGet);
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        System.Diagnostics.Debug.WriteLine($"Delete transaction failed: {ex.Message}");
                        return Json(new { success = false, error = ex.Message }, JsonRequestBehavior.AllowGet);
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Delete operation failed: {ex.Message}");
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