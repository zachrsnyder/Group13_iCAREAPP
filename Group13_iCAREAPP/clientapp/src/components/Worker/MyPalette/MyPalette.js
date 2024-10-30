import React, { useState, useEffect } from 'react';
import DocCard from './DocCard';
import AddDocumentModal from './AddDocumentModal';
import DocumentViewModal from './DocumentViewModal';
import AddImageModal from './AddImageModal';
import { FileText, Image, Search } from 'lucide-react';

const MyPalette = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [documents, setDocuments] = useState([]);
    const [renderModal, setModal] = useState(false);
    const [renderImageModal, setRenderImageModal] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [showDoc, setShowDoc] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Keep existing functions
    const updateAddModal = (newState) => {
        setModal(false);
    };

    const updateAddImageModal = (newState) => {
        setRenderImageModal(false);
    };

    const fetchDocs = async () => {
        const response = await fetch('DocumentMetadatas', {
            credentials: 'include'
        });

        const json = await response.json();

        if (json.error) {
            console.log(`Error ${json.error}`);
        } else {
            console.log(json);
            setDocuments(json);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocs();
    }, [showDoc, renderModal, renderImageModal]);

    const filteredDocuments = documents.filter(doc =>
        doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.workerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex-1 flex flex-col">
            <main className="flex-1 overflow-y-auto p-6 ">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-lg shadow-xl border border-gray-200">
                        <div className="p-6">
                            {/* Header with icon and title */}
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center space-x-3">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        className="h-8 w-8"
                                    >
                                        <path
                                            d="M17.75,2 C18.9926407,2 20,3.00735931 20,4.25 L20,19.754591 C20,20.9972317 18.9926407,22.004591 17.75,22.004591 L6.25,22.004591 C5.00735931,22.004591 4,20.9972317 4,19.754591 L4,4.25 C4,3.05913601 4.92516159,2.08435508 6.09595119,2.00519081 L6.25,2 L17.75,2 Z M18.5,16 L5.5,16 L5.5,19.754591 C5.5,20.1688046 5.83578644,20.504591 6.25,20.504591 L17.75,20.504591 C18.1642136,20.504591 18.5,20.1688046 18.5,19.754591 L18.5,16 Z M7.75128856,17.5 L16.25,17.5 C16.6642136,17.5 17,17.8357864 17,18.25 C17,18.6296958 16.7178461,18.943491 16.3517706,18.9931534 L16.25,19 L7.75128856,19 C7.337075,19 7.00128856,18.6642136 7.00128856,18.25 C7.00128856,17.8703042 7.28344245,17.556509 7.64951801,17.5068466 L7.75128856,17.5 L16.25,17.5 L7.75128856,17.5 Z M17.75,3.5 L6.25,3.5 L6.14822944,3.50684662 C5.78215388,3.55650904 5.5,3.87030423 5.5,4.25 L5.5,14.5 L8,14.5 L8,12.2455246 C8,11.5983159 8.49187466,11.0659907 9.12219476,11.0019782 L9.25,10.9955246 L14.75,10.9955246 C15.3972087,10.9955246 15.9295339,11.4873992 15.9935464,12.1177193 L16,12.2455246 L16,14.5 L18.5,14.5 L18.5,4.25 C18.5,3.83578644 18.1642136,3.5 17.75,3.5 Z"
                                            fill="#FF1D48"
                                        />
                                    </svg>
                                    <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setRenderImageModal(true)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                                    >
                                        <Image className="h-4 w-4 mr-2" />
                                        Add New Image
                                    </button>
                                    <button
                                        onClick={() => setModal(true)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                                    >
                                        <FileText className="h-4 w-4 mr-2" />
                                        Add New Document
                                    </button>
                                </div>
                            </div>

                            {/* Search Bar */}
                            <div className="mb-6">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search documents..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                                </div>
                            </div>

                            {/* Table */}
                            {isLoading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="text-xl text-gray-600">Loading documents...</div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto overflow-y-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Created</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker Role</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredDocuments.map((document) => (
                                                <DocCard
                                                    key={document.id}
                                                    doc={document}
                                                    setShowDoc={setShowDoc}
                                                    setSelectedDoc={setSelectedDoc}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                    {filteredDocuments.length === 0 && (
                                        <div className="text-center py-12 text-gray-500">
                                            No documents found
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Modals */}
                {renderModal && !isLoading && (
                    <AddDocumentModal setShowAddModal={updateAddModal} />
                )}

                {renderImageModal && !isLoading && (
                    <AddImageModal setShowAddModal={updateAddImageModal} />
                )}

                {showDoc && selectedDoc && (
                    <DocumentViewModal doc={selectedDoc} showDoc={setShowDoc} selectedDoc={setSelectedDoc} />
                )}
            </main>
        </div>
    );
};

export default MyPalette;