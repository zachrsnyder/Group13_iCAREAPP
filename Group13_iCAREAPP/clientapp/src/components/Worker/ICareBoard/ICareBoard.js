import React, { useState, useEffect } from 'react';
import { Search, Eye, UserPlus } from 'lucide-react';

const ICareBoard = () => {
    const [selectedPatients, setSelectedPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await fetch('/ICareBoard/HospitalPatients', {
                    credentials: 'include'
                });
                if (!response.ok) throw new Error('Failed to fetch patients');

                const data = await response.json();
                setSelectedPatients(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    const filteredPatients = selectedPatients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.ID.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.treatmentArea.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openModal = (patient) => {
        setSelectedPatient(patient);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedPatient(null);
        setIsModalOpen(false);
    };

    const openConfirmModal = () => {
        setIsConfirmModalOpen(true);
    };

    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
    };

    const assignPatients = async () => {
        const selectedIDs = selectedPatients
            .filter(patient => patient.selected)
            .map(patient => patient.ID);

        try {
            const response = await fetch('/ICareBoard/AssignPatients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ selectedIDs })
            });

            if (!response.ok) throw new Error('Failed to assign patients');

            const result = await response.json();

            if (result.failedAssignments && result.failedAssignments.length > 0) {
                alert(`${result.message}\n\nFailed assignments:\n${result.failedAssignments.join('\n')}`);
            } else {
                alert(result.message);
            }

            const updatedResponse = await fetch('/ICareBoard/HospitalPatients', {
                credentials: 'include'
            });
            if (!updatedResponse.ok) throw new Error('Failed to refresh patient list');

            const updatedData = await updatedResponse.json();
            setSelectedPatients(updatedData);

        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-gray-600">Loading patients...</div>
        </div>
    );

    if (error) return (
        <div className="mb-4 bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
            {error}
        </div>
    );

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
                                    <h2 className="text-2xl font-bold text-gray-900">Hospital Patients</h2>
                                </div>
                                <button
                                    onClick={openConfirmModal}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                                >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Assign Patients
                                </button>
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
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Select</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Treatment Area</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bed ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Group</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredPatients.map((patient) => {
                                            return (
                                                <tr key={patient.ID} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {patient.fullyAssigned ? (
                                                            <span className="text-gray-500">Fully Assigned</span>
                                                        ) : (
                                                            <input
                                                                type="checkbox"
                                                                checked={patient.selected || false}
                                                                onChange={() => {
                                                                    setSelectedPatients(selectedPatients.map(p =>
                                                                        p.ID === patient.ID
                                                                            ? { ...p, selected: !p.selected }
                                                                            : p
                                                                    ));
                                                                }}
                                                                className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                                                            />
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.ID}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-rose-100 text-rose-800">
                                                            {patient.treatmentArea}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.bedID}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.bloodGroup}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        <button
                                                            onClick={() => openModal(patient)}
                                                            className="text-rose-600 hover:text-rose-900 font-medium transition-colors"
                                                        >
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
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

                {/* View Patient Modal */}
                {isModalOpen && selectedPatient && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800">Patient Details</h2>
                            <div className="space-y-4">
                                <div><strong>ID:</strong> {selectedPatient.ID}</div>
                                <div><strong>Name:</strong> {selectedPatient.name}</div>
                                <div><strong>Address:</strong> {selectedPatient.address}</div>
                                <div><strong>Date of Birth:</strong> {selectedPatient.dateOfBirth}</div>
                                <div><strong>Height:</strong> {selectedPatient.height}</div>
                                <div><strong>Weight:</strong> {selectedPatient.weight}</div>
                                <div><strong>Blood Group:</strong> {selectedPatient.bloodGroup}</div>
                                <div><strong>Bed ID:</strong> {selectedPatient.bedID}</div>
                                <div><strong>Treatment Area:</strong> {selectedPatient.treatmentArea}</div>
                            </div>
                            <div className="mt-6">
                                <button
                                    onClick={closeModal}
                                    className="w-full px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirm Modal */}
                {isConfirmModalOpen && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800">Confirm Patient Assignments</h2>
                            <div className="max-h-64 overflow-y-auto mb-6">
                                {selectedPatients.filter(patient => patient.selected).length === 0 ? (
                                    <div className="text-center text-red-600">
                                        No patients selected
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {selectedPatients
                                            .filter(patient => patient.selected)
                                            .map(patient => (
                                                <div key={patient.ID} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                    <span>{patient.name}</span>
                                                    <span className="text-gray-500">{patient.ID}</span>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={closeConfirmModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        assignPatients();
                                        closeConfirmModal();
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    disabled={selectedPatients.filter(patient => patient.selected).length === 0}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}


            </main>
        </div>
    );
};

export default ICareBoard;