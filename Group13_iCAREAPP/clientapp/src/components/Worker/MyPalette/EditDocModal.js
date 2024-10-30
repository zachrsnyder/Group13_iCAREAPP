import React, { useRef, useEffect, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { X, Save, Loader2 } from 'lucide-react';

const EditDocModal = ({ doc, isText, setShowAll, setShowEditor, setShowDoc }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const editorContent = useRef('');
    const [editedDoc, setEditedDoc] = useState(doc);
    const [pdfUrl, setPdfUrl] = useState('');
    const [startingHtml, setStartingHtml] = useState('');
    const [error, setError] = useState('');

    const fetchImage = async () => {
        try {
            const url = `Document/${doc.documentTitle}/${doc.documentID}`;
            const query = await fetch(url, {
                method: "GET",
                credentials: 'include',
            });
            const pdfBlob = await query.blob();
            const pdfUrl = URL.createObjectURL(pdfBlob);
            setPdfUrl(pdfUrl);
        } catch (error) {
            setError('Failed to load image document');
            console.error('Error fetching image:', error);
        }
    };

    const fetchDocHtml = async (ID) => {
        try {
            const url = `Document/html/${ID}`;
            const query = await fetch(url, {
                method: "GET",
                credentials: 'include',
            });
            const html = await query.json();
            setStartingHtml(html.html);
        } catch (error) {
            setError('Failed to load document content');
            console.error('Error fetching HTML:', error);
        }
    };

    useEffect(() => {
        const loadDocument = async () => {
            setShowDoc(false);
            try {
                if (doc.documentTitle.endsWith("_Image")) {
                    const newTitle = editedDoc.documentTitle.replace("_Image", "");
                    setEditedDoc(prev => ({ ...prev, documentTitle: newTitle }));
                    await fetchImage();
                } else {
                    await fetchDocHtml(doc.documentID);
                }
            } catch (error) {
                console.error('Error loading document:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDocument();

        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, []);

    const handleEditorChange = (event, editor) => {
        editorContent.current = editor.getData();
    };

    const saveAsPDF = async () => {
        setIsSaving(true);
        try {
            if (doc.documentTitle.endsWith("_Image")) {
                const title = editedDoc.documentTitle + "_Image";
                const url = "Document/Edit/Image";
                const data = new FormData();
                data.append("Title", title);
                data.append("DocumentId", editedDoc.documentID);

                const response = await fetch(url, {
                    method: "POST",
                    credentials: "include",
                    body: data
                });

                if (!response.ok) throw new Error('Failed to save image document');
            } else {
                const content = editorContent.current;
                const blob = new Blob([content], { type: 'text/plain' });
                const file = new File([blob], editedDoc.documentTitle, { type: 'text/plain' });
                const data = new FormData();

                data.append("Title", editedDoc.documentTitle);
                data.append("DocumentId", editedDoc.documentID);
                data.append("file", file);

                const response = await fetch("Document/Edit/Html", {
                    method: "POST",
                    credentials: "include",
                    body: data
                });

                if (!response.ok) throw new Error('Failed to save document');
            }
            setShowAll(false);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setShowDoc(true);
        setShowEditor(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Edit Document</h2>
                    <button
                        onClick={handleCancel}
                        className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                        title="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
                            <span className="ml-2 text-gray-600">Loading document...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                            <p className="text-red-600">{error}</p>
                            <button
                                onClick={handleCancel}
                                className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
                                <input
                                    type="text"
                                    value={editedDoc.documentTitle}
                                    onChange={(e) => setEditedDoc({ ...editedDoc, documentTitle: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                                    required
                                />
                            </div>

                            <div className="flex-1 min-h-0">
                                {isText ? (
                                    <div className="border border-gray-300 rounded-lg">
                                        <CKEditor
                                            editor={ClassicEditor}
                                            data={startingHtml}
                                            onChange={handleEditorChange}
                                            config={{
                                                toolbar: [
                                                    'heading', '|', 'bold', 'italic', 'bulletedList', 'numberedList', '|',
                                                    'blockQuote', 'undo', 'redo'
                                                ],
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                                        <iframe
                                            src={pdfUrl}
                                            className="w-full h-[600px]"
                                            title="PDF Viewer"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!isLoading && !error && (
                    <div className="flex justify-end space-x-3 px-6 py-4 border-t">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={saveAsPDF}
                            disabled={isSaving}
                            className="flex items-center px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditDocModal;