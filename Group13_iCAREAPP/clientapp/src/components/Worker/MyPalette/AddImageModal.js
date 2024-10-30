import React, { useState, useEffect, useCallback } from 'react';
import { X, Upload, Image, Loader2 } from 'lucide-react';

const AddImageModal = ({ setShowAddModal }) => {
    const [newDocument, setDocument] = useState({
        Name: "",
        patientID: "",
        file: null
    });
    const [patients, setPatients] = useState([]);
    const [error, setError] = useState('');
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [preview, setPreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

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
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingPatients(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    // Create preview when file is selected
    useEffect(() => {
        if (!newDocument.file) {
            setPreview(null);
            return;
        }

        const objectUrl = URL.createObjectURL(newDocument.file);
        setPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [newDocument.file]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                setDocument(prev => ({ ...prev, file }));
            } else {
                setError('Please upload an image file');
            }
        }
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setDocument(prev => ({ ...prev, file: e.target.files[0] }));
        }
    };

    const handleAddDoc = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append("Name", newDocument.Name + "_Image");
            formData.append("PatientID", newDocument.patientID);
            formData.append("File", newDocument.file);

            const response = await fetch('DocumentMetadatas/AddDocument', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (response.status === 400) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            setShowAddModal(false);
        } catch (ex) {
            setError(ex.message || 'Failed to add document');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Upload Image Document</h2>
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
                    ) : (
                        <form onSubmit={handleAddDoc} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 rounded-lg text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
                                <input
                                    type="text"
                                    value={newDocument.Name}
                                    onChange={(e) => setDocument({ ...newDocument, Name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Patient</label>
                                <select
                                    value={newDocument.patientID}
                                    onChange={(e) => setDocument({ ...newDocument, patientID: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                                    required
                                >
                                    <option value="">Select a patient</option>
                                    {patients.map((patient) => (
                                        <option key={patient.ID} value={patient.ID}>
                                            {patient.name} (ID: {patient.ID})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
                                <div
                                    className={`border-2 border-dashed rounded-lg p-8 text-center ${isDragging ? 'border-rose-500 bg-rose-50' : 'border-gray-300'
                                        }`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    {preview ? (
                                        <div className="space-y-4">
                                            <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                                            <button
                                                type="button"
                                                onClick={() => setDocument(prev => ({ ...prev, file: null }))}
                                                className="text-sm text-red-600 hover:text-red-700"
                                            >
                                                Remove image
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Image className="h-12 w-12 mx-auto text-gray-400" />
                                            <div className="text-gray-600">
                                                Drag and drop your image here, or
                                                <label className="ml-1 text-rose-600 hover:text-rose-700 cursor-pointer">
                                                    browse
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                    />
                                                </label>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Supports: JPG, PNG, GIF (max 10MB)
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3 px-6 py-4 border-t">
                    <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAddDoc}
                        disabled={isSubmitting || !newDocument.file}
                        className="flex items-center px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Image
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddImageModal;