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
                var currentUserID = Session["UserID"].ToString();

                var workerGeoCode = db.iCAREUser.FirstOrDefault(wg => wg.ID == currentUserID);
                if (workerGeoCode == null)
                {
                    return HttpNotFound("Worker or GeoCode not found.");
                }

                var geoID = workerGeoCode.userGeoID;

                // Retrieve patient records without `fullyAssigned`
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

                // Create a new list with `fullyAssigned` included
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
                    fullyAssigned = CheckIfFullyAssigned(p.ID)
                }).ToList();

                System.Diagnostics.Debug.WriteLine($"Found {patientRecordsWithAssignment.Count} patients");
                return Json(patientRecordsWithAssignment, JsonRequestBehavior.AllowGet);
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

        private bool CheckIfFullyAssigned(string patientID)
        {
            var userProfession = Session["UserProfession"]?.ToString();
            System.Diagnostics.Debug.WriteLine("current user profession: " + userProfession);
            
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


        // GET: ICareBoard/Create
        public ActionResult Create()
        {
            return View();
        }
    }
}
