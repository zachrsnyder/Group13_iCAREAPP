import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function WorkerNavBar({ setIsAuthenticated }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        console.log('Logout button clicked'); // Debug log

        try {
            console.log('Sending logout request...'); // Debug log

            // Changed to GET request and adjusted URL format
            const response = await fetch('/Account/Logout', {
                method: 'GET', // Changed to GET to match C# controller
                credentials: 'include',
            });

            console.log('Logout response status:', response.status); // Debug log
            console.log('Logout response:', response); // Debug log

            // Handle both successful response and redirect
            if (response.ok || response.status === 302) {
                console.log('Logout successful, clearing auth state...'); // Debug log
                setIsAuthenticated(false, []);
                console.log('Navigating to login page...'); // Debug log
                navigate('/login', { replace: true });
            } else {
                console.error('Logout failed with status:', response.status);
                // Try to get more error details if available
                const errorText = await response.text();
                console.error('Error details:', errorText);
                alert(`Logout failed (${response.status}). Please try again.`);
            }
        } catch (err) {
            console.error('Logout error:', err);
            alert('An error occurred during logout. Please try again.');
        }
    };

    const handleGoPallete = () => {
        navigate('/mypalette');
    };

    const handleGoMyBoard = () => {
        navigate('/home');
    };

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <h1 className="text-2xl font-bold text-gray-900">iCare Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <button
                            type="button"
                            className="text-gray-600 hover:text-gray-900 px-4 py-2"
                            onClick={handleGoPallete}
                        >
                            MyPalette
                        </button>
                        <button
                            type="button"
                            className="text-gray-600 hover:text-gray-900 px-4 py-2"
                            onClick={handleGoMyBoard}
                        >
                            MyBoard
                        </button>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}