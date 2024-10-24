import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginForm({ setIsAuthenticated }) {
    const [formData, setFormData] = useState({
        userName: '',
        password: '',
        rememberMe: false
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/Account/Login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            if (response.ok) {
                setIsAuthenticated(true);
                navigate('/');
            } else {
                setError('Invalid username or password');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className="m-auto bg-white p-8 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    Sign in to iCare
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-100 text-red-700 p-3 rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-gray-700 mb-2">Username</label>
                        <input
                            type="text"
                            name="userName"
                            value={formData.userName}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="rememberMe"
                            name="rememberMe"
                            checked={formData.rememberMe}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600"
                        />
                        <label htmlFor="rememberMe" className="ml-2 text-gray-700">
                            Remember me
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 focus:outline-none"
                    >
                        Sign in
                    </button>
                </form>
            </div>
        </div>
    );
}