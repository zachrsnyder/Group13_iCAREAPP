import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Search, Plus, Trash2 } from 'lucide-react';

const AdminDashboard = ({ setIsAuthenticated }) => {
    const [users, setUsers] = useState([]);
    const [geoCodes, setGeoCodes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        userName: '',
        password: '',
        profession: '',
        adminEmail: '',
        roleID: '',
        userGeoID: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        fetchGeoCodes();
    }, []);

    const fetchGeoCodes = async () => {
        try {
            const response = await fetch('/Admin/GetGeoCodes', {
                credentials: 'include'
            });

            const data = await response.json();
            console.log('Fetched GeoCodes data', data);

            if (data.error) {
                setError(data.error);
                return;
            }

            if (Array.isArray(data)) {
                setGeoCodes(data);
            } else {
                setError('Invalid data format received');
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };


    const fetchUsers = async () => {
        try {
            const response = await fetch('/Admin/GetUsers', {
                credentials: 'include'
            });

            const data = await response.json();
            console.log('Fetched users data:', data);

            if (data.error) {
                setError(data.error);
                return;
            }

            if (Array.isArray(data)) {
                setUsers(data);
            } else {
                setError('Invalid data format received');
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        console.log('Admin logout clicked');
        try {
            console.log('Sending logout request...');
            const response = await fetch('/Account/Logout', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            });

            console.log('Logout response status:', response.status);

            if (response.ok || response.status === 302) {
                console.log('Logout successful, clearing auth state...');
                setIsAuthenticated(false, []); // Clear authentication state
                console.log('Navigating to login page...');
                // Add a small delay to ensure state is cleared before navigation
                setTimeout(() => {
                    navigate('/login', { replace: true });
                }, 100);
            } else {
                console.error('Logout failed with status:', response.status);
                const error = await response.text();
                console.error('Error details:', error);
                alert('Logout failed. Please try again.');
            }
        } catch (err) {
            console.error('Logout error:', err);
            alert('An error occurred during logout. Please try again.');
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/Admin/AddUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                setShowAddModal(false);
                setNewUser({
                    name: '',
                    userName: '',
                    password: '',
                    profession: '',
                    adminEmail: '',
                    roleID: '',
                    userGeoID: ''
                });
                fetchUsers(); // Refresh user list
            } else {
                setError(data.error || 'Failed to add user');
            }
        } catch (err) {
            setError('Failed to add user');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            console.log('Sending delete request for user:', userId);

            const response = await fetch(`/Admin/DeleteUser?id=${userId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseText = await response.text();
            console.log('Raw response:', responseText);

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse response as JSON:', e);
                throw new Error('Invalid JSON response from server');
            }

            if (data.success) {
                fetchUsers();
            } else {
                setError(data.error || 'Failed to delete user');
            }
        } catch (err) {
            console.error('Delete operation failed:', err);
            setError(err.message || 'Failed to delete user');
        }
    };

    // ... keep all imports and state/functions the same ...

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="hidden md:flex md:flex-col md:w-64 bg-white shadow-xl">
                <div className="flex flex-col flex-grow pt-5 pb-4">
                    <div className="flex items-center justify-center flex-shrink-0 px-4 mb-5">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 235.25 199.32"
                            className="w-32 h-32"
                        >
                            <defs>
                                <linearGradient id="logoGradient" x1="0" y1="1" x2="0" y2="0">
                                    <stop offset="0%" stopColor="#FF1D48" />
                                    <stop offset="100%" stopColor="#FF758C" />
                                </linearGradient>
                            </defs>
                            <g id="Layer_1-2">
                                <path fill="url(#logoGradient)" d="M206.27,29.52c15.86,27.4,18.42,60.44,7.02,89.95-9.41,24.36-28.78,44.25-52.25,55.37-24.49,11.6-53.32,12.45-78.71,3.3-24.6-8.86-44.99-27.55-56.7-50.82-15.73-31.26-13.63-69.05,4.18-98.97,4.95-8.31-8.01-15.87-12.95-7.57C-1.33,51.31-5.3,89.5,7.39,122.84c10.74,28.19,32.01,51.99,59.38,64.95,28.03,13.28,60.98,15.36,90.27,4.82s52.16-30.88,65.66-57.71c17.94-35.66,16.51-78.41-3.48-112.95-4.84-8.35-17.8-.81-12.95,7.57h0Z" />
                                <path fill="url(#logoGradient)" d="M56.68,165.22V42.45c0-4.83-.41-9.89,1.46-14.45,3.75-9.17,12.32-12.82,21.62-12.82h78.43l-3.79-1.02c10.15,7.38,17.83,17.87,26.49,26.84l-2.2-5.3v129.53c0,9.65,15,9.67,15,0V40.88c0-1.43.05-2.87,0-4.3-.14-3.94-2.2-6.17-4.85-8.96-4.74-5-9.2-10.26-13.97-15.24-3.93-4.11-9.92-11.13-15.7-12.06-3.81-.62-8-.13-11.84-.13h-25.18c-14.61,0-29.23-.09-43.84,0-20.54.13-36.49,15.78-36.64,36.4-.08,11.34,0,22.68,0,34.02,0,30.89-.47,61.82,0,92.71,0,.64,0,1.27,0,1.91,0,9.65,15,9.67,15,0h0Z" />
                                <path fill="url(#logoGradient)" d="M78.12,166.88h81.78c4.83,0,4.83-7.5,0-7.5h-81.78c-4.83,0-4.83,7.5,0,7.5h0Z" />
                                <path fill="url(#logoGradient)" d="M78.12,145.55h81.78c4.83,0,4.83-7.5,0-7.5h-81.78c-4.83,0-4.83,7.5,0,7.5h0Z" />
                                <path fill="none" stroke="url(#logoGradient)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" d="M119,70.16c-7.38-8.6-19.72-11.26-28.96-3.38-9.25,7.88-10.55,21.05-3.29,30.36,6.04,7.75,24.31,24.08,30.3,29.37.67.59,1.01.89,1.4,1,.34.1.71.1,1.06,0,.39-.12.73-.41,1.4-1,5.99-5.29,24.26-21.62,30.3-29.37,7.26-9.32,6.12-22.57-3.29-30.36-9.41-7.79-21.53-5.22-28.91,3.38Z" />
                                <polyline fill="none" stroke="url(#logoGradient)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" points="139.07 94.83 128.63 94.83 123.02 82.8 110.98 106.87 106.77 94.83 98.94 94.83" />
                                <path fill="url(#logoGradient)" d="M143.38,14.68v31.01c0,3.04,2.58,5.62,5.62,5.62h30.19c7.24,0,7.25-11.25,0-11.25h-30.19l5.62,5.62V14.68c0-7.24-11.25-7.25-11.25,0h0Z" />
                            </g>
                        </svg>
                    </div>
                    <div className="mt-2 text-center">
                        <h2 className="text-xl font-semibold text-gray-800">iCare</h2>
                        <p className="text-sm text-gray-600">Healthcare Management</p>
                    </div>
                </div>
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors"
                    >
                        <Lock className="w-4 h-4 mr-2" />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Top Navigation */}
                <nav className="bg-white shadow-sm z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                            </div>
                            <div className="flex items-center">
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add User
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Main Content Area */}
                <main className="flex-1 p-6">
                    {error && (
                        <div className="mb-4 bg-red-50 text-red-700 p-4 rounded-md border border-red-200 text-sm">
                            {error}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-gray-600">Loading users...</div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-xl border border-gray-200 h-[calc(100vh-11rem)] flex flex-col">
                            <div className="overflow-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.userName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-rose-100 text-rose-800">
                                                        {user.roleName}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.adminEmail}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="text-rose-600 hover:text-rose-900 inline-flex items-center"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New User</h2>
                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    value={newUser.userName}
                                    onChange={(e) => setNewUser({ ...newUser, userName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                {newUser.roleID === '1' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                                        <input
                                            type="email"
                                            value={newUser.adminEmail}
                                            onChange={(e) => setNewUser({ ...newUser, adminEmail: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <select
                                    value={newUser.userGeoID}
                                    onChange={(e) => setNewUser({ ...newUser, userGeoID: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select a location</option>
                                    {geoCodes.map((geoCode) => (
                                        <option key={geoCode.ID} value={geoCode.ID}>
                                            {geoCode.description}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={newUser.roleID}
                                    onChange={(e) => setNewUser({ ...newUser, roleID: e.target.value, profession: e.target.options[e.target.selectedIndex].text })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select a role</option>
                                    <option value="1">Admin</option>
                                    <option value="2">Doctor</option>
                                    <option value="3">Nurse</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                                >
                                    Add User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;