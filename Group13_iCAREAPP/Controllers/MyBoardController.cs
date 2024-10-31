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
        private Group13_iCAREDBEntities db = new Group13_iCAREDBEntities();


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

            System.Diagnostics.Debug.WriteLine($"Found {modificationList.Count} records for patientID {patientID}");
            return Json(modificationList, JsonRequestBehavior.AllowGet);
        }


        //POST: MyBoard/handleEditHistory
        [HttpPost]
        public ActionResult HandleEditHistory([ModelBinder(typeof(JsonModelBinder))] PatientEdit patient)
        {
            using (var transaction = db.Database.BeginTransaction())
            {
                try
                {
                    if (patient == null) // Add null check and validate ID
                    {
                        return Json(new { success = false, message = "Invalid patient data" });
                    }

                    var existingPatient = db.PatientRecord.Find(patient.ID);
                    if (existingPatient == null)
                    {
                        return Json(new { success = false, message = "Patient not found" });
                    }


                    // Update patient record
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

                    // Check if UserID exists in session
                    if (Session["UserID"] == null)
                    {
                        return Json(new { success = false, message = "User session not found" });
                    }

                    // Get document metadata - using FirstOrDefault for both queries
                    System.Diagnostics.Debug.WriteLine(patient.ID.ToString());
                    System.Diagnostics.Debug.WriteLine(Session["UserID"]);
                    System.Diagnostics.Debug.WriteLine(patient.description);
                    string userId = Session["UserID"]?.ToString();
                    string patientId = patient.ID;


                    var document = db.DocumentMetadata
                        .Where(d => d.userID == userId && d.patientID == patientId)
                        .FirstOrDefault();

                    System.Diagnostics.Debug.WriteLine("HELLO");


                    if (document == null)
                    {
                        return Json(new { success = false, message = "Document not found" });
                    }

                    // Update document name
                    document.docName = "Patient Record Updated";

                    System.Diagnostics.Debug.WriteLine("HELLO");

                    // Handle modification history
                    var lastMod = db.ModificationHistory
                        .ToList() // Bring data into memory first
                        .OrderByDescending(m => int.Parse(m.modificationNum))
                        .FirstOrDefault();


                    System.Diagnostics.Debug.WriteLine(lastMod);
                    System.Diagnostics.Debug.WriteLine("HELLO");


                    string newModNum = "1";
                    if (lastMod != null)
                    {
                        // Simple increment
                        int currentNum = int.Parse(lastMod.modificationNum);
                        newModNum = (currentNum + 1).ToString();
                    }



                    // Create new modification history entry
                    var modHistory = new ModificationHistory
                    {
                        docID = document.docID,
                        dateOfModification = DateTime.Now,
                        descrption = patient.description ?? "Patient record updated",
                        modificationNum = newModNum
                    };

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
