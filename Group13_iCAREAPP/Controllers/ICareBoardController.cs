using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Web.Mvc;
using Group13_iCAREAPP.Models;
using Group13_iCAREAPP.ViewModels;
using System.IO;
using System.Data.Entity.Validation;
using System.Data.Entity.Infrastructure;
using static System.Data.Entity.Infrastructure.Design.Executor;

namespace Group13_iCAREAPP.Controllers
{
    public class ICareBoardController : Controller
    {
        // Database context
        private Group13_iCAREDBEntities db = new Group13_iCAREDBEntities();

        // Grabs all patients in the same geoCode as the logged in user and returns them as a list
        public ActionResult HospitalPatients()
        {
            try
            {
                // Grabs id and profession from session
                var currentUserID = Session["UserID"].ToString();
                var userProfession = Session["UserProfession"]?.ToString();

                // Grabs geoCode corrosponding to logged in user from database
                var workerGeoCode = db.iCAREUser.FirstOrDefault(wg => wg.ID == currentUserID);
                if (workerGeoCode == null)
                {
                    return HttpNotFound("Worker or GeoCode not found.");
                }

                var geoID = workerGeoCode.userGeoID;

                // Grabs all patient records from database which match the geoCode of the logged in user
                var patientRecords = (from p in db.PatientRecord
                                      where p.patientGeoID == geoID
                                      select new
                                      {
                                          ID = p.ID,
                                          name = p.name,
                                          address = p.address,
                                          dateOfBirth = p.dateOfBirth.ToString().Replace("/Date(", "").Replace(")/", ""),
                                          height = p.height,
                                          weight = p.weight,
                                          bloodGroup = p.bloodGroup,
                                          bedID = p.bedID,
                                          treatmentArea = p.treatmentArea
                                      })
                                      .Distinct()
                                      .ToList();

                // Checks if grabbed patients are fully assigned, already assigned or has a nurse assigned
                var patientRecordsWithAssignment = patientRecords.Select(p => new
                {
                    p.ID,
                    p.name,
                    p.address,
                    p.dateOfBirth,
                    p.height,
                    p.weight,
                    p.bloodGroup,
                    p.bedID,
                    p.treatmentArea,
                    fullyAssigned = CheckIfFullyAssigned(p.ID),
                    alreadyAssigned = CheckIfAlreadyAssigned(p.ID),
                    hasNurseAssigned = HasNurseAssigned(p.ID),
                    userProfession = Session["UserProfession"]?.ToString()
                }).ToList();

                // Returns the pateint records with their assignments
                return Json(patientRecordsWithAssignment, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error in HospitalPatients: {ex.Message}");
                Response.StatusCode = 500;
                return Json(new { error = ex.Message });
            }
        }

        // Grabs patient details based on the patient ID
        public ActionResult Details(string id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            PatientRecord patientRecord = db.PatientRecord.Find(id);
            if (patientRecord == null)
            {
                return HttpNotFound();
            }
            return View(patientRecord);
        }

        // Assigns a given patient(s) to the logged in user
        [HttpPost]
        public ActionResult AssignPatients(AssignPatientsRequest request)
        {
            // Checks if any patient IDs are provided in the request body
            if (request.SelectedIDs == null || !request.SelectedIDs.Any())
            {
                return Json(new { success = false, message = "No patient IDs provided." });
            }


            // Grabs the current userID from the session and debug code
            var currentUserID = Session["UserID"].ToString();
            var successfulAssignments = new List<string>();
            var failedAssignments = new List<string>();

            // Loops through the provided patient IDs and assigns them to the logged in user
            foreach (var patientId in request.SelectedIDs)
            {
                System.Diagnostics.Debug.WriteLine($"Processing patient {patientId}");

                // Must reset assignment to null in each iteration to avoid reusing the same object
                TreatmentRecord assignment = null;
                try
                {
                    // Check if the patient exists
                    var patient = db.PatientRecord.Find(patientId);
                    if (patient == null)
                    {
                        failedAssignments.Add($"Patient with ID {patientId} not found.");
                        continue;
                    }

                    // Generate a unique treatmentID
                    string treatmentID = Guid.NewGuid().ToString();

                    // Create and add the new treatment record
                    assignment = new TreatmentRecord
                    {
                        treatmentID = treatmentID,
                        patientID = patientId,
                        userID = currentUserID,
                        treatmentDate = DateTime.UtcNow,
                        description = "To be decided"
                    };

                    // Add the new record
                    db.TreatmentRecord.Add(assignment);

                    // Find and update the DocumentMetadata for this patient
                    var documentMetadata = db.DocumentMetadata.FirstOrDefault(dm => dm.patientID == patientId);
                    if (documentMetadata != null)
                    {
                        documentMetadata.userID = currentUserID;
                        documentMetadata.docName = ("Assigned to " + Session["UserName"].ToString());
                        db.Entry(documentMetadata).State = EntityState.Modified;
                    }

                    // Save changes for this assignment
                    db.SaveChanges();
                    successfulAssignments.Add(patientId);
                    System.Diagnostics.Debug.WriteLine($"Successfully assigned patient {patientId}");
                }
                // Catch any validation errors and log them
                catch (DbEntityValidationException ex)
                {
                    foreach (var validationErrors in ex.EntityValidationErrors)
                    {
                        foreach (var validationError in validationErrors.ValidationErrors)
                        {
                            System.Diagnostics.Debug.WriteLine($"Validation error for patient {patientId} - Property: {validationError.PropertyName}, Error: {validationError.ErrorMessage}");
                        }
                    }
                    failedAssignments.Add($"Validation error for patient {patientId}");
                }
                catch (DbUpdateException dbEx)
                {
                    System.Diagnostics.Debug.WriteLine($"DbUpdateException for patient {patientId}: {dbEx.InnerException?.Message ?? dbEx.Message}");
                    failedAssignments.Add($"DbUpdate error for patient {patientId}: {dbEx.InnerException?.Message ?? dbEx.Message}");
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Error assigning patient {patientId}: {ex.Message}");
                    failedAssignments.Add($"Error assigning patient {patientId}: {ex.Message}");
                }
                finally
                {
                    if (assignment != null)
                    {
                        db.Entry(assignment).State = EntityState.Detached;
                    }
                }
            }

            if (failedAssignments.Any())
            {
                return Json(new
                {
                    success = successfulAssignments.Any(),
                    message = $"Assigned {successfulAssignments.Count} patients. {failedAssignments.Count} assignments failed.",
                    successfulAssignments,
                    failedAssignments
                });
            }

            return Json(new
            {
                success = true,
                message = $"Successfully assigned {successfulAssignments.Count} patients."
            });
        }

        // Class definition
        public class AssignPatientsRequest
        {
            public List<string> SelectedIDs { get; set; }
        }

        // Helper function to check if a patient is fully assigned
        private bool CheckIfFullyAssigned(string patientID)
        {
            // Get the user profession from the session
            var userProfession = Session["UserProfession"]?.ToString();
            System.Diagnostics.Debug.WriteLine("current user profession: " + userProfession);

            // Check for both Nurses and Doctors
            if (userProfession == "Doctor")
            {
                var doctorCount = db.TreatmentRecord
                    .Where(tr => tr.patientID == patientID)
                    .Join(db.iCAREUser,
                          tr => tr.userID,
                          u => u.ID,
                          (tr, u) => u)
                    .Count(u => u.profession == "Doctor");

                return doctorCount >= 1;
            }
            else if (userProfession == "Nurse")
            {
                var nurseCount = db.TreatmentRecord
                    .Where(tr => tr.patientID == patientID)
                    .Join(db.iCAREUser,
                          tr => tr.userID,
                          u => u.ID,
                          (tr, u) => u)
                    .Count(u => u.profession == "Nurse");

                return nurseCount >= 3;
            }

            return false;
        }

        // Helper function if a patient is already assigned
        private bool CheckIfAlreadyAssigned(string patientID)
        {
            // Get the user profession and ID from the session
            var userProfession = Session["UserProfession"]?.ToString();
            var currentUserID = Session["UserID"].ToString();

            // Check for both Nurses and Doctors
            if ((userProfession == "Nurse" || userProfession == "Doctor") && !string.IsNullOrEmpty(currentUserID))
            {
                bool isAlreadyAssigned = db.TreatmentRecord
                    .Any(tr => tr.patientID == patientID && tr.userID == currentUserID);

                if (isAlreadyAssigned)
                {
                    System.Diagnostics.Debug.WriteLine($"{userProfession} {currentUserID} is already assigned to patient {patientID}");
                    return true;
                }
            }
            return false;
        }

        // Helper function to check if a nurse is already assigned to a given patient
        private bool HasNurseAssigned(string patientID)
        {
            return db.TreatmentRecord
                .Where(tr => tr.patientID == patientID)
                .Join(db.iCAREUser,
                      tr => tr.userID,
                      u => u.ID,
                      (tr, u) => u)
                .Any(u => u.profession == "Nurse");
        }
    }
}