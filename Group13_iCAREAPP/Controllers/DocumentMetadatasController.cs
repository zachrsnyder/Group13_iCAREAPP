﻿using System;
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
using iTextSharp.tool.xml;
using System.Text.RegularExpressions;
using iTextSharp.text.pdf.parser;
using System.Text;
using System.ComponentModel.DataAnnotations;
using Org.BouncyCastle.Asn1.Misc;
using WebGrease;

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


        // template class to structure the payload of the form data sent by the frontend.
        public class DocumentUploadModel
        {
            public string Name { get; set; }
            public string PatientID { get; set; }

            public HttpPostedFileBase File { get; set; }


        }

        

        // takes html content and translates it into a pdf, so it can then be blobified.
        public byte[] GeneratePdf(string htmlContent)
        {

            System.Diagnostics.Debug.WriteLine(htmlContent);
            // Setup iTextSharp document and writer
            using (var stream = new MemoryStream())
            {
                var document = new Document(PageSize.A4, 25, 25, 30, 30);
                PdfWriter writer = PdfWriter.GetInstance(document, stream);
                document.Open();

                // Parse the HTML content with XMLWorkerHelper
                using (var htmlStream = new StringReader(htmlContent))
                {
                    XMLWorkerHelper.GetInstance().ParseXHtml(writer, document, htmlStream);
                }

                document.Close();
                byte[] pdfData = stream.ToArray();

                // Return the PDF as a downloadable file
                return pdfData;
            }
        }

        //takes a file base and text or image and turns it into a pdf.
        public byte[] Pdfafy(string name, HttpPostedFileBase file){
            using (var memoryStream = new MemoryStream())
            {
                Document pdfDoc = new Document();
                PdfWriter.GetInstance(pdfDoc, memoryStream);
                pdfDoc.Open();

                if (file != null)
                {
                    if (!name.EndsWith("_Image"))
                    {
                        System.Diagnostics.Debug.WriteLine("Uploading Text File");

                        // Handle .txt file: Read the text and add it to the PDF
                        using (var reader = new StreamReader(file.InputStream))
                        {
                            string textContent = reader.ReadToEnd();
                            // Add the text as plain text, preserving the HTML-like content
                            var preformattedText = new Paragraph(textContent, FontFactory.GetFont(FontFactory.COURIER, 10, BaseColor.BLACK));
                            pdfDoc.Add(preformattedText);
                        }
                    }
                    else
                    {
                        System.Diagnostics.Debug.WriteLine("Uploading Image File");

                        // Handle image file: Convert to iTextSharp image and add to PDF
                        var image = iTextSharp.text.Image.GetInstance(file.InputStream);
                        image.ScaleToFit(pdfDoc.PageSize.Width - 50, pdfDoc.PageSize.Height - 50); // Scale image to fit page with margin
                        image.Alignment = iTextSharp.text.Image.ALIGN_CENTER;
                        pdfDoc.Add(image);
                    }
                }

                pdfDoc.Close();
                return memoryStream.ToArray();
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
            System.Diagnostics.Debug.WriteLine($"Name: {payload.Name}");
            System.Diagnostics.Debug.WriteLine($"PatientID: {payload.PatientID}");
           
            var file = payload.File;
            byte[] pdfBytes = Pdfafy(payload.Name, payload.File);


            
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
                        FileData = pdfBytes,
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
                    System.Diagnostics.Debug.WriteLine($"Error adding documents: {ex.Message}");
                    System.Diagnostics.Debug.WriteLine($"Stack trace: {ex.StackTrace}");
                    return Json(new { status = 400, error = "Failed to add user" });
                }
            }
            return Json(new { status = 200 });
        }


        // Extracts the raw html from the pdf blob.
        public string ExtractTextFromPdfBytes(byte[] pdfBytes)
        {
            using (var reader = new PdfReader(pdfBytes))
            {
                var text = new StringBuilder();

                for (int i = 1; i <= reader.NumberOfPages; i++)
                {
                    // Extract text from each page
                    text.Append(PdfTextExtractor.GetTextFromPage(reader, i));
                    text.Append("\n"); // Optional: Add a newline for each page
                }

                return text.ToString(); // Return the concatenated text of all pages
            }
        }



        // handles get requests for text document html.
        [HttpGet]
        [Route("Document/html/{id}")]
        public ActionResult GetHtml(string id){
            System.Diagnostics.Debug.WriteLine($"Grabbing Html: {id}");
            try
            {
                var query = from doc in db.DocumentStorage
                            where doc.Id == id select new
                            {
                                fileData = doc.FileData
                            };
                var result = query.ToList()[0];
                string html = ExtractTextFromPdfBytes(result.fileData);
                return Json(new { html = html }, JsonRequestBehavior.AllowGet);
            }catch(Exception ex){
                System.Diagnostics.Debug.WriteLine($"Get documents error! Stack trace: {ex}");
                return Json(new { error = "Failed to get document." }, JsonRequestBehavior.AllowGet);
            }
        }


        // handles get requests for all doc types, checks for _Image tag at the end of the name string and handles images and docs accordingly.
        // GET: Document
        [HttpGet]
        [Route("Document/{name}/{id}")]
        public ActionResult GetDocument(string name, string id)
        {
            System.Diagnostics.Debug.WriteLine(id);
            System.Diagnostics.Debug.WriteLine(name);
            try
            {
                var query = from doc in db.DocumentStorage
                            where doc.Id == id select new
                            {
                                fileData = doc.FileData
                            };
                var result = query.ToList();

                if(!name.EndsWith("_Image")){
                    string html = ExtractTextFromPdfBytes(result[0].fileData);
                    return File(GeneratePdf(html), "application/pdf");
                }else{

                    
                    System.Diagnostics.Debug.WriteLine(result[0]);
                    return File(result[0].fileData, "application/pdf");
                }
            }
            catch (Exception st)
            {
                System.Diagnostics.Debug.WriteLine($"Get documents error! Stack trace: {st}");
                return Json(new { error = "Failed to get document." }, JsonRequestBehavior.AllowGet);
            }
        }

        // edit payload for form data when editing an image.
        public class EditedPayloadImage{
             public string Title {get; set;}
             public string DocumentId {get; set;}
        }



        // Handles post request to modify an image in the db, takes the EditedPayloadImage object sent by the user.
        [HttpPost]
        [Route("Document/Edit/Image")]
        public ActionResult Edit(EditedPayloadImage payload){
            System.Diagnostics.Debug.WriteLine($"Grabbing Html: {payload.Title}");
            try{
                var query = from doc in db.DocumentMetadata
                            where doc.docID == payload.DocumentId
                            select doc;
                var document = query.SingleOrDefault();


                

                if (document != null){
                    document.userID = Session["UserID"].ToString();
                    document.docName = payload.Title;
                    db.Entry(document).State = EntityState.Modified;

                    db.SaveChanges();
                    return Json(new { status=200});
                }else{
                    System.Diagnostics.Debug.WriteLine("Document not found");
                    return Json(new { error="Document not found"});
                }
            }catch(Exception ex){
                System.Diagnostics.Debug.WriteLine("Error editing Image");
                return Json(new { error=$"Document edit failed {ex.StackTrace}"});
            }
        }


        // Form data format for tect editting
        public class EditedPayloadText{
            public string Title {get; set;}
            
            public string DocumentId {get; set;}

            public HttpPostedFileBase file { get; set; }
        }


        // Takes the EditedPayloadText with a file base so that the text within the docunment can also be edited.
        [HttpPost]
        [Route("Document/Edit/Html")]
        public ActionResult Edit(EditedPayloadText payload){
            System.Diagnostics.Debug.WriteLine($"Grabbing Html: {payload.Title}");
            System.Diagnostics.Debug.WriteLine($"Grabbing Html: {payload.file}");
            try{

                byte[] pdfHtml = Pdfafy(payload.Title, payload.file);

                var query = from doc in db.DocumentMetadata
                            where doc.docID == payload.DocumentId
                            select doc;
                var document = query.SingleOrDefault();

                var query2 = from doc in db.DocumentStorage
                            where doc.Id == payload.DocumentId
                            select doc;
                var documentStorage = query2.SingleOrDefault();

                // Mark both entities as modified
               


                if (document != null && documentStorage != null){
                    document.userID = Session["UserID"].ToString();
                    document.docName = payload.Title;
                    documentStorage.FileData = pdfHtml;
                    db.Entry(document).State = EntityState.Modified;
                    db.Entry(documentStorage).State = EntityState.Modified;

                    db.SaveChanges();
                    return Json(new { status=200});
                }else{
                    System.Diagnostics.Debug.WriteLine("Document not found");
                    return Json(new { error="Document not found"});
                }
            }catch(Exception ex){
                System.Diagnostics.Debug.WriteLine("Error editing Image");
                return Json(new { error=$"Document edit failed {ex.StackTrace}"});
            }
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


        // only need the id of the document to delete it from the db.
        public class DeletePayload{
            public string Id {get; set;}
        }
        

        // takes the id of a document and deletes its document metadata, this will cascade to doc storage and delete that as well.
        [HttpPost]
        [Route("Document/Delete")]
        public ActionResult DeleteConfirmed(DeletePayload payload)
        {
            try{
                DocumentMetadata documentMetadata = db.DocumentMetadata.Find(payload.Id);
                db.DocumentMetadata.Remove(documentMetadata);
                db.SaveChanges();
                return Json(new {status=200, message=$"Document of payload.Id: {payload.Id} deleted"});
            }catch(Exception ex){
                System.Diagnostics.Debug.WriteLine($"Error deleting from the database: {ex.StackTrace}");
                return Json(new {status=404, error=ex.StackTrace});
            }
            
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
