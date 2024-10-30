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

namespace Group13_iCAREAPP.Controllers
{
    public class ICareBoardController : Controller
    {
        private Group13_iCAREDBEntities db = new Group13_iCAREDBEntities();

        // GET: ICareBoard
        public ActionResult Index()
        {
            return View();
        }

        // GET: ICareBoard/HospitalPatients
        public ActionResult HospitalPatients()
        {
            try
            {
                // Get current user ID from authentication
                var currentUserID = Session["UserID"].ToString();

                // Find the WorkerGeoCode entry that matches the given workerID
                var workerGeoCode = db.iCAREUser.FirstOrDefault(wg => wg.ID == currentUserID);
                if (workerGeoCode == null)
                {
                    return HttpNotFound("Worker or GeoCode not found.");
                }

                // Get the geoID associated with the current user
                var geoID = workerGeoCode.userGeoID;

                // Get patients associated with the current user's geoID through PatientGeoCode
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

                // Debug logging
                System.Diagnostics.Debug.WriteLine($"Found {patientRecords.Count} patients");
                return Json(patientRecords, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error in HospitalPatients: {ex.Message}");
                Response.StatusCode = 500;
                return Json(new { error = ex.Message });
            }
        }

        // GET: ICareBoard/Details
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

        // POST: ICareBoard/AssignPatients
        [HttpPost]
        public ActionResult AssignPatients(AssignPatientsRequest request)
        {
            if (request.SelectedIDs == null || !request.SelectedIDs.Any())
            {
                return Json(new { success = false, message = "No patient IDs provided." });
            }

            var currentUserID = Session["UserID"].ToString();
            var successfulAssignments = new List<string>();
            var failedAssignments = new List<string>();

            foreach (var patientId in request.SelectedIDs)
            {
                System.Diagnostics.Debug.WriteLine($"Processing patient {patientId}");

                TreatmentRecord assignment = null; // Declare assignment here

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

                    // Add the new record to the context
                    db.TreatmentRecord.Add(assignment);

                    // Try to save changes for each assignment individually
                    db.SaveChanges();
                    successfulAssignments.Add(patientId);
                    System.Diagnostics.Debug.WriteLine($"Successfully assigned patient {patientId}");
                }
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
                    // Optionally: Detach the entity if needed to prevent conflicts in future iterations
                    if (assignment != null)
                    {
                        db.Entry(assignment).State = EntityState.Detached;
                    }
                }
            }

            // Return detailed response
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


        // Request model for deserialization
        public class AssignPatientsRequest
        {
            public List<string> SelectedIDs { get; set; }
        }

        // GET: ICareBoard/IsFullyAssigned
        public ActionResult IsFullyAssigned(string patientID)
        {
            var userProfession = Session["UserProfession"].ToString();
            {
                if (userProfession == "doctor")
                {
                    var doctorCount = db.TreatmentRecord
                        .Where(tr => tr.patientID == patientID)
                        .Join(db.iCAREUser,
                              tr => tr.userID,
                              u => u.ID,
                              (tr, u) => u)
                        .Count(u => u.profession == "doctor");

                    if (doctorCount == 1)
                    {
                        return Json(true);
                    }
                }
                else if (userProfession == "nurse")
                {
                    var nurseCount = db.TreatmentRecord
                        .Where(tr => tr.patientID == patientID)
                        .Join(db.iCAREUser,
                              tr => tr.userID,
                              u => u.ID,
                              (tr, u) => u)
                        .Count(u => u.profession == "nurse");

                    if (nurseCount == 3)
                    {
                        return Json(true);
                    }
                }
            }

            return Json(false);
        }


        // GET: ICareBoard/Create
        public ActionResult Create()
        {
            return View();
        }
    }
}
