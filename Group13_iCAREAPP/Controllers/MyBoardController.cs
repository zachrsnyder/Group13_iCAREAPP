using Group13_iCAREAPP.Models;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Group13_iCAREAPP.Controllers
{
    public class MyBoardController : Controller
    {
        // Database context
        private Group13_iCAREDBEntities db = new Group13_iCAREDBEntities();

        // Class definition
        public class PatientEdit
        {
            public string ID { get; set; }
            public string name { get; set; }
            public string address { get; set; }
            public string dateOfBirth { get; set; }
            public string height { get; set; }
            public string weight { get; set; }
            public string bloodGroup { get; set; }
            public string bedID { get; set; }
            public string treatmentArea { get; set; }
            public string pateintGeoID { get; set; }
            public string description { get; set; }
        }

        // Grabs the ModificationHistory for a specific patient by getting the docID from the DocumentMetadata
        //GET: MyBoard/GetChangeHistory
        public ActionResult GetChangeHistory(string patientID)
        {
            var modificationList = (from m in db.ModificationHistory
                                    join md in db.DocumentMetadata
                                    on m.docID equals md.docID
                                    where md.patientID == patientID
                                    select new
                                    {
                                        docID = m.docID,
                                        modDate = m.dateOfModification.ToString().Replace("/Date(", "").Replace(")/", ""),
                                        description = m.descrption
                                    })
                                   .Distinct()
                                   .ToList();

            // Returns the modifictionHistory as a list
            System.Diagnostics.Debug.WriteLine($"Found {modificationList.Count} records for patientID {patientID}");
            return Json(modificationList, JsonRequestBehavior.AllowGet);
        }


        // Grabs the TreatmentRecord for a specific patient based on a given patientID
        //GET: MyBoard/GetTreatment
        public ActionResult GetTreatment(string patientID)
        {
            // Gets the UserID of the logged in user from session
            var userID = Session["UserID"]?.ToString();
            // Grabs the treatment record of the patient based on the userID and patientID
            var treatment = db.TreatmentRecord
                .Where(t => t.userID == userID && t.patientID == patientID)
                .Select(t => new
                {
                    treatmentID = t.treatmentID,
                    patientID = t.patientID,
                    treatmentDate = t.treatmentDate.ToString().Replace("/Date(", "").Replace(")/", ""),
                    description = t.description
                })
                .FirstOrDefault();
            System.Diagnostics.Debug.WriteLine(treatment.treatmentID);



            if (treatment == null)
            {
                return HttpNotFound(); // Or handle the case when no record is found
            }

            // Returns the treatment record
            return Json(treatment, JsonRequestBehavior.AllowGet);
        }

        // Class definiton
        public class TreatmentEdit
        {
            public string treatmentID { get; set; }
            public string patientID { get; set; }
            public string description { get; set; }
            public string editDescription { get; set; }
            public string treatmentDate { get; set; }
        }

        // Updates the treatment record based on a given treatmentRecord given in the form of a TreatmentEdit object
        //POST: MyBoard/handleTreatmentHistory
        [HttpPost]
        public ActionResult HandleTreatmentHistory([ModelBinder(typeof(JsonModelBinder))] TreatmentEdit treatment)
        {
            using (var transaction = db.Database.BeginTransaction())
            {
                try
                {
                    if (treatment == null)
                    {
                        return Json(new { success = false, message = "Invalid treatment data" });
                    }

                    // Gets the UserID of the logged in user from session
                    var userId = Session["UserID"]?.ToString();
                    if (userId == null)
                    {
                        return Json(new { success = false, message = "User session not found" });
                    }

                    // Finds the existing treatment record
                    var existingTreatment = db.TreatmentRecord.FirstOrDefault(t =>
                        t.treatmentID == treatment.treatmentID &&
                        t.userID == userId &&
                        t.patientID == treatment.patientID);

                    if (existingTreatment == null)
                    {
                        return Json(new { success = false, message = "Treatment record not found" });
                    }

                    // Updates the existing treatment record
                    try
                    {
                        existingTreatment.description = treatment.description;
                        existingTreatment.treatmentDate = DateTime.Parse(treatment.treatmentDate);
                    }
                    catch (FormatException ex)
                    {
                        return Json(new { success = false, message = "Invalid data format" });
                    }

                    // Gets document metadata
                    var document = db.DocumentMetadata
                        .FirstOrDefault(d => d.userID == userId && d.patientID == treatment.patientID);

                    if (document == null)
                    {
                        return Json(new { success = false, message = "Document not found" });
                    }

                    // Updates the document name
                    document.docName = "Treatment Record Updated";

                    // Grabs the most previous modification history record
                    var lastMod = db.ModificationHistory
                        .ToList()
                        .OrderByDescending(m => int.Parse(m.modificationNum))
                        .FirstOrDefault();

                    // If there is no previous modification history record, set the new modification number to 1
                    // Otherwise increment the modification number
                    string newModNum = "1";
                    if (lastMod != null)
                    {
                        int currentNum = int.Parse(lastMod.modificationNum);
                        newModNum = (currentNum + 1).ToString();
                    }

                    // Creates new modification history entry
                    var modHistory = new ModificationHistory
                    {
                        docID = document.docID,
                        dateOfModification = DateTime.Now,
                        descrption = treatment.editDescription ?? "Treatment record updated",
                        modificationNum = newModNum
                    };

                    // Adds the new modification history entry to the database
                    // Saves the changes to the database and commits the transaction
                    db.ModificationHistory.Add(modHistory);
                    db.SaveChanges();
                    transaction.Commit();

                    return Json(new { success = true, message = "Treatment update successful" });
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Error: {ex.Message}");
                    return Json(new { success = false, message = "An error occurred" });
                }
            }
        }


        // Updates the patient record based on a given patientRecord given in the form of a PatientEdit object
        //POST: MyBoard/handleEditHistory
        [HttpPost]
        public ActionResult HandleEditHistory([ModelBinder(typeof(JsonModelBinder))] PatientEdit patient)
        {
            using (var transaction = db.Database.BeginTransaction())
            {
                try
                {
                    if (patient == null)
                    {
                        return Json(new { success = false, message = "Invalid patient data" });
                    }

                    // Finds the existing patient record
                    var existingPatient = db.PatientRecord.Find(patient.ID);
                    if (existingPatient == null)
                    {
                        return Json(new { success = false, message = "Patient not found" });
                    }


                    // Updates the existing patient record
                    try
                    {
                        existingPatient.name = patient.name;
                        existingPatient.address = patient.address;
                        existingPatient.dateOfBirth = DateTime.Parse(patient.dateOfBirth);
                        existingPatient.height = float.Parse(patient.height);
                        existingPatient.weight = float.Parse(patient.weight);
                        existingPatient.bloodGroup = patient.bloodGroup;
                        existingPatient.bedID = patient.bedID;
                        existingPatient.treatmentArea = patient.treatmentArea;
                    }
                    catch (FormatException ex)
                    {
                        return Json(new { success = false, message = "Invalid data format" });
                    }

                    // Checks if UserID exists in session
                    if (Session["UserID"] == null)
                    {
                        return Json(new { success = false, message = "User session not found" });
                    }

                    System.Diagnostics.Debug.WriteLine(patient.ID.ToString());
                    System.Diagnostics.Debug.WriteLine(Session["UserID"]);
                    System.Diagnostics.Debug.WriteLine(patient.description);
                    // Grabs the userID of the currently logged in user from the session
                    string userId = Session["UserID"]?.ToString();
                    string patientId = patient.ID;

                    // Grabs the document metadata
                    var document = db.DocumentMetadata
                        .Where(d => d.userID == userId && d.patientID == patientId)
                        .FirstOrDefault();

                    if (document == null)
                    {
                        return Json(new { success = false, message = "Document not found" });
                    }

                    // Updates document name to show that the patient record has been updated
                    document.docName = "Patient Record Updated";

                    System.Diagnostics.Debug.WriteLine("HELLO");

                    // Grab the most recent modification history record
                    var lastMod = db.ModificationHistory
                        .ToList()
                        .OrderByDescending(m => int.Parse(m.modificationNum))
                        .FirstOrDefault();

                    // If there is no previous modification history record set the new modification number to 1
                    // Otherwise increment the modification number
                    string newModNum = "1";
                    if (lastMod != null)
                    {
                        int currentNum = int.Parse(lastMod.modificationNum);
                        newModNum = (currentNum + 1).ToString();
                    }

                    // Creates new modification history entry
                    var modHistory = new ModificationHistory
                    {
                        docID = document.docID,
                        dateOfModification = DateTime.Now,
                        descrption = patient.description ?? "Patient record updated",
                        modificationNum = newModNum
                    };

                    // Adds the new modification history entry to the database
                    // Saves the changes to the database and commits the transaction
                    db.ModificationHistory.Add(modHistory);
                    db.SaveChanges();
                    transaction.Commit();

                    return Json(new { success = true, message = "Update successful" });
                }
                catch (Exception ex)
                {
                    // Log the exception details here
                    return Json(new { success = false, message = "An error occurred" });
                }
            }
        }
    }
}
