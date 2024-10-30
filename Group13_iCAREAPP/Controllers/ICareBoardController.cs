//using System;
//using System.Collections.Generic;
//using System.Data;
//using System.Data.Entity;
//using System.Linq;
//using System.Net;
//using System.Web;
//using Newtonsoft.Json;
//using Newtonsoft.Json.Linq;
//using System.Web.Mvc;
//using Group13_iCAREAPP.Models;
//using Group13_iCAREAPP.ViewModels;
//using System.IO;

//namespace Group13_iCAREAPP.Controllers
//{
//    public class ICareBoardController : Controller
//    {
//        private Group13_iCAREDBEntities db = new Group13_iCAREDBEntities();

//        // GET: ICareBoard
//        public ActionResult Index()
//        {
//            return View();
//        }

//        // GET: ICareBoard/HospitalPatients
//        public ActionResult HospitalPatients()
//        {
//            try
//            {
//                // Get current user ID from authentication
//                var currentUserID = Session["UserID"].ToString();

//                // Find the WorkerGeoCode entry that matches the given workerID
//                var workerGeoCode = db.WorkerGeoCode.FirstOrDefault(wg => wg.workerID == currentUserID);
//                if (workerGeoCode == null)
//                {
//                    return HttpNotFound("Worker or GeoCode not found.");
//                }

//                // Get the geoID associated with the current user
//                var geoID = workerGeoCode.geoID;

//                // Get patients associated with the current user's geoID through PatientGeoCode
//                var patientRecords = (from p in db.PatientRecord
//                                      join pg in db.PatientGeoCode on p.ID equals pg.patientID
//                                      where pg.geoID == geoID
//                                      select new
//                                      {
//                                          ID = p.ID,
//                                          name = p.name,
//                                          address = p.address,
//                                          dateOfBirth = p.dateOfBirth.ToString().Replace("/Date(", "").Replace(")/", ""),
//                                          height = p.height,
//                                          weight = p.weight,
//                                          bloodGroup = p.bloodGroup,
//                                          bedID = p.bedID,
//                                          treatmentArea = p.treatmentArea
//                                      })
//                                      .Distinct()
//                                      .ToList();

//                // Debug logging
//                System.Diagnostics.Debug.WriteLine($"Found {patientRecords.Count} patients");
//                return Json(patientRecords, JsonRequestBehavior.AllowGet);
//            }
//            catch (Exception ex)
//            {
//                System.Diagnostics.Debug.WriteLine($"Error in HospitalPatients: {ex.Message}");
//                Response.StatusCode = 500;
//                return Json(new { error = ex.Message });
//            }
//        }

//        // GET: ICareBoard/Details
//        public ActionResult Details(string id)
//        {
//            if (id == null)
//            {
//                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
//            }
//            PatientRecord patientRecord = db.PatientRecord.Find(id);
//            if (patientRecord == null)
//            {
//                return HttpNotFound();
//            }
//            return View(patientRecord);
//        }

//        // GET: ICareBoard/Create
//        public ActionResult Create()
//        {
//            return View();
//        }
//    }
//}
