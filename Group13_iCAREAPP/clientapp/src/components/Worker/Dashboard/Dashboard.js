import React, { useState, useEffect } from 'react';

const Dashboard = () => {
    const [patients, setPatients] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newPatient, setNewPatient] = useState({
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

    // Fetch both patients and users data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch patients
                const patientsResponse = await fetch('/PatientRecords/GetAllPatients', {
                    credentials: 'include'
                });

                // Fetch users
                const usersResponse = await fetch('/PatientRecords/GetAllUsers', {
                    credentials: 'include'
                });

                if (!patientsResponse.ok || !usersResponse.ok) {
                    throw new Error('Failed to fetch data');
                }

                const patientsData = await patientsResponse.json();
                const usersData = await usersResponse.json();

                setPatients(patientsData);
                setUsers(usersData);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCreatePatient = async (e) => {
        e.preventDefault();
        try {
            console.log('Sending patient data:', newPatient);
            const url = '/PatientRecords/CreateWithAssignment';
            console.log('Sending to URL:', url);

            const requestData = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newPatient),
                credentials: 'include'
            };
            console.log('Request details:', requestData);

            const response = await fetch(url, requestData);

            console.log('Response:', response);
            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response text:', errorText);
                throw new Error(`Failed to create patient: ${errorText}`);
            }

            // Refresh the patients list
            const updatedPatientsResponse = await fetch('/PatientRecords/GetAllPatients', {
                credentials: 'include'
            });
            const updatedPatients = await updatedPatientsResponse.json();
            setPatients(updatedPatients);

            // Reset form and hide it
            setNewPatient({
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
            setShowCreateForm(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.ID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.treatmentArea?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-xl text-gray-600">Loading...</div>
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
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">All Patients</h2>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                >
                    {showCreateForm ? 'Cancel' : 'Create New Patient'}
                </button>
            </div>

            {showCreateForm && (
                <form onSubmit={handleCreatePatient} className="mb-6 grid grid-cols-2 gap-4 p-4 border rounded">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            type="text"
                            required
                            className="w-full p-2 border rounded"
                            value={newPatient.name}
                            onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Address</label>
                        <input
                            type="text"
                            required
                            className="w-full p-2 border rounded"
                            value={newPatient.address}
                            onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Date of Birth</label>
                        <input
                            type="date"
                            required
                            className="w-full p-2 border rounded"
                            value={newPatient.dateOfBirth}
                            onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Height (cm)</label>
                        <input
                            type="number"
                            required
                            step="0.1"
                            className="w-full p-2 border rounded"
                            value={newPatient.height}
                            onChange={(e) => setNewPatient({ ...newPatient, height: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                        <input
                            type="number"
                            required
                            step="0.1"
                            className="w-full p-2 border rounded"
                            value={newPatient.weight}
                            onChange={(e) => setNewPatient({ ...newPatient, weight: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Blood Group</label>
                        <select
                            required
                            className="w-full p-2 border rounded"
                            value={newPatient.bloodGroup}
                            onChange={(e) => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}
                        >
                            <option value="">Select Blood Group</option>
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
                            value={newPatient.bedID}
                            onChange={(e) => setNewPatient({ ...newPatient, bedID: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Treatment Area</label>
                        <input
                            type="text"
                            required
                            className="w-full p-2 border rounded"
                            value={newPatient.treatmentArea}
                            onChange={(e) => setNewPatient({ ...newPatient, treatmentArea: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Assign to User</label>
                        <select
                            required
                            className="w-full p-2 border rounded"
                            value={newPatient.assignedUserID}
                            onChange={(e) => setNewPatient({ ...newPatient, assignedUserID: e.target.value })}
                        >
                            <option value="">Select User</option>
                            {users.map(user => (
                                <option key={user.ID} value={user.ID}>
                                    {user.name} ({user.profession})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-span-2">
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                            Create Patient
                        </button>
                    </div>
                </form>
            )}

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search patients..."
                    className="w-full p-2 border rounded"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
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
                            <th className="p-4 text-left font-medium text-gray-600">Assigned To</th>
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
                                <td className="p-4">{patient.assignedUser?.name || 'Unassigned'}</td>
                                <td className="p-4">
                                    <button
                                        onClick={() => window.location.href = `/PatientRecords/Details/${patient.ID}`}
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
        </div>
    );
};

export default Dashboard;