import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';

export default function LoginForm({ setIsAuthenticated }) {
    // Use states
    const [formData, setFormData] = useState({
        userName: '',
        password: '',
        rememberMe: false
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Function to handle form submission of a user logging in and validating them
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/Account/ValidateLogin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                setIsAuthenticated(true, data.user.roles);
                if (data.user.roles.includes('Admin')) {
                    navigate('/admin');
                } else {
                    navigate('/home');
                }
            } else {
                setError(data.error || 'Invalid username or password');
                setIsAuthenticated(false);
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Function to that changes the state of the form data when the input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className="m-auto w-full max-w-md p-8">
                <div className="bg-white rounded-lg shadow-xl p-8 border border-gray-200">
                    <div className="flex justify-center mb-4">
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

                    <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">
                        Welcome to iCare
                    </h2>
                    <p className="text-gray-600 text-center mb-6 text-sm">
                        Healthcare Management System
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="userName"
                                    value={formData.userName}
                                    onChange={handleInputChange}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    required
                                    disabled={isLoading}
                                    autoComplete="username"
                                    placeholder="Enter your username"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    required
                                    disabled={isLoading}
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors
                                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-rose-700'}`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Authenticating...' : 'Sign in to Dashboard'}
                        </button>
                    </form>
                </div>

                <div className="mt-4 text-center text-sm text-gray-600">
                    Protected by iCare Security Protocol
                </div>
            </div>
        </div>
    );
}