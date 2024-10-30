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

namespace Group13_iCAREAPP.Controllers
{
    public class PatientRecordsController : Controller
    {
        private Group13_iCAREDBEntities db = new Group13_iCAREDBEntities();

        // GET: PatientRecords
        public ActionResult Index()
        {
            return View(db.PatientRecord.ToList());
        }

        // GET: PatientRecords/GetAllPatients
        public ActionResult GetAllPatients()
        {
            try
            {
                var patients = db.PatientRecord
                    .Select(p => new
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
                        assignedUser = p.TreatmentRecord
                            .OrderByDescending(tr => tr.treatmentDate)
                            .Select(tr => new
                            {
                                tr.iCAREUser.ID,
                                tr.iCAREUser.name
                            })
                            .FirstOrDefault()
                    })
                    .ToList();

                return Json(patients, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                return Json(new { error = ex.Message });
            }
        }

        // GET: PatientRecords/GetAllUsers
        public ActionResult GetAllUsers()
        {
            try
            {
                var users = db.iCAREUser
                    .Select(u => new { u.ID, u.name, u.profession })
                    .ToList();

                return Json(users, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                return Json(new { error = ex.Message });
            }
        }

        // Add this model class
        public class PatientCreateModel
        {
            public string name { get; set; }
            public string address { get; set; }
            public string dateOfBirth { get; set; }
            public string height { get; set; }
            public string weight { get; set; }
            public string bloodGroup { get; set; }
            public string bedID { get; set; }
            public string treatmentArea { get; set; }
            public string assignedUserID { get; set; }
        }

        [HttpPost]
        public ActionResult CreateWithAssignment([ModelBinder(typeof(JsonModelBinder))] PatientCreateModel data)
        {
            System.Diagnostics.Debug.WriteLine("Starting CreateWithAssignment");
            System.Diagnostics.Debug.WriteLine($"Received data: {JsonConvert.SerializeObject(data)}");

            try
            {
                if (data == null)
                {
                    Response.StatusCode = 400;
                    return Json(new { error = "No data received" });
                }

                using (var transaction = db.Database.BeginTransaction())
                {
                    try
                    {
                        // Generate a new ID for the patient
                        string patientId = "PAT" + DateTime.Now.Ticks.ToString().Substring(0, 8);

                        // Create new patient record
                        var patient = new PatientRecord
                        {
                            ID = patientId,
                            name = data.name,
                            address = data.address,
                            dateOfBirth = DateTime.Parse(data.dateOfBirth),
                            height = float.Parse(data.height),
                            weight = float.Parse(data.weight),
                            bloodGroup = data.bloodGroup,
                            bedID = data.bedID,
                            treatmentArea = data.treatmentArea
                        };

                        db.PatientRecord.Add(patient);

                        // Create document metadata
                        //var docMeta = new DocumentMetadata
                        //{
                        //    docID = "DOC" + DateTime.Now.Ticks.ToString().Substring(0, 8),
                        //    docName = "Initial Assignment",
                        //    dateOfCreation = DateTime.Now.ToString("yyyy-MM-dd"),
                        //    patientID = patientId,
                        //    userID = data.assignedUserID
                        //};

                        //db.DocumentMetadata.Add(docMeta);
                        db.SaveChanges();
                        transaction.Commit();

                        return Json(new { success = true, patientId = patientId });
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        throw;
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error in CreateWithAssignment: {ex.Message}");
                Response.StatusCode = 500;
                return Json(new { error = ex.Message });
            }
        }


        // GET: PatientRecords/MyPatients
        public ActionResult MyPatients()
        {
            try
            {
                // Get current user ID from authentication
                var currentUserID = Session["UserID"]?.ToString();

                // Debug logging
                System.Diagnostics.Debug.WriteLine($"Current User ID: {currentUserID}");

                // Get patients associated with the current user through DocumentMetadata
                var patientRecords = db.DocumentMetadata
                    .Where(d => d.userID == currentUserID)
                    .Select(d => new {
                        ID = d.PatientRecord.ID,
                        name = d.PatientRecord.name,
                        address = d.PatientRecord.address,
                        dateOfBirth = d.PatientRecord.dateOfBirth.ToString().Replace("/Date(", "").Replace(")/", ""),
                        height = d.PatientRecord.height,
                        weight = d.PatientRecord.weight,
                        bloodGroup = d.PatientRecord.bloodGroup,
                        bedID = d.PatientRecord.bedID,
                        treatmentArea = d.PatientRecord.treatmentArea
                    })
                    .Distinct()
                    .ToList();

                // Debug logging
                System.Diagnostics.Debug.WriteLine($"Found {patientRecords.Count} patients");

                return Json(patientRecords, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error in MyPatients: {ex.Message}");
                Response.StatusCode = 500;
                return Json(new { error = ex.Message });
            }
        }

        // GET: PatientRecords/Details/5
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

        // GET: PatientRecords/Create
        public ActionResult Create()
        {
            return View();
        }

        // POST: PatientRecords/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to, for 
        // more details see https://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create([Bind(Include = "ID,name,address,dateOfBirth,height,weight,bloodGroup,bedID,treatmentArea")] PatientRecord patientRecord)
        {
            if (ModelState.IsValid)
            {
                db.PatientRecord.Add(patientRecord);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            return View(patientRecord);
        }

        // GET: PatientRecords/Edit/5
        public ActionResult Edit(string id)
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

        // POST: PatientRecords/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to, for 
        // more details see https://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit([Bind(Include = "ID,name,address,dateOfBirth,height,weight,bloodGroup,bedID,treatmentArea")] PatientRecord patientRecord)
        {
            if (ModelState.IsValid)
            {
                db.Entry(patientRecord).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(patientRecord);
        }

        // GET: PatientRecords/Delete/5
        public ActionResult Delete(string id)
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

        // POST: PatientRecords/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(string id)
        {
            PatientRecord patientRecord = db.PatientRecord.Find(id);
            db.PatientRecord.Remove(patientRecord);
            db.SaveChanges();
            return RedirectToAction("Index");
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
