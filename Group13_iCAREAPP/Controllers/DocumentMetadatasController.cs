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
using System.Diagnostics;
using System.Media;
//using Microsoft.AspNetCore.Http;
using System.IO;
using System.Security.Cryptography;
using iTextSharp.text;
using iTextSharp.text.pdf;

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

        public class DocumentUploadModel
        {
            public string Name { get; set; }
            public string PatientID { get; set; }

            //[Microsoft.AspNetCore.Mvc.ModelBinding.BindRequired]
            public HttpPostedFileBase FileData { get; set; }

            public string text {  get; set; }
        }

        public byte[] CreatePdfWithImageAndText(Stream imageStream, string userText)
        {

            System.Diagnostics.Debug.WriteLine(imageStream, userText);
            using (var pdfStream = new MemoryStream())
            {
                // Set up the PDF document with standard A4 size
                var document = new Document(PageSize.A4);
                PdfWriter.GetInstance(document, pdfStream);
                document.Open();

                // Add the text input to the PDF
                if (!string.IsNullOrEmpty(userText))
                {
                    var font = FontFactory.GetFont(FontFactory.HELVETICA, 12, BaseColor.BLACK);
                    var paragraph = new Paragraph(userText, font);
                    paragraph.SpacingAfter = 20f; // Add spacing after the text
                    document.Add(paragraph);
                }

                // Add the image to the PDF, if an image stream is provided
                if (imageStream != null)
                {
                    var image = iTextSharp.text.Image.GetInstance(imageStream);
                    image.ScaleToFit(PageSize.A4.Width - 50, PageSize.A4.Height / 2); // Scale image to fit
                    image.Alignment = Element.ALIGN_CENTER;
                    document.Add(image);
                }

                document.Close();
                return pdfStream.ToArray();
            }
        }



        // POST: DocumentMetadatas/AddDocument
        // To protect from overposting attacks, enable the specific properties you want to bind to, for 
        // more details see https://go.microsoft.com/fwlink/?LinkId=317598.
        //Edited HttpPost to support creation of document metadata as well as creation of the document itself. Assumes document is already converted to BLOB form.
        [HttpPost]
        [Route("DocumentMetadatas/AddDocument")]
        public ActionResult AddDocument(DocumentUploadModel payload)
        {
            System.Diagnostics.Debug.WriteLine("Attempoting to add document");

            try
            { 

                byte[] fileData = CreatePdfWithImageAndText(payload.FileData.InputStream, payload.text);


                System.Diagnostics.Debug.WriteLine($"FileByteString: {fileData}");

                string newId = Guid.NewGuid().ToString();

                using (var transaction = db.Database.BeginTransaction())
                {
                    try
                    {
                        var metaData = new DocumentMetadata
                        {
                            docID = newId,
                            docName = payload.Name,
                            dateOfCreation = DateTime.Now.ToString(),
                            patientID = payload.PatientID,
                            userID = Session["UserID"].ToString(),
                        };


                        var document = new DocumentStorage
                        {
                            Id = newId,
                            FileData = fileData,
                        };
                        System.Diagnostics.Debug.WriteLine(document.FileData.Length);

                        db.DocumentMetadata.Add(metaData);
                        db.DocumentStorage.Add(document);
                        System.Diagnostics.Debug.WriteLine("Attempting to save changes");
                        db.SaveChanges();
                        transaction.Commit();
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        System.Diagnostics.Debug.WriteLine($"Transaction ran into an error: {ex.Message}");
                        throw new Exception("Failed transaction");
                    }
                }
                return Json(new { status = 200 });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error adding user: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"Stack trace: {ex.StackTrace}");
                return Json(new { status = 400, error = "Failed to add user" });
            }
        }

        // GET: Document
        [HttpGet]
        [Route("Document/{id}")]
        public ActionResult GetDocument(string id)
        {
            System.Diagnostics.Debug.WriteLine(id);
            try
            {
                var query = from doc in db.DocumentStorage
                            where doc.Id == id select new
                            {
                                fileData = doc.FileData
                            };
                var result = query.ToList();
                System.Diagnostics.Debug.WriteLine(result[0]);
                return File(result[0].fileData, "application/pdf");
            }
            catch (Exception st)
            {
                System.Diagnostics.Debug.WriteLine($"Get documents error! Stack trace: {st}");
                return Json(new { error = "Failed to get document." }, JsonRequestBehavior.AllowGet);
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
