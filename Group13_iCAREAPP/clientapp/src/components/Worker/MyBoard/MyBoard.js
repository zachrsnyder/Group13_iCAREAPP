import React, { useState, useEffect } from 'react';
import { Search, Eye, X } from 'lucide-react';
import { FileText } from 'lucide-react';
import HistoryIconButton from '../../buttons/HistoryIconButton.js';


const MyBoard = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDescModalOpen, setIsDescModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [description, setDescription] = useState('');
    const [editPatient, setEditPatient] = useState({
        ID:'',
        name: '',
        address: '',
        dateOfBirth: '',
        height: '',
        weight: '',
        bloodGroup: '',
        bedID: '',
        treatmentArea: '',
        description: ''
    });
    const [editTreatment, setEditTreatment] = useState({
        treatmentID: '',
        description: '',
        patientID: '',
        editDescription: ''
    });
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedPatientHistory, setSelectedPatientHistory] = useState([]);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
    const [treatment, setTreatment] = useState(null);
    const [isEditTreatmentModalOpen, setIsEditTreatmentModalOpen] = useState(false);
    const [isTreatment, setIsTreatment] = useState(false);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            // Update the URL to match your MVC route pattern
            const response = await fetch('/PatientRecords/MyPatients', {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch patients');
            }

            const data = await response.json();
            setPatients(data);
            console.log(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.ID.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.treatmentArea.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openModal = (patient) => {
        setSelectedPatient(patient);
        setIsModalOpen(true);
    };

    const openEditModal = () => {
        // Properly copy ALL fields from selectedPatient
        setEditPatient({
            ID: selectedPatient.ID,
            name: selectedPatient.name,
            address: selectedPatient.address,
            dateOfBirth: selectedPatient.dateOfBirth,
            height: selectedPatient.height.toString(),  // Convert float to string
            weight: selectedPatient.weight.toString(),  // Convert float to string
            bloodGroup: selectedPatient.bloodGroup,
            bedID: selectedPatient.bedID,
            treatmentArea: selectedPatient.treatmentArea,
            description: ''
        });
        setIsModalOpen(false);
        setIsEditModalOpen(true);
    };

    const openTreatmentModal = async (patient) => {
        setSelectedPatient(patient);
        try {
            const patientID = patient.ID;
            const response = await fetch(`/MyBoard/GetTreatment?patientID=${patient.ID}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch treatment record: ${errorText}`);
            }
            setTreatment(await response.json());
            setIsTreatment(true);
            setIsTreatmentModalOpen(true);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }


    const openDescModal = () => {
        setIsEditModalOpen(false);
        setIsEditTreatmentModalOpen(false);
        setIsDescModalOpen(true);
    }

    const closeModal = () => {
        setSelectedPatient(null);
        setIsModalOpen(false);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
    };

    const closeTreatmentModal = () => {
        setIsTreatmentModalOpen(false);
    }

    const openEditTreatmentModal = () => {
        setIsTreatmentModalOpen(false);
        setEditTreatment({
            treatmentID: treatment.treatmentID,
            description: treatment.description,
            patientID: selectedPatient.ID,
            editDescription: ''
        })
        setIsEditTreatmentModalOpen(true);
    }

    const closeEditTreatmentModal = () => {
        setIsEditTreatmentModalOpen(false);
        setIsDescModalOpen(true);
        setSelectedPatient(null);
    }

    const closeDescModal = () => {
        setDescription("");
        setIsDescModalOpen(false);
        setSelectedPatient(null);
    }

    const handleEditPatient = async (e) => {
        e.preventDefault();
        openDescModal();
    };

    const handleEditHistory = async (e) => {
        e.preventDefault();
        try {
            const finalPatientData = {
                ...editPatient,
                description: description // Add the description from the description state
            };
            const response = await fetch('/MyBoard/handleEditHistory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(finalPatientData),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to edit patient: ${errorText}`);
            }

            setEditPatient({
                ID: '',
                name: '',
                address: '',
                dateOfBirth: '',
                height: '',
                weight: '',
                bloodGroup: '',
                bedID: '',
                treatmentArea: '',
                assignedUserID: '',
                description: ''
            });
            closeDescModal();
            fetchPatients();
        } catch (err) {
            setError(err.message);
        }
    }

    const handleEditTreatment = () => {
        setIsDescModalOpen(true);
        setIsEditTreatmentModalOpen(false);
    }

    const handleTreatmentHistory = async (e) => {
        e.preventDefault();
        try {
            const finalEditTreatment = {
                ...editTreatment,
                editDescription: description
            }
            const response = await fetch('/MyBoard/HandleTreatmentHistory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(finalEditTreatment),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to edit treatment: ${errorText}`);
            }

            setEditTreatment({
                treatmentID: '',
                description: '',
                patientID: '',
                editDescription: ''
            });
            closeDescModal();
            fetchPatients();
        } catch (err) {
            setError(err.message);
        }
    }

    const openHistoryModal = async (patient) => {
        setSelectedPatient(patient);
        try {
            const response = await fetch(`/MyBoard/GetChangeHistory?patientID=${patient.ID}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch Change History');
            }

            const data = await response.json();
            setSelectedPatientHistory(data);
            console.log(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
        setIsHistoryModalOpen(true);
    }

    const closeHistoryModal = async() => {
        setIsHistoryModalOpen(false);
        setSelectedPatient(null);
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-xl text-gray-600">Loading patients...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-xl text-red-600">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col">
            <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
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
                                            d="M17.75,2 C18.9926407,2 20,3.00735931 20,4.25 L20,19.754591 C20,20.9972317 18.9926407,22.004591 17.75,22.004591 L6.25,22.004591 C5.00735931,22.004591 4,20.9972317 4,19.754591 L4,4.25 C4,3.05913601 4.92516159,2.08435508 6.09595119,2.00519081 L6.25,2 L17.75,2 Z M18.5,16 L5.5,16 L5.5,19.754591 C5.5,20.1688046 5.83578644,20.504591 6.25,20.504591 L17.75,20.504591 C18.1642136,20.504591 18.5,20.1688046 18.5,19.754591 L18.5,16 Z M7.75128856,17.5 L16.25,17.5 C16.6642136,17.5 17,17.8357864 17,18.25 C17,18.6296958 16.7178461,18.943491 16.3517706,18.9931534 L16.25,19 L7.75128856,19 C7.337075,19 7.00128856,18.6642136 7.00128856,18.25 C7.00128856,17.8703042 7.28344245,17.556509 7.64951801,17.5068466 L7.75128856,17.5 L16.25,17.5 L7.75128856,17.5 Z M17.75,3.5 L6.25,3.5 L6.14822944,3.50684662 C5.78215388,3.55650904 5.5,3.87030423 5.5,4.25 L5.5,14.5 L8,14.5 L8,12.2455246 C8,11.5983159 8.49187466,11.0659907 9.12219476,11.0019782 L9.25,10.9955246 L14.75,10.9955246 C15.3972087,10.9955246 15.9295339,11.4873992 15.9935464,12.1177193 L16,12.2455246 L16,14.5 L18.5,14.5 L18.5,4.25 C18.5,3.83578644 18.1642136,3.5 17.75,3.5 Z M14.5,12.4955246 L9.5,12.4955246 L9.5,14.5 L14.5,14.5 L14.5,12.4955246 Z M12,4.99552458 C13.3807119,4.99552458 14.5,6.11481271 14.5,7.49552458 C14.5,8.87623646 13.3807119,9.99552458 12,9.99552458 C10.6192881,9.99552458 9.5,8.87623646 9.5,7.49552458 C9.5,6.11481271 10.6192881,4.99552458 12,4.99552458 Z M12,6.49552458 C11.4477153,6.49552458 11,6.94323983 11,7.49552458 C11,8.04780933 11.4477153,8.49552458 12,8.49552458 C12.5522847,8.49552458 13,8.04780933 13,7.49552458 C13,6.94323983 12.5522847,6.49552458 12,6.49552458 Z"
                                            fill="#FF1D48"
                                        />
                                    </svg>
                                    <h2 className="text-2xl font-bold text-gray-900">My Patients</h2>
                                </div>
                            </div>

                            {/* Search Bar */}
                            <div className="mb-6">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search patients..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Treatment Area</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bed ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Group</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredPatients.map((patient) => (
                                            <tr key={patient.ID} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.ID}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-rose-100 text-rose-800">
                                                        {patient.treatmentArea}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.bedID}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.bloodGroup}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm flex items-center space-x-1">
                                                    <div className="group relative">
                                                        <button
                                                            onClick={() => openModal(patient)}
                                                            className="text-rose-600 hover:text-rose-900 hover:bg-rose-200 px-2 py-1 rounded-md font-medium transition-colors inline-flex items-center space-x-1"
                                                        >
                                                        <Eye className="h-6 w-6" />
                                                        </button>
                                                        <div className="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                            View Record
                                                        </div>
                                                    </div>

                                                    <div className="group relative">
                                                        <HistoryIconButton onClick={() => openHistoryModal(patient)} />
                                                        <div className="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                            View Change History
                                                        </div>
                                                    </div>
                                                    <div className="group relative">
                                                        <button
                                                            onClick={() => openTreatmentModal(patient)}
                                                            className="text-rose-600 hover:text-rose-900 hover:bg-rose-200 px-2 py-1 rounded-md font-medium transition-colors inline-flex items-center space-x-1"
                                                        >
                                                            <FileText className="w-6 h-6" />
                                                        </button>
                                                        <div className="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                            View Treatment Record
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredPatients.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        No patients found
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {isHistoryModalOpen && selectedPatient && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                        <div className="bg-white rounded-lg shadow-xl w-1/2 h-1/2 mx-4 overflow-hidden pb-14">
                            <div className="flex justify-between items-center mb-4 p-4">
                                <h2 className="text-xl font-bold text-gray-900">Document Change History</h2>
                                <button
                                    onClick={closeHistoryModal}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="overflow-y-auto h-full p-4">
                                <div className="min-w-full">
                                    {selectedPatientHistory.map((history) => (
                                        <div key={history.docID} className="mb-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                                            <table className="w-full">
                                                <tr className="bg-gray-50 hover:bg-gray-100 rounded-t-lg">
                                                    <td className="px-4 py-2 font-medium">{history.docID}</td>
                                                    <td className="px-4 py-2">{history.modDate}</td>
                                                </tr>
                                                <tr className="border-t border-gray-100">
                                                    <td colSpan="2" className="px-4 py-2 text-gray-600">
                                                        {"Details: " + history.description}
                                                    </td>
                                                </tr>
                                            </table>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}




                {/* View Modal */}
                {isModalOpen && selectedPatient && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Patient Details</h2>
                                <button
                                    onClick={closeModal}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div><strong>ID:</strong> {selectedPatient.ID}</div>
                                <div><strong>Name:</strong> {selectedPatient.name}</div>
                                <div><strong>Address:</strong> {selectedPatient.address}</div>
                                <div><strong>Date of Birth:</strong> {selectedPatient.dateOfBirth}</div>
                                <div><strong>Height:</strong> {selectedPatient.height} cm</div>
                                <div><strong>Weight:</strong> {selectedPatient.weight} kg</div>
                                <div><strong>Blood Group:</strong> {selectedPatient.bloodGroup}</div>
                                <div><strong>Bed ID:</strong> {selectedPatient.bedID}</div>
                                <div><strong>Treatment Area:</strong> {selectedPatient.treatmentArea}</div>
                            </div>
                            <div className="mt-6 flex space-x-3">
                                <button
                                    onClick={openEditModal}
                                    className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Treatment Modal */}
                {isTreatmentModalOpen && treatment && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Treatment Record</h2>
                                <button
                                    onClick={closeTreatmentModal}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div><strong>Treatment ID:</strong> {treatment.treatmentID}</div>
                                <div><strong>Patient ID:</strong> {treatment.patientID}</div>
                                <div><strong>Treatment Date:</strong> {treatment.treatmentDate}</div>
                                <div><strong>Description:</strong> {treatment.description}</div>
                            </div>
                            <div className="mt-6 flex space-x-3">
                                <button
                                    onClick={openEditTreatmentModal}
                                    className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={closeTreatmentModal}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {isEditTreatmentModalOpen && selectedPatient && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Edit Treatment Record</h2>
                                <button
                                    onClick={closeEditTreatmentModal}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <form onSubmit={handleEditTreatment} className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                        value={editTreatment.treatmentDate}
                                        onChange={(e) => setEditTreatment({ ...editTreatment, treatmentDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Description</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                        value={editTreatment.description}
                                        onChange={(e) => setEditTreatment({ ...editTreatment, description: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2 flex space-x-3 mt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeEditTreatmentModal}
                                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}


                {/* Edit Modal */}
                {isEditModalOpen && selectedPatient && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Edit Patient</h2>
                                <button
                                    onClick={closeEditModal}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <form onSubmit={handleEditPatient} className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                        value={editPatient.name}
                                        onChange={(e) => setEditPatient({ ...editPatient, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                        value={editPatient.address}
                                        onChange={(e) => setEditPatient({ ...editPatient, address: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                        value={editPatient.dateOfBirth}
                                        onChange={(e) => setEditPatient({ ...editPatient, dateOfBirth: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                                    <input
                                        type="number"
                                        required
                                        step="0.1"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                        value={editPatient.height}
                                        onChange={(e) => setEditPatient({ ...editPatient, height: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                                    <input
                                        type="number"
                                        required
                                        step="0.1"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                        value={editPatient.weight}
                                        onChange={(e) => setEditPatient({ ...editPatient, weight: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                                    <select
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                        value={editPatient.bloodGroup}
                                        onChange={(e) => setEditPatient({ ...editPatient, bloodGroup: e.target.value })}
                                    >
                                        <option value="">Blood Type</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bed ID</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                        value={editPatient.bedID}
                                        onChange={(e) => setEditPatient({ ...editPatient, bedID: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Area</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                        value={editPatient.treatmentArea}
                                        onChange={(e) => setEditPatient({ ...editPatient, treatmentArea: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2 flex space-x-3 mt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeEditModal}
                                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Description Modal */}
                {isDescModalOpen && selectedPatient && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Add Description</h2>
                                <button
                                    onClick={closeDescModal}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                isTreatment ? handleTreatmentHistory(e) : handleEditHistory(e);
                            }}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description of Changes</label>
                                    <textarea
                                        required
                                        rows="4"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe the changes made to the document"
                                    />
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                                    >
                                        Submit Description
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeDescModal}
                                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyBoard;