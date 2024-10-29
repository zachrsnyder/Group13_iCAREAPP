import {React, useEffect, useState} from 'react'

const DocumentViewModal = ({ doc }) => {

    const [isLoading, setIsLoading] = useState(true)
    const [pdfUrl, setPdfUrl] = useState(null);

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
    <div className='fixed inset-0 bg-opacity-50 bg-gray-400 flex justify-center align-center'>
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
              {isLoading ? (
                  <div><h2>Loading...</h2></div>
              ) : (
                  <iframe src={pdfUrl} width="100%" height="600px" title="PDF Viewer"></iframe>
              )}
        </div>
    </div>
  )
}

export default DocumentViewModal