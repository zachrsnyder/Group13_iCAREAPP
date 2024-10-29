import React, { useState, useEffect } from 'react';

const MyBoard = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);


    useEffect(() => {
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

        fetchPatients();
    }, []);

    const filteredPatients = patients.filter(patient =>
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
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">My Patients</h2>
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
                            <th className="p-4 text-left font-medium text-gray-600">ID</th>
                            <th className="p-4 text-left font-medium text-gray-600">Name</th>
                            <th className="p-4 text-left font-medium text-gray-600">Treatment Area</th>
                            <th className="p-4 text-left font-medium text-gray-600">Bed ID</th>
                            <th className="p-4 text-left font-medium text-gray-600">Blood Group</th>
                            <th className="p-4 text-left font-medium text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPatients.map((patient) => (
                            <tr key={patient.ID} className="border-t hover:bg-gray-50">
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
                        ))}
                    </tbody>
                </table>
                {filteredPatients.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No patients found
                    </div>
                )}
            </div>
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
        </div>
    );
};

export default MyBoard;