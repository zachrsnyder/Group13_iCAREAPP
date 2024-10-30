import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import { html2pdf } from 'html2pdf.js'
import React, {createElement, useRef} from 'react'


const EditDocModal = ({ docUrl }) => {

    const editorContent = useRef('');

    const handleEditorChange = (event, editor) => {
      editorContent.current = editor.getData(); // Store editor content
    };

    const saveAsPDF = () => {
        // Create a temporary div to hold the content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = editorContent.current;
        document.body.appendChild(tempDiv);

        // Convert the div's content to PDF
        html2pdf()
            .set({
                filename: 'document.pdf',
                html2canvas: { scale: 2 },
                jsPDF: { orientation: 'portrait' }
            })
            .from(tempDiv)
            .save()
            .then(() => document.body.removeChild(tempDiv)); // Clean up
        
    };
  
    return (
    <div>
        <h2>Document Editor</h2>
        <CKEditor
            editor={ClassicEditor}
            data="<p>Start typing here...</p>"
            onChange={handleEditorChange}
            config={{
            ckfinder: {
                uploadUrl: 'docUrl', // You may need a backend to handle this
            },
            toolbar: [
                'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|',
                'imageUpload', 'blockQuote', 'insertTable', 'undo', 'redo'
            ],
            }}
        />
        <button onClick={saveAsPDF} style={{ marginTop: '20px' }}>
            Save as PDF
        </button>
    </div>
  )
}

export default EditDocModal