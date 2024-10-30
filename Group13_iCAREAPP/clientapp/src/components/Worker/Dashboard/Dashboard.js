import React, { useState, useEffect } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                {children}
            </div>
        </div>
    );
};

const Dashboard = () => {
    const [patients, setPatients] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'asc'
    });
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

    const treatmentAreas = [
        "Emergency Department",
        "Intensive Care Unit (ICU)",
        "Cardiac Care Unit (CCU)",
        "Pediatric Ward",
        "Maternity Ward",
        "Surgery Ward",
        "Orthopedic Ward",
        "Oncology Ward",
        "Neurology Ward",
        "Psychiatric Ward",
        "General Medicine",
        "Rehabilitation Unit",
        "Burn Unit",
        "Respiratory Care Unit",
        "Isolation Ward"
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const patientsResponse = await fetch('/PatientRecords/GetAllPatients', {
                    credentials: 'include'
                });
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
            // Concatenate "BED" with the current bedID
            const fullBedID = `BED${newPatient.bedID}`; // Add "BED" prefix to the bedID

            // Create a newPatient object with the updated bedID
            const patientDataToSend = {
                ...newPatient, // Spread the rest of the patient data
                bedID: fullBedID // Update the bedID with the new value
            };

            const response = await fetch('/PatientRecords/CreateWithAssignment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(patientDataToSend), // Send the updated patient data
                credentials: 'include'
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to create patient: ${errorText}`);
            }

            const updatedPatientsResponse = await fetch('/PatientRecords/GetAllPatients', {
                credentials: 'include'
            });
            const updatedPatients = await updatedPatientsResponse.json();
            setPatients(updatedPatients);

            // Reset the newPatient state
            setNewPatient({
                name: '',
                address: '',
                dateOfBirth: '',
                height: '',
                weight: '',
                bloodGroup: '',
                bedID: '', // Reset bedID to empty
                treatmentArea: '',
                assignedUserID: ''
            });
            setShowCreateForm(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortedPatients = (patientsToSort) => {
        if (!sortConfig.key) return patientsToSort;

        return [...patientsToSort].sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            // Handle nested assignedUser property
            if (sortConfig.key === 'assignment') {
                aValue = a.assignedUser ? 'Assigned' : 'Unassigned';
                bValue = b.assignedUser ? 'Assigned' : 'Unassigned';
            }

            // Convert to lowercase if string
            if (typeof aValue === 'string') aValue = aValue.toLowerCase();
            if (typeof bValue === 'string') bValue = bValue.toLowerCase();

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const openPatientDetails = (patient) => {
        setSelectedPatient(patient);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPatient(null);
    };

    const PatientDetails = ({ patient }) => {
        // Helper function to safely parse and format dates
        const formatDate = (dateString) => {
            // Check if the date is in ISO format
            if (typeof dateString === 'string' && dateString.includes('T')) {
                return new Date(dateString).toLocaleDateString();
            }
            // Handle Microsoft JSON date format
            if (typeof dateString === 'string' && dateString.includes('/Date(')) {
                const timestamp = parseInt(dateString.replace(/[^0-9]/g, ''));
                return new Date(timestamp).toLocaleDateString();
            }
            // Regular date string
            const date = new Date(dateString);
            return !isNaN(date.getTime()) ? date.toLocaleDateString() : 'Invalid Date';
        };

        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
                        <p className="text-sm text-gray-500 mt-1">Patient ID: {patient.ID}</p>
                    </div>
                    <button
                        onClick={closeModal}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Main Content - Two Columns */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                <div>
                                    <span className="text-sm text-gray-500">Date of Birth</span>
                                    <p className="text-gray-900">{formatDate(patient.dateOfBirth)}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Address</span>
                                    <p className="text-gray-900">{patient.address}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Blood Group</span>
                                    <p className="text-gray-900 font-semibold">{patient.bloodGroup}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Physical Details</h3>
                            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-gray-500">Height</span>
                                    <p className="text-gray-900">{patient.height} cm</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Weight</span>
                                    <p className="text-gray-900">{patient.weight} kg</p>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-sm text-gray-500">BMI</span>
                                    <p className="text-gray-900">
                                        {((patient.weight / ((patient.height / 100) * (patient.height / 100))).toFixed(1))}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hospital Information */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Hospital Details</h3>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                <div>
                                    <span className="text-sm text-gray-500">Treatment Area</span>
                                    <div className="mt-1">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                                            {patient.treatmentArea}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Location</span>
                                    <div className="mt-1">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {patient.geoCode || 'Unassigned'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Bed ID</span>
                                    <p className="text-gray-900 font-mono">{patient.bedID}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Assignment Status</span>
                                    <div className="mt-1">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${patient.assignedUser
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {patient.assignedUser ? 'Assigned' : 'Unassigned'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Column configuration
    const columns = [
        { key: 'ID', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'geoCode', label: 'Location' },
        { key: 'treatmentArea', label: 'Treatment Area' },
        { key: 'bedID', label: 'Bed ID' },
        { key: 'bloodGroup', label: 'Blood Group' },
        { key: 'assignment', label: 'Assignment' },
    ];

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) {
            return (
                <ChevronUp className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-50" />
            );
        }
        return sortConfig.direction === 'asc' ? (
            <ChevronUp className="h-4 w-4 text-gray-700" />
        ) : (
            <ChevronDown className="h-4 w-4 text-gray-700" />
        );
    };

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.ID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.treatmentArea?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedPatients = getSortedPatients(filteredPatients);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="text-xl text-red-600">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-100px)] bg-gray-100 flex flex-col">
            <main className="flex-1 p-6">
                <div className="h-full max-w-7xl mx-auto">
                    <div className="h-full bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
                        {/* Fixed Header Section */}
                        <div className="p-6 space-y-6 flex-shrink-0">
                            {/* Title and Create Button */}
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 82.84 74.5"
                                        className="h-8 w-8"
                                    >
                                        <g>
                                            <path
                                                fill="none"
                                                stroke="#FF1D48"
                                                strokeWidth="9"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M41.42,12.57C34.04,3.97,21.7,1.31,12.46,9.19c-9.25,7.88-10.55,21.05-3.29,30.36,6.04,7.75,24.31,24.08,30.3,29.37.67.59,1.01.89,1.4,1,.34.1.71.1,1.06,0,.39-.12.73-.41,1.4-1,5.99-5.29,24.26-21.62,30.3-29.37,7.26-9.32,6.12-22.57-3.29-30.36-9.41-7.79-21.53-5.22-28.91,3.38h-.01Z"
                                            />
                                        </g>
                                    </svg>
                                    <h2 className="text-2xl font-bold text-gray-900">All Patients</h2>
                                </div>
                                <button
                                    onClick={() => setShowCreateForm(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors"
                                >
                                    Create New Patient
                                </button>
                            </div>

                            {/* Search Bar */}
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

                        {/* Table Container */}
                        <div className="flex-1 overflow-hidden">
                            <div className="max-h-[calc(100vh-370px)] overflow-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0 z-10">
                                        <tr>
                                            {columns.map((column) => (
                                                <th
                                                    key={column.key}
                                                    className="group px-6 py-3 text-left bg-gray-50"
                                                    onClick={() => handleSort(column.key)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <div className="flex items-center space-x-1">
                                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            {column.label}
                                                        </span>
                                                        <SortIcon column={column.key} />
                                                    </div>
                                                </th>
                                            ))}
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {sortedPatients.map((patient) => (
                                            <tr key={patient.ID} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.ID}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        {patient.geoCode || 'Unassigned'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.treatmentArea}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.bedID}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.bloodGroup}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${patient.assignedUser ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {patient.assignedUser ? 'Assigned' : 'Unassigned'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <button
                                                        onClick={() => openPatientDetails(patient)}
                                                        className="text-rose-600 hover:text-rose-900 font-medium transition-colors"
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {sortedPatients.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        No patients found
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Create Patient Modal */}
            <Modal isOpen={showCreateForm} onClose={() => setShowCreateForm(false)}>
                <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Create New Patient</h2>
                        <button
                            onClick={() => setShowCreateForm(false)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>

                    <form onSubmit={handleCreatePatient} className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                value={newPatient.name}
                                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                value={newPatient.address}
                                onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                            <input
                                type="date"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                value={newPatient.dateOfBirth}
                                onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                            <input
                                type="number"
                                required
                                step="0.1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                value={newPatient.height}
                                onChange={(e) => setNewPatient({ ...newPatient, height: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                            <input
                                type="number"
                                required
                                step="0.1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                value={newPatient.weight}
                                onChange={(e) => setNewPatient({ ...newPatient, weight: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                            <select
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bed ID</label>
                            <div className="flex items-center">
                                <span className="px-3 py-2 border border-r-0 border-gray-300 bg-gray-100 rounded-l-md text-gray-500">BED</span>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-r-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    value={newPatient.bedID}
                                    onChange={(e) => setNewPatient({ ...newPatient, bedID: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Area</label>
                            <select
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                value={newPatient.treatmentArea}
                                onChange={(e) => setNewPatient({ ...newPatient, treatmentArea: e.target.value })}
                            >
                                <option value="">Select Treatment Area</option>
                                {treatmentAreas.map((area) => (
                                    <option key={area} value={area}>
                                        {area}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-2 mt-4">
                            <button
                                type="submit"
                                className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors"
                            >
                                Create Patient
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Patient Details Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal}>
                {selectedPatient && <PatientDetails patient={selectedPatient} />}
            </Modal>
        </div>
    );
};

export default Dashboard;