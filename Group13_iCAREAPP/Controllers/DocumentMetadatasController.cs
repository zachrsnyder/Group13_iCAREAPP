using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using Group13_iCAREAPP.Models;
using System.Data.SqlClient;
using System.Data.Entity.Infrastructure;


namespace Group13_iCAREAPP.Controllers
{
    public class DocumentMetadatasController : Controller
    {
        private Group13_iCAREDBEntities db = new Group13_iCAREDBEntities();

        // GET: DocumentMetadatas
        public ActionResult Index()
        {

            try
            {
                var query = from doc in db.DocumentMetadata
                            join user in db.iCAREUser on doc.userID equals user.ID
                            join patient in db.PatientRecord on doc.patientID equals patient.ID
                            select new
                            {
                                documentID = doc.docID,
                                documentTitle = doc.docName,
                                documentDate = doc.dateOfCreation,
                                userName = user.name,
                                userRole = user.profession,
                                patientName = patient.name
                            };

                // executes the query and gets the results
                var documentDetails = query.ToList();
                return Json(documentDetails, JsonRequestBehavior.AllowGet);
            }
            catch (Exception st)
            {
                System.Diagnostics.Debug.WriteLine($"Get documents error! Stack trace: {st}");
                return Json(new { error = "Failed to get document details." }, JsonRequestBehavior.AllowGet);
            }
        }

        // GET: DocumentMetadatas/Details/5
        public ActionResult Details(string id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            DocumentMetadata documentMetadata = db.DocumentMetadata.Find(id);
            if (documentMetadata == null)
            {
                return HttpNotFound();
            }
            return View(documentMetadata);
        }

        // POST: DocumentMetadatas/AddDocument
        // To protect from overposting attacks, enable the specific properties you want to bind to, for 
        // more details see https://go.microsoft.com/fwlink/?LinkId=317598.
        //Edited HttpPost to support creation of document metadata as well as creation of the document itself. Assumes document is already converted to BLOB form.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult AddDocument()
        {
            try
            {
                //Read and parse request body
                var jsonReader = new System.IO.StreamReader(Request.InputStream);
                jsonReader.BaseStream.Position = 0;
                var jsonString = jsonReader.ReadToEnd();

                var serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
                dynamic docData = serializer.Deserialize<dynamic>(jsonString);

                string newId = Guid.NewGuid().ToString();

                using (var transaction = db.Database.BeginTransaction())
                {
                    try
                    {
                        var metaData = new DocumentMetadata
                        {
                            docID = newId,
                            docName = docData["docName"],
                            dateOfCreation = DateTime.Now.ToString(),
                            patientID = docData["patientID"],
                            userID = Session["UserID"].ToString(),
                        };

                        var document = new DocumentStorage
                        {
                            Id = newId,
                            FileData = docData["docData"]
                        };
                        db.DocumentMetadata.Add(metaData);
                        db.DocumentStorage.Add(document);

                        transaction.Commit();

                        return Json(new { status = 200 });

                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        System.Diagnostics.Debug.WriteLine($"Transaction ran into an error: {ex.Message}");
                        throw new Exception("Failed transaction");
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error adding user: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"Stack trace: {ex.StackTrace}");
                return Json(new { status = 400, error = "Failed to add user" });
            }
        }

        // GET: DocumentMetadatas/Edit/5
        public ActionResult Edit(string id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            DocumentMetadata documentMetadata = db.DocumentMetadata.Find(id);
            if (documentMetadata == null)
            {
                return HttpNotFound();
            }
            ViewBag.userID = new SelectList(db.iCAREUser, "ID", "name", documentMetadata.userID);
            ViewBag.patientID = new SelectList(db.PatientRecord, "ID", "name", documentMetadata.patientID);
            return View(documentMetadata);
        }

        // POST: DocumentMetadatas/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to, for 
        // more details see https://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit([Bind(Include = "docID,docName,dateOfCreation,patientID,userID")] DocumentMetadata documentMetadata)
        {
            if (ModelState.IsValid)
            {
                db.Entry(documentMetadata).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            ViewBag.userID = new SelectList(db.iCAREUser, "ID", "name", documentMetadata.userID);
            ViewBag.patientID = new SelectList(db.PatientRecord, "ID", "name", documentMetadata.patientID);
            return View(documentMetadata);
        }

        // GET: DocumentMetadatas/Delete/5
        public ActionResult Delete(string id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            DocumentMetadata documentMetadata = db.DocumentMetadata.Find(id);
            if (documentMetadata == null)
            {
                return HttpNotFound();
            }
            return View(documentMetadata);
        }

        // POST: DocumentMetadatas/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(string id)
        {
            DocumentMetadata documentMetadata = db.DocumentMetadata.Find(id);
            db.DocumentMetadata.Remove(documentMetadata);
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
