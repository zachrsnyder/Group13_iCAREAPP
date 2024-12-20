﻿using System;
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
        // Database context
        private Group13_iCAREDBEntities db = new Group13_iCAREDBEntities();

        public ActionResult Index()
        {
            return View(db.PatientRecord.ToList());
        }

        // Grabs all patient records from the database
        // GET: PatientRecords/GetAllPatients
        public ActionResult GetAllPatients()
        {
            try
            {
                // Select all patient records from the database
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
                        geoCode = db.GeoCodes.Where(g => g.ID == p.patientGeoID)
                                           .Select(g => g.description)
                                           .FirstOrDefault() ?? "Unassigned",
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

                // Returns the patient records as a list
                return Json(patients, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                return Json(new { error = ex.Message });
            }
        }

        // Grabs all users from the database
        // GET: PatientRecords/GetAllUsers
        public ActionResult GetAllUsers()
        {
            try
            {
                // Select all users from the database
                var users = db.iCAREUser
                    .Select(u => new { u.ID, u.name, u.profession })
                    .ToList();

                // Returns all users as a lit
                return Json(users, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                return Json(new { error = ex.Message });
            }
        }

        // Class definition
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
            public string pateintGeoID { get; set; }
        }

        // Creates a new patient record without an assignemnt, naming should be changed
        // But would creaet too many conflicts with the frontend
        // POST: PatientRecords/CreateWithAssignment
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
                        // Get the latest patient ID from the database
                        var lastPatientId = db.PatientRecord
                            .Where(p => p.ID.StartsWith("PAT"))
                            .Select(p => p.ID)
                            .OrderByDescending(id => id)
                            .FirstOrDefault();

                        // Generate the next patient ID based on the current highest one
                        string patientId;
                        if (lastPatientId == null)
                        {
                            patientId = "PAT01";
                        }
                        else
                        {
                            int currentNumber = int.Parse(lastPatientId.Substring(3));
                            patientId = $"PAT{(currentNumber + 1):D2}";
                        }

                        // Get the current users userID from the session and uses it to 
                        // get the userGeoID
                        var currentUserID = Session["UserID"]?.ToString();
                        var geocode = db.iCAREUser
                            .Where(u => u.ID == currentUserID)
                            .Select(u => u.userGeoID)
                            .FirstOrDefault();

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
                            treatmentArea = data.treatmentArea,
                            patientGeoID = geocode
                        };

                        // Add the new patient record to the database
                        db.PatientRecord.Add(patient);

                        // Create new document metadata
                        var docMeta = new DocumentMetadata
                        {
                            docID = "DOC" + DateTime.Now.Ticks.ToString().Substring(0, 8),
                            docName = "Created Patient",
                            dateOfCreation = DateTime.Now.ToString(),
                            patientID = patientId,
                            userID = Session["UserID"].ToString()
                        };

                        // Add the new document metadata to the database
                        // Saves and commits the transaction
                        db.DocumentMetadata.Add(docMeta);
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

        // Grabs all patient records based on the current user
        // GET: PatientRecords/MyPatients
        public ActionResult MyPatients()
        {
            try
            {
                // Get current user ID from session
                var currentUserID = Session["UserID"]?.ToString();

                // Debug logging
                System.Diagnostics.Debug.WriteLine($"Current User ID: {currentUserID}");

                // Get patients associated with the current user through DocumentMetadata
                var patientRecords = db.TreatmentRecord
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
                        treatmentArea = d.PatientRecord.treatmentArea,
                        patientGeoID = d.PatientRecord.patientGeoID
                    })
                    .Distinct()
                    .ToList();

                // Debug logging
                System.Diagnostics.Debug.WriteLine($"Found {patientRecords.Count} patients");

                // Return the patient records as a list
                return Json(patientRecords, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error in MyPatients: {ex.Message}");
                Response.StatusCode = 500;
                return Json(new { error = ex.Message });
            }
        }

        // Grabs all patient records based on the current user
        // GET: PatientRecords/Details
        public ActionResult Details(string id)
        {
            //Grabs the patient record based on the given id
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
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create([Bind(Include = "ID,name,address,dateOfBirth,height,weight,bloodGroup,bedID,treatmentArea")] PatientRecord patientRecord)
        {
            // Adds the patient record to the database and saves the changes
            if (ModelState.IsValid)
            {
                db.PatientRecord.Add(patientRecord);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            return View(patientRecord);
        }

        // GET: PatientRecords/Edit
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

        // POST: PatientRecords/Edit
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit([Bind(Include = "ID,name,address,dateOfBirth,height,weight,bloodGroup,bedID,treatmentArea")] PatientRecord patientRecord)
        {
            // Edits the patient record and saves the changes
            if (ModelState.IsValid)
            {
                db.Entry(patientRecord).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(patientRecord);
        }

        // GET: PatientRecords/Delete
        public ActionResult Delete(string id)
        {
            //Grabs the patient record based on the given id
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

        // POST: PatientRecords/Delete
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(string id)
        {
            //Deletes the patient record based on the given id
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
