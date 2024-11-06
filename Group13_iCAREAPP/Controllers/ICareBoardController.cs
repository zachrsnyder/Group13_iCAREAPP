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
                var userProfession = Session["UserProfession"]?.ToString();

                var workerGeoCode = db.iCAREUser.FirstOrDefault(wg => wg.ID == currentUserID);
                if (workerGeoCode == null)
                {
                    return HttpNotFound("Worker or GeoCode not found.");
                }

                var geoID = workerGeoCode.userGeoID;

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
        private bool CheckIfAlreadyAssigned(string patientID)
        {
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
