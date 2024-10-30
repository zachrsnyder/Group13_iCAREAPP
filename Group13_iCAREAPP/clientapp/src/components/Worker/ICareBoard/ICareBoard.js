import React, { useState, useEffect } from 'react';

const ICareBoard = () => {
    const [selectedPatients, setSelectedPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notification, setNotification] = useState(false);
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

    const showNotification = () => {
        setNotification(true);
        setTimeout(() => {
            setNotification(false);
        }, 5000);
    };

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
        console.log("Selected assign patient IDs: " + selectedIDs);

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
                // Show partial success/failure message
                alert(`${result.message}\n\nFailed assignments:\n${result.failedAssignments.join('\n')}`);
            } else {
                // Show success message
                alert(result.message);
            }

            // Refresh the patient list to update UI
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

    if (loading) return <div className="flex justify-center items-center h-64"><div className="text-xl text-gray-600">Loading patients...</div></div>;
    if (error) return <div className="flex justify-center items-center h-64"><div className="text-xl text-red-600">Error: {error}</div></div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">Hospital Patients</h2>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search patients..."
                        className="w-full p-2 border rounded"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="p-4 text-center font-medium text-gray-600">Select Patients</th>
                            <th className="p-4 text-left font-medium text-gray-600">ID</th>
                            <th className="p-4 text-left font-medium text-gray-600">Name</th>
                            <th className="p-4 text-left font-medium text-gray-600">Treatment Area</th>
                            <th className="p-4 text-left font-medium text-gray-600">Bed ID</th>
                            <th className="p-4 text-left font-medium text-gray-600">Blood Group</th>
                            <th className="p-4 text-left font-medium text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPatients.map((patient) => {
                            const isRestricted = patient.treatmentArea === 'ICU' || patient.bedID === null;

                            return (
                                <tr key={patient.ID} className="border-t hover:bg-gray-50">
                                    <td className="p-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={patient.selected || false}
                                            onChange={() => {
                                                if (isRestricted) {
                                                    showNotification();
                                                } else {
                                                    setSelectedPatients(selectedPatients.map(p =>
                                                        p.ID === patient.ID
                                                            ? { ...p, selected: !p.selected }
                                                            : p
                                                    ));
                                                }
                                            }}
                                            disabled={isRestricted}
                                        />
                                    </td>
                                    <td className="p-4">{patient.ID}</td>
                                    <td className="p-4">{patient.name}</td>
                                    <td className="p-4">{patient.treatmentArea}</td>
                                    <td className="p-4">{patient.bedID}</td>
                                    <td className="p-4">{patient.bloodGroup}</td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => openModal(patient)}
                                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors mr-2"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredPatients.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No patients found
                    </div>
                )}
            </div>

            {notification && (
                <div className="fixed top-0 left-0 w-full bg-red-500 text-white text-center p-4 z-50">
                    You cannot select this patient due to certain restrictions.
                </div>
            )}

            {isModalOpen && selectedPatient && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-1/3">
                        <h2 className="text-xl font-bold mb-4">Patient Details</h2>
                        <div className="mb-4">
                            <p><strong>ID:</strong> {selectedPatient.ID}</p>
                            <p><strong>Name:</strong> {selectedPatient.name}</p>
                            <p><strong>Address:</strong> {selectedPatient.address}</p>
                            <p><strong>Date of Birth:</strong> {selectedPatient.dateOfBirth}</p>
                            <p><strong>Height:</strong> {selectedPatient.height}</p>
                            <p><strong>Weight:</strong> {selectedPatient.weight}</p>
                            <p><strong>Blood Group:</strong> {selectedPatient.bloodGroup}</p>
                            <p><strong>Bed ID:</strong> {selectedPatient.bedID}</p>
                            <p><strong>Treatment Area:</strong> {selectedPatient.treatmentArea}</p>
                        </div>
                        <button
                            onClick={closeModal}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {isConfirmModalOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-1/3 max-h-[70vh] overflow-auto">
                        <h2 className="text-xl font-bold mb-4">Confirm Patient Assignments</h2>
                        <div className="overflow-y-auto max-h-60">
                            {selectedPatients.filter(patient => patient.selected).length === 0 ? (
                                <div className="text-center text-red-600 mb-20">
                                    No patients selected
                                </div>
                            ) : (
                                <table className="w-full mb-4">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="p-4 text-center font-medium text-gray-600">Select</th>
                                            <th className="p-4 text-left font-medium text-gray-600">ID</th>
                                            <th className="p-4 text-left font-medium text-gray-600">Name</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedPatients
                                            .filter(patient => patient.selected)
                                            .map(patient => (
                                                <tr key={patient.ID} className="border-t">
                                                    <td className="p-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!patient.selected}
                                                            onChange={() =>
                                                                setSelectedPatients(selectedPatients.map(p =>
                                                                    p.ID === patient.ID
                                                                        ? { ...p, selected: !p.selected }
                                                                        : p
                                                                ))
                                                            }
                                                        />
                                                    </td>
                                                    <td className="p-4">{patient.ID}</td>
                                                    <td className="p-4">{patient.name}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={closeConfirmModal}
                                className="bg-red-400 text-white px-4 py-2 rounded hover:bg-gray-500 mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    assignPatients();
                                    closeConfirmModal();
                                }}
                                className={`px-4 py-2 rounded ${selectedPatients.filter(patient => patient.selected).length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
                                disabled={selectedPatients.filter(patient => patient.selected).length === 0}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}


            <button
                onClick={openConfirmModal}
                className="fixed bottom-6 right-6 bg-green-500 text-white px-5 py-3 rounded-full hover:bg-green-600 shadow-lg transition-colors"
            >
                Assign Patients
            </button>
        </div>
    );
};

export default ICareBoard;
