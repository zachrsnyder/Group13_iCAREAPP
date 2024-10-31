import { React, useEffect, useState } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import html2pdf from 'html2pdf.js';
import EditDocModal from './EditDocModal';
import { X, Trash2, Edit2, Download } from 'lucide-react';

const DocumentViewModal = ({ doc, showDoc, selectedDoc }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [edit, setEdit] = useState(false);
    const [showView, setShowView] = useState(true);
    const isText = !doc.documentTitle.endsWith("_Image");

    const fetchDocument = async () => {
        try {
            const url = `Document/${doc.documentTitle}/${doc.documentID}`;
            const query = await fetch(url, {
                method: "GET",
                credentials: 'include',
            });
            const pdfBlob = await query.blob();
            const pdfUrl = URL.createObjectURL(pdfBlob);
            setPdfUrl(pdfUrl);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching document:', error);
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            try {
                const url = "Document/Delete";
                const formData = new FormData();
                formData.append("Id", doc.documentID);
                const query = await fetch(url, {
                    method: "POST",
                    credentials: "include",
                    body: formData
                });
                const response = await query.json();
                if (response.status === 200) {
                    selectedDoc(null);
                    showDoc(false);
                }
            } catch (error) {
                console.error('Error deleting document:', error);
            }
        }
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = doc.documentTitle;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        fetchDocument();
        // Cleanup function to revoke object URL
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[95vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {doc.documentTitle}
                    </h2>
                    <div className="flex items-center gap-3">
                        {!isLoading && (
                            <>
                                <button
                                    onClick={handleDownload}
                                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                                    title="Download"
                                >
                                    <Download className="h-5 w-5" />
                                </button>
                                {isText && (
                                    <button
                                        onClick={() => setEdit(true)}
                                        className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 className="h-5 w-5" />
                                    </button>
                                )}
                                <button
                                    onClick={handleDelete}
                                    className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => {
                                selectedDoc(null);
                                showDoc(false);
                            }}
                            className="p-2 text-gray-600 hover:text-gray-800 transition-colors ml-2"
                            title="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 h-full">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                        </div>
                    ) : (
                        <div className="h-full">
                            <iframe
                                src={pdfUrl}
                                className="w-full h-full rounded-lg border border-gray-200"
                                title="PDF Viewer"
                            />
                        </div>
                    )}
                </div>
            </div>

            {edit && !isLoading && (
                <EditDocModal
                    doc={doc}
                    isText={isText}
                    setShowAll={showDoc}
                    setShowEditor={setEdit}
                    setShowDoc={setShowView}
                />
            )}
        </div>
    );
};

export default DocumentViewModal;