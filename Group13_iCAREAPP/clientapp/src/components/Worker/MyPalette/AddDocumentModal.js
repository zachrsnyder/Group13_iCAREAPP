import React, { useEffect, useState, useRef } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { X, Loader2, Pill } from 'lucide-react';
import DrugInfoModal from './DrugInfoModal';

const DOCUMENT_TEMPLATES = {
    "": {
        name: "Custom Document",
        content: "<p>Start typing here...</p>"
    },
    "annual-checkup": {
        name: "Annual Checkup",
        content: `
            <h2>Annual Physical Examination</h2>
            <p><strong>Date:</strong> [Current Date]</p>
            
            <h3>Vital Signs</h3>
            <ul>
                <li>Blood Pressure: ___/___</li>
                <li>Heart Rate: ___ bpm</li>
                <li>Temperature: ___°F</li>
                <li>Respiratory Rate: ___ breaths/min</li>
                <li>Height: ___</li>
                <li>Weight: ___</li>
                <li>BMI: ___</li>
            </ul>

            <h3>Review of Systems</h3>
            <p>General Health:</p>
            <p>Cardiovascular:</p>
            <p>Respiratory:</p>
            <p>Gastrointestinal:</p>
            <p>Musculoskeletal:</p>

            <h3>Assessment & Plan</h3>
            <p>Assessment:</p>
            <p>Recommendations:</p>
            <p>Follow-up:</p>`
    },
    "prescription": {
        name: "Prescription Form",
        content: `
            <h2>Prescription</h2>
            <p><strong>Date:</strong> [Current Date]</p>
            
            <p><strong>Medication:</strong> _____________</p>
            <p><strong>Dosage:</strong> _____________</p>
            <p><strong>Frequency:</strong> _____________</p>
            <p><strong>Duration:</strong> _____________</p>
            <p><strong>Quantity:</strong> _____________</p>
            
            <p><strong>Special Instructions:</strong></p>
            <p>_____________</p>

            <p><strong>Refills:</strong> _____________</p>`
    },
    "progress-note": {
        name: "Progress Note",
        content: `
            <h2>Progress Note</h2>
            <p><strong>Date:</strong> [Current Date]</p>
            
            <h3>Subjective</h3>
            <p>Chief Complaint:</p>
            <p>History of Present Illness:</p>
            
            <h3>Objective</h3>
            <p>Vital Signs:</p>
            <p>Physical Examination:</p>
            
            <h3>Assessment</h3>
            <p>Diagnosis:</p>
            
            <h3>Plan</h3>
            <p>Treatment:</p>
            <p>Follow-up:</p>`
    }
};

const AddDocumentModal = ({ setShowAddModal }) => {
    const [showDrugInfo, setShowDrugInfo] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [newDocument, setDocument] = useState({
        Name: "",
        patientID: "",
        htmlContent: "",
    });
    const [editorInstance, setEditorInstance] = useState(null);
    const [patients, setPatients] = useState([]);
    const [error, setError] = useState('');
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const editorContent = useRef('');

    const handleTemplateChange = (templateId) => {
        setSelectedTemplate(templateId);
        if (editorInstance) {
            editorInstance.setData(DOCUMENT_TEMPLATES[templateId].content);
        }
        // Update document name based on template and patient
        if (templateId && newDocument.patientID) {
            const patient = patients.find(p => p.ID === newDocument.patientID);
            const templateName = DOCUMENT_TEMPLATES[templateId].name;
            const date = new Date().toISOString().split('T')[0];
            setDocument(prev => ({
                ...prev,
                Name: `${templateName} - ${patient.name} - ${date}`
            }));
        }
    };

    const handlePatientChange = (patientId) => {
        setDocument(prev => ({ ...prev, patientID: patientId }));
        // Update document name if template is selected
        if (selectedTemplate && patientId) {
            const patient = patients.find(p => p.ID === patientId);
            const templateName = DOCUMENT_TEMPLATES[selectedTemplate].name;
            const date = new Date().toISOString().split('T')[0];
            setDocument(prev => ({
                ...prev,
                Name: `${templateName} - ${patient.name} - ${date}`
            }));
        }
    };

    const handleDrugSelect = (drugName) => {
        if (editorInstance) {
            const currentContent = editorInstance.getData();
            editorInstance.setData(currentContent + ' ' + drugName);
        }
    };

    const handleEditorChange = (event, editor) => {
        editorContent.current = editor.getData();
    };

    const fetchPatients = async () => {
        try {
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

    const editorStyles = `
        .ck-content h1 { font-size: 2em; margin-bottom: 0.5em; font-weight: bold; }
        .ck-content h2 { font-size: 1.5em; margin-bottom: 0.4em; font-weight: bold; }
        .ck-content h3 { font-size: 1.17em; margin-bottom: 0.3em; font-weight: bold; }
        .ck-content p { margin-bottom: 1em; }
        .ck-content ul { margin-left: 1em; list-style-type: disc; }
        .ck-content ol { margin-left: 1em; list-style-type: decimal; }
        .ck-content strong { font-weight: bold; }
        .ck-content em { font-style: italic; }
    `;

    useEffect(() => {
        fetchPatients();
    }, []);

    const handleAddDoc = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (newDocument.Name.endsWith("_Image")) {
                newDocument.Name = newDocument.Name.replaceAll("_Image", "_Text");
            }

            const formData = new FormData();
            formData.append("Name", newDocument.Name);
            formData.append("PatientID", newDocument.patientID);

            const content = editorContent.current;
            const blob = new Blob([content], { type: 'text/plain' });
            const file = new File([blob], newDocument.Name, { type: 'text/plain' });
            formData.append("File", file);

            const response = await fetch('DocumentMetadatas/AddDocument', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (response.status === 400) {
                const errorText = await response.text();
                throw new Error(`Failed to create document: ${errorText}`);
            }

            setShowAddModal(false);
        } catch (ex) {
            console.error("Failed to add document:", ex);
            setError(ex.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        // Add custom styles to the document
        const styleSheet = document.createElement('style');
        styleSheet.textContent = editorStyles;
        document.head.appendChild(styleSheet);

        return () => {
            document.head.removeChild(styleSheet);
        };
    }, []);

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b">
                        <h2 className="text-xl font-semibold text-gray-800">Add New Document</h2>
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                            title="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {loadingPatients ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
                                <span className="ml-2 text-gray-600">Loading patient information...</span>
                            </div>
                        ) : error ? (
                            <div className="text-center p-4 bg-red-50 rounded-lg">
                                <p className="text-red-600">{error}</p>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleAddDoc} className="space-y-6" encType="multipart/form-data">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Patient</label>
                                        <div className="flex space-x-2">
                                            <select
                                                value={newDocument.patientID}
                                                onChange={(e) => handlePatientChange(e.target.value)}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                                                required
                                            >
                                                <option value="">Select a patient</option>
                                                {patients.map((patient) => (
                                                    <option key={patient.ID} value={patient.ID}>
                                                        {patient.name} (ID: {patient.ID})
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => setShowDrugInfo(true)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors inline-flex items-center"
                                            >
                                                <Pill className="h-4 w-4 mr-2" />
                                                Drug Info
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Document Template</label>
                                        <select
                                            value={selectedTemplate}
                                            onChange={(e) => handleTemplateChange(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                                        >
                                            <option value="">Custom Document</option>
                                            <option value="annual-checkup">Annual Checkup</option>
                                            <option value="prescription">Prescription Form</option>
                                            <option value="progress-note">Progress Note</option>
                                        </select>
                                    </div>

                                    {!selectedTemplate && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
                                            <input
                                                type="text"
                                                value={newDocument.Name}
                                                onChange={(e) => setDocument({ ...newDocument, Name: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                                                placeholder="Enter document name"
                                                required
                                            />
                                        </div>
                                    )}

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Document Content</label>
                                                <div className="border border-gray-300 rounded-lg">
                                                    <CKEditor
                                                        editor={ClassicEditor}
                                                        data={DOCUMENT_TEMPLATES[selectedTemplate].content}
                                                        onChange={handleEditorChange}
                                                        onReady={editor => {
                                                            setEditorInstance(editor);
                                                            // Ensure the editor container has sufficient height
                                                            const editorElement = editor.ui.getEditableElement();
                                                            editorElement.style.minHeight = '400px';
                                                        }}
                                                        config={{
                                                            toolbar: {
                                                                items: [
                                                                    'heading',
                                                                    '|',
                                                                    'fontSize',
                                                                    'fontFamily',
                                                                    '|',
                                                                    'bold',
                                                                    'italic',
                                                                    'underline',
                                                                    'strikethrough',
                                                                    '|',
                                                                    'alignment',
                                                                    '|',
                                                                    'numberedList',
                                                                    'bulletedList',
                                                                    '|',
                                                                    'indent',
                                                                    'outdent',
                                                                    '|',
                                                                    'link',
                                                                    'blockQuote',
                                                                    'insertTable',
                                                                    '|',
                                                                    'undo',
                                                                    'redo'
                                                                ],
                                                                shouldNotGroupWhenFull: true
                                                            },
                                                            heading: {
                                                                options: [
                                                                    { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                                                                    { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                                                                    { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                                                                    { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
                                                                ]
                                                            },
                                                            fontSize: {
                                                                options: [
                                                                    'tiny',
                                                                    'small',
                                                                    'default',
                                                                    'big',
                                                                    'huge'
                                                                ]
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                {/* Footer */}
                                <div className="flex justify-end space-x-3 pt-6 border-t">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center">
                                                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                                Adding...
                                            </span>
                                        ) : (
                                            'Add Document'
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
            <DrugInfoModal
                isOpen={showDrugInfo}
                onClose={() => setShowDrugInfo(false)}
                onDrugSelect={handleDrugSelect}
            />
        </>
    );
};

export default AddDocumentModal;