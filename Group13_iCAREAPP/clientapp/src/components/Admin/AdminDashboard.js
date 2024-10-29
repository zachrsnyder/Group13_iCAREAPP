import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard({ setIsAuthenticated }) { // Add setIsAuthenticated prop
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        userName: '',
        password: '',
        profession: '',
        adminEmail: '',
        roleID: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

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
                    roleID: ''
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
            console.log('Response headers:', response.headers);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Try to get the response as text first
            const responseText = await response.text();
            console.log('Raw response:', responseText);

            // Then parse it as JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse response as JSON:', e);
                console.log('Response that failed to parse:', responseText);
                throw new Error('Invalid JSON response from server');
            }

            console.log('Parsed response:', data);

            if (data.success) {
                // Success - refresh the user list
                fetchUsers();
            } else {
                // Server returned an error
                setError(data.error || 'Failed to delete user');
            }
        } catch (err) {
            console.error('Delete operation failed:', err);
            setError(err.message || 'Failed to delete user');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <nav className="bg-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-2xl font-bold text-gray-900">iCare User Management</h1>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto py-6 px-4">
                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Add New User
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="text-center">Loading users...</div>
                ) : (
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Username
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Profession
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{user.userName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{user.profession}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{user.adminEmail}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{user.roleName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Add User Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white rounded-lg p-8 max-w-md w-full">
                            <h2 className="text-2xl font-bold mb-4">Add New User</h2>
                            <form onSubmit={handleAddUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Username</label>
                                    <input
                                        type="text"
                                        value={newUser.userName}
                                        onChange={(e) => setNewUser({ ...newUser, userName: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <input
                                        type="password"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        required
                                    />
                                </div>
                                <div>
                                    {(newUser.roleID === '1') && (
                                        <>
                                            <label className="block text-sm font-medium text-gray-700">Admin Email</label>
                                            <input
                                                type="email"
                                                value={newUser.adminEmail}
                                                onChange={(e) => setNewUser({ ...newUser, adminEmail: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                required
                                            />
                                        </>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Role</label>
                                    <select
                                        value={newUser.roleID}
                                        onChange={(e) => setNewUser({ ...newUser, roleID: e.target.value, profession: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        required
                                    >
                                        <option value="">Select a role</option>
                                        <option value="1">Admin</option>
                                        <option value="2">Doctor</option>
                                        <option value="3">Nurse</option>
                                    </select>
                                </div>
                                <div className="flex justify-end space-x-4 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    >
                                        Add User
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}