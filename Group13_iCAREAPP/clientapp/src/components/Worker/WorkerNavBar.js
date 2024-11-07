import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

export default function WorkerNavBar({ setIsAuthenticated }) {
    // Use states for dropdown and user info
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    // Fetch user info on component mount
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await fetch('/Account/GetUserInfo', {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setUserInfo(data);
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        };

        fetchUserInfo();
    }, []);

    // Handle logout
    const handleLogout = async () => {
        // Send logout request to server
        try {
            const response = await fetch('/Account/Logout', {
                method: 'GET',
                credentials: 'include',
            });
            // If logout successful, redirect to login page
            if (response.ok || response.status === 302) {
                setIsAuthenticated(false, []);
                navigate('/login', { replace: true });
            } else {
                const errorText = await response.text();
                alert(`Logout failed (${response.status}). Please try again.`);
            }
        } catch (err) {
            alert('An error occurred during logout. Please try again.');
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isDropdownOpen && !event.target.closest('.dropdown-container')) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isDropdownOpen]);

    return (
        <nav className="bg-white shadow-xl border-b border-gray-200 relative z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 235.25 199.32"
                            className="w-10 h-10"
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
                        <button
                            onClick={() => navigate('/home')}
                            className="text-xl font-bold text-gray-900 hover:text-rose-600 transition-colors ml-3"
                        >
                            iCare Dashboard
                        </button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => navigate('/icareboard')}
                            className="text-gray-600 hover:text-rose-600 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            iCareBoard
                        </button>
                        <button
                            onClick={() => navigate('/myboard')}
                            className="text-gray-600 hover:text-rose-600 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            MyBoard
                        </button>
                        <button
                            onClick={() => navigate('/mypalette')}
                            className="text-gray-600 hover:text-rose-600 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            MyPalette
                        </button>

                        <div className="relative dropdown-container">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center space-x-2 px-4 py-2 rounded-md bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 hover:border-gray-300 transition-all shadow-sm"
                            >
                                <span>{userInfo?.roles?.[0]} - {userInfo?.name}</span>
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-50">
                                    <div className="px-4 py-3">
                                        <p className="text-sm text-gray-700">
                                            <span className="font-semibold block">Username:</span>
                                            {userInfo?.name}
                                        </p>
                                    </div>
                                    <div className="px-4 py-3">
                                        <p className="text-sm text-gray-700">
                                            <span className="font-semibold block">Role:</span>
                                            {userInfo?.roles?.[0]}
                                        </p>
                                    </div>
                                    <div className="px-4 py-3">
                                        <p className="text-sm text-gray-700">
                                            <span className="font-semibold block">Location:</span>
                                            {userInfo?.geoCode}
                                        </p>
                                    </div>
                                    <div className="px-4 py-3">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-3 py-2 text-sm font-medium text-rose-600 hover:bg-gray-50 rounded-md"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}