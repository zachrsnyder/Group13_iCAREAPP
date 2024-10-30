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

    const fetchDocument = async() => {
        var url = "Document/" + doc.documentID

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

  useEffect(() => {
    fetchDocument()
  }, [])

  return (
    <div className='fixed inset-0 bg-opacity-50 bg-gray-400 flex justify-between align-center'>
        <div className={`bg-white rounded-lg p-8 ${edit ? 'w-1/3' : 'w-full'} max-w-md `}>
              {isLoading ? (
                  <div><h2>Loading...</h2></div>
              ) : (

                  <div>
                    <div className="flex w-full align-middle justify-end">
                              <div className="flex justify-between w-16">
                                  <button className="text-2xl text-gray-600 hover:text-blue-500" onClick={() => { setEdit(true)}}>Edit</button>
                                  <button className="text-2xl text-gray-600 hover:text-red-500" onClick={() => { selectedDoc(null); showDoc(false) }}>X</button>
                              </div>
                    </div>
                    <iframe src={pdfUrl} width="100%" height="600px" title="PDF Viewer"></iframe>
                  </div>
              )}
        </div>
        {edit && !isLoading && (
          <div className='bg-white rounded-lg w-1/3'>
            <EditDocModal docUrl={pdfUrl}/>

          </div>
        )}

      
    </div>
  )
}

export default DocumentViewModal