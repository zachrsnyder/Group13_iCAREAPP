import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import React, { useRef, useEffect, useState} from 'react'


const EditDocModal = ({ doc, isText, setShowAll, setShowEditor, setShowDoc}) => {

    const [isLoading, setIsLoading] = useState(true)
    const editorContent = useRef('');
    const [editedDoc, setEditedDoc] = useState(doc)
    const [PdfUrl, setPdfUrl] = useState('')
    const [startingHtml, setStartingHtml] = useState('')


    const fetchImage = async() => {

        var url = "Document/" + doc.documentTitle + "/" + doc.documentID 

        var query = await fetch(url, {
            method: "GET",
            credentials: 'include',
        });

        //accept the byte array (formdata) as a blob! handy method fs.
        const pdfBlob = await query.blob();
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        setPdfUrl(pdfUrl);
        

        console.log(pdfBlob)
    }
    

    const fetchDocHtml = async(ID) => {
        const url = "Document/html/" + ID
        const query = await fetch(url, {
            method: "GET",
            credentials: 'include',
        })
        const html = await query.json()
        //bad naming conv but the json object holds html content in html
        console.log(html);
        setStartingHtml(html.html)
    }



    useEffect(() => {
        setShowDoc(false)
        if(doc.documentTitle.endsWith("_Image")){
            editedDoc.documentTitle.replace("_Image", "")
            fetchImage()
        }else{
            fetchDocHtml(doc.documentID)
        }
        
        setIsLoading(false)
    }, [])

    
    const handleEditorChange = (event, editor) => {
      editorContent.current = editor.getData(); // Store editor content
    };

    const saveAsPDF = async() => {
        if(doc.documentTitle.endsWith("_Image")){
            const title = editedDoc.documentTitle + "_Image"
            setEditedDoc({...editedDoc, documentTitle: title})
            const url = "Document/Edit/Image"

            const data = new FormData()

            data.append("Title", editedDoc.documentTitle)
            data.append("DocumentId", editedDoc.documentID)


            const body = {
                method: "Post",
                credentials: "include",
                body: data
            }
            const fetched = await fetch(url, body)
            const response = fetched.json()
            console.log(response)
        }else{
            const content = editorContent.current; // Get the current content from your editor
            const blob = new Blob([content], { type: 'text/plain' }); // Create a Blob from the content
            const file = new File([blob], editedDoc.documentTitle,  { type: 'text/plain' });

            const data = new FormData()

            data.append("Title", editedDoc.documentTitle)
            data.append("DocumentId", editedDoc.documentID)
            data.append("file", file)

            const url = "Document/Edit/Html"
            const body = {
                method: "Post",
                credentials: "include",
                body: data
            }
            const fetched = await fetch(url, body)
            const response = fetched.json()
            console.log(response)
        }
        setShowAll(false)
    };

    const handleCancel = () => {
        setShowDoc(true)
        setShowEditor(false)
    }
  
    return (
        <>
            <h2>Document Editor</h2>
            {!isLoading ? (
            <>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        type="text"
                        value={editedDoc.documentTitle}
                        onChange={(e) => setEditedDoc({ ...editedDoc, documentTitle: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder={doc.documentTitle}
                        required
                    />
                </div>
                {isText ? (
                    <CKEditor
                    editor={ClassicEditor}
                    data={startingHtml}
                    onChange={handleEditorChange}
                    config={{
                    ckfinder: {
                        uploadUrl: 'docUrl', // You may need a backend to handle this
                    },
                    toolbar: [
                        'heading', '|', 'bold', 'italic', 'bulletedList', 'numberedList', '|', 'blockQuote', 'undo', 'redo'
                    ],
                    }}
                    /> ) : (
                        <div>
                            <iframe src={PdfUrl} width="100%" height="600px" title="PDF Viewer"></iframe>
                        </div>
                    )}
                <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                    Cancel
                </button>
                <button onClick={saveAsPDF} style={{ marginTop: '20px' }}>
                    Save Changes
                </button>
            </>
            ) : (
            <div>
                <h2>Loading...</h2>
            </div>
            )}
        </> 
  )
}

export default EditDocModal