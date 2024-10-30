import React, { useState, useEffect } from 'react';

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
    });


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

    const openEditModal = () => {
        setSelectedPatient(selectedPatient);
        setEditPatient({ ...editPatient, ID: selectedPatient.ID });
        setIsModalOpen(false);
        setIsEditModalOpen(true);
    };

    const openDescModal = () => {
        setIsEditModalOpen(false);
        setIsDescModalOpen(true);
    }

    const closeModal = () => {
        setSelectedPatient(null);
        setIsModalOpen(false);
    };

    const closeEditModal = () => {
        setSelectedPatient(null);
        setIsEditModalOpen(false);
    };

    const closeDescModal = () => {
        setIsDescModalOpen(false);
        setSelectedPatient(null);
    }

    const handleEditPatient = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/MyBoard/EditPatient', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editPatient),
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
                assignedUserID: ''
            });
            closeEditModal();
            openDescModal();

        } catch (err) {
            setError(err.message);
        }
    };

    const handleEditHistory = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/MyBoard/EditHistory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(description),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to edit history: ${errorText}`);
            }

            setEditPatient('');
            closeDescModal();
        } catch (err) {
            setError(err.message);
        }
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
                                        View Patient Record
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
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mr-4"
                        >
                            Close
                        </button>
                        <button
                            onClick={openEditModal}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Edit
                        </button>
                    </div>
                </div>
            )}

            {isEditModalOpen && selectedPatient && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 modal-dialog modal-xl">
                    <div className="bg-white p-4 rounded-lg shadow-lg w-1/3">
                        <h2 className="text-xl font-bold mb-4">Edit Patient</h2>
                        <form onSubmit={handleEditPatient} className="mb-6 grid grid-cols-2 gap-4 p-2 border rounded">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 border rounded"
                                    value={editPatient.name}
                                    onChange={(e) => setEditPatient({ ...editPatient, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Address</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 border rounded"
                                    value={editPatient.address}
                                    onChange={(e) => setEditPatient({ ...editPatient, address: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Date of Birth</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full p-2 border rounded"
                                    value={editPatient.dateOfBirth}
                                    onChange={(e) => setEditPatient({ ...editPatient, dateOfBirth: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Height (cm)</label>
                                <input
                                    type="number"
                                    required
                                    step="0.1"
                                    className="w-full p-2 border rounded"
                                    value={editPatient.height}
                                    onChange={(e) => setEditPatient({ ...editPatient, height: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                                <input
                                    type="number"
                                    required
                                    step="0.1"
                                    className="w-full p-2 border rounded"
                                    value={editPatient.weight}
                                    onChange={(e) => setEditPatient({ ...editPatient, weight: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Blood Group</label>
                                <select
                                    required
                                    className="w-full p-2 border rounded"
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
                                <label className="block text-sm font-medium mb-1">Bed ID</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 border rounded"
                                    value={editPatient.bedID}
                                    onChange={(e) => setEditPatient({ ...editPatient, bedID: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Treatment Area</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 border rounded"
                                    value={editPatient.treatmentArea}
                                    onChange={(e) => setEditPatient({ ...editPatient, treatmentArea: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2">
                                <button
                                    type="submit"
                                    className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mb-3"
                                >
                                    Submit Edit
                                </button>
                                <button
                                    onClick={closeEditModal}
                                    className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>

                        {/*<button*/}
                        {/*    onClick={closeEditModal}*/}
                        {/*    className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"*/}
                        {/*>*/}
                        {/*    Cancel*/}
                        {/*</button>*/}
                    </div>
                </div>
            )}
            {isDescModalOpen && selectedPatient && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 modal-dialog modal-xl">
                    <div className="bg-white p-4 rounded-lg shadow-lg w-1/3">
                        <h2 className="text-xl font-bold mb-4">Edit Patient</h2>
                        <form onSubmit={handleEditHistory} className="mb-6 grid grid-cols-2 gap-4 p-2 border rounded">
                            <div>
                                <label className="block text-sm font-medium mb-1">Description of Changes</label>
                                <input
                                    type="textarea"
                                    required
                                    className="w-full p-2 border rounded"
                                    value={editPatient.name}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="col-span-2">
                                <button
                                    type="submit"
                                    className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mb-3"
                                >
                                    Submit Description
                                </button>
                                <button
                                    onClick={closeDescModal}
                                    className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>

                        {/*<button*/}
                        {/*    onClick={closeEditModal}*/}
                        {/*    className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"*/}
                        {/*>*/}
                        {/*    Cancel*/}
                        {/*</button>*/}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyBoard;