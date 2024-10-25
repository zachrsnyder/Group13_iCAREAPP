import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
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
        try {
            await fetch('/Account/Logout', {
                credentials: 'include'
            });
            navigate('/login');
        } catch (err) {
            console.error('Logout error:', err);
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
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                console.log('Attempting to delete user:', userId); // Debug log

                const response = await fetch(`/Admin/DeleteUser?id=${userId}`, {  // Changed URL format
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    credentials: 'include'
                });

                // Check if response is JSON
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const data = await response.json();
                    console.log('Delete response:', data); // Debug log

                    if (data.success) {
                        fetchUsers(); // Refresh the list after successful deletion
                    } else {
                        setError(data.error || 'Failed to delete user');
                        console.error('Delete error:', data.error);
                    }
                } else {
                    // If response is not JSON, log the actual response text
                    const text = await response.text();
                    console.error('Non-JSON response:', text);
                    setError('Server returned an invalid response');
                }
            } catch (err) {
                console.error('Delete error:', err);
                setError('Failed to delete user: ' + err.message);
            }
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
                                    <label className="block text-sm font-medium text-gray-700">Profession</label>
                                    <input
                                        type="text"
                                        value={newUser.profession}
                                        onChange={(e) => setNewUser({ ...newUser, profession: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Admin Email</label>
                                    <input
                                        type="email"
                                        value={newUser.adminEmail}
                                        onChange={(e) => setNewUser({ ...newUser, adminEmail: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Role</label>
                                    <select
                                        value={newUser.roleID}
                                        onChange={(e) => setNewUser({ ...newUser, roleID: e.target.value })}
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