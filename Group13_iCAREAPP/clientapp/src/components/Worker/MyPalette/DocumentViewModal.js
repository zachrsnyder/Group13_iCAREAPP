import {React, useEffect, useState} from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import html2pdf from 'html2pdf.js';
import EditDocModal from './EditDocModal';


//TODO: Implement multipdf document so that edits can be made. Edit db to have an index of pdf so that images can be removed. Text pdf edits will
//TODO: Add templates for text.
//TODO: Separation of State


const DocumentViewModal = ({ doc, showDoc, selectedDoc }) => {

    const [isLoading, setIsLoading] = useState(true)
    const [pdfUrl, setPdfUrl] = useState(null);
    const [edit, setEdit] = useState(false)
    const [showView, setShowView] = useState(true)

    const isText = !doc.documentTitle.endsWith("_Image")

    const fetchDocument = async() => {

        var url = "Document/" + doc.documentTitle + "/" + doc.documentID 

        var query = await fetch(url, {
            method: "GET",
            credentials: 'include',
        });

        //accept the byte array (formdata) as a blob! handy method fs.
        const pdfBlob = await query.blob();
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        setPdfUrl(pdfUrl);
        setIsLoading(false)

        

        console.log(pdfBlob)
    }

  const handleDelete = async() => {
    var url = "Document/Delete"
    const formData = new FormData()
    formData.append("Id", doc.documentID)
    var query = await fetch(url, {
      method: "POST",
      credentials: "include",
      body: formData
    })

    const response = await query.json()

    console.log(response)

    selectedDoc(null)
    showDoc(false)
  }

  useEffect(() => {
    fetchDocument()
  }, [])

  return (
    <div className='fixed inset-0 bg-opacity-50 bg-gray-400 flex justify-between align-center'>
          {showView && (<div className={`bg-white rounded-lg p-8 w-full max-w-md `}>
            <div className="flex w-full align-middle justify-end">
              <div className="flex justify-between w-16">
                {!isLoading && (
                  <>
                    <button className="text-2xl text-gray-500 hover:text-red-500" onClick={() => { handleDelete() }}>Kill</button>
                    <button className="text-2xl text-gray-600 hover:text-blue-500" onClick={() => { setEdit(true)}}>Edit</button>
                  </>)}
                  <button className="text-2xl text-gray-600 hover:text-red-500" onClick={() => { selectedDoc(null); showDoc(false) }}>X</button>
              </div>
            </div>
              {isLoading ? (
                  <div><h2>Loading...</h2></div>
              ) : (

                  <div>
                    
                    <iframe src={pdfUrl} width="100%" height="600px" title="PDF Viewer"></iframe>
                  </div>
              )}
        </div>)}
        {edit && !isLoading && (
          <div className='bg-white rounded-lg w-full max-w-md p-8 overflow-y-auto'>
                  <EditDocModal doc={doc} isText={isText} setShowAll={showDoc} setShowEditor={setEdit} setShowDoc={setShowView}/>

          </div>
        )}

      
    </div>
  )
}

export default DocumentViewModal