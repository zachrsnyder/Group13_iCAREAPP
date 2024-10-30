import {React, useEffect, useState, createElement, useRef} from 'react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import html2pdf from 'html2pdf.js'
import { React } from 'react'
//import { type } from 'whoops'



//TODO: Add box for failing to add doc.
//TODO:

const AddDocumentModal = ({setShowAddModal}) => {
  
    const [newDocument, setDocument] = useState({
        Name: "",
        patientID: "",
        htmlContent: "",
    })
    const [patients, setPatients] = useState([])
    const [error, setError] = useState('')
    const [loadingPatients, setLoadingPatients] = useState(true)

    const editorContent = useRef('');

    const handleEditorChange = (event, editor) => {
      editorContent.current = editor.getData(); // Store editor content
    };

    const fetchPatients = async () => {
        try {

            //TODO: CHange back to MyPAtiennts
            const response = await fetch('/PatientRecords/GetAllPatients', {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch patients');
            }

            const data = await response.json();
            setPatients(data);
            setLoadingPatients(false);
        } catch (err) {
            setError(err.message);
            setLoadingPatients(false);
        }
    };

    useEffect(() => {
        fetchPatients()
    }, [])



    const handleAddDoc = async(e) => {
        e.preventDefault();
        try{
            console.log("New document data: ", newDocument);


            if(newDocument.Name.endsWith("_Image")){
                newDocument.Name.replaceAll("_Image", "_Text")
            }
            const formData = new FormData();
            formData.append("Name", newDocument.Name)
            formData.append("PatientID", newDocument.patientID)

            ////TODO: clean doc
            //// Create a temporary div to hold the content
            //const tempDiv = document.createElement('div');
            //tempDiv.innerHTML = editorContent.current;
            //document.body.appendChild(tempDiv);

            const content = editorContent.current; // Get the current content from your editor
            const blob = new Blob([content], { type: 'text/plain' }); // Create a Blob from the content
            const file = new File([blob], newDocument.Name,  { type: 'text/plain' });

            formData.append("File", file)
            

            for (const [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }

            const url = 'DocumentMetadatas/AddDocument';
            const requestData = {
                method: 'POST',
                body: formData,
                credentials: 'include'
            };

            const response = await fetch(url, requestData);

            if (response.status == 400) {
                const errorText = await response.text();
                console.error('Error response text:', errorText);
                throw new Error(`Failed to create patient: ${errorText}`);
            }
        }catch(ex){
            console.log("Failed to add document.")
            console.log(ex);
        }
        setShowAddModal(false)
    }
  
    return (
    
    <div className='fixed inset-0 bg-opacity-50 bg-gray-400 flex justify-center align-center'>
        <div className="bg-white rounded-lg p-8 max-w-md w-full overvlow-y-scroll">
            {loadingPatients ? (
            <div>
                <h2>Loading Info...</h2>
            </div>
            ) : error === '' ? (<>
            <h2 className="text-2xl font-bold mb-4">Add New Document</h2>
                        <form onSubmit={handleAddDoc} className="space-y-4" encType="multipart/form-data">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        type="text"
                        value={newDocument.Name}
                        onChange={(e) => setDocument({ ...newDocument, Name: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Corresponding Patient</label>
                    <select
                        value={newDocument.patientID}
                        onChange={(e) => setDocument({ ...newDocument, patientID: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    >
                        <option key='' value=''></option>
                        {patients.map((patient) => (
                            <option key={patient.ID} value={patient.ID}>{patient.name} Id: {patient.ID}</option>
                        ))}
                    </select>
                </div>
                {/*<div>
                    <label htmlFor="fileUpload">Upload Document:</label>
                    <input type="file" id="fileUpload" onChange={(e) => setDocument({...newDocument, FileData: e.target.files[0]})} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Document Text</label>
                    <textarea
                        value={newDocument.text}
                        onChange={(e) => setDocument({ ...newDocument, text: e.target.value })}
                        crows="10"
                        cols="50"
                        style={{
                            width: "100%",
                            height: "200px",
                            padding: "10px",
                            fontSize: "16px",
                            resize: "vertical",
                        }}
                        required
                    />
                </div>*/}
                <div>
                    <CKEditor
                        editor={ClassicEditor}
                        data="<p>Start typing here...</p>"
                        onChange={handleEditorChange}
                        config={{
                        toolbar: [
                            'heading', '|', 'bold', 'italic', 'bulletedList', 'numberedList', '|',
                            'blockQuote', 'undo', 'redo'
                        ],
                        }}
                    />
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Add Document
                    </button>
                </div>
            </form>
            </>) : (
                <div>
                    <h2>Couldn't get necessary info.</h2>
                </div>
            )}
        </div>
    </div>    
  )
}

export default AddDocumentModal