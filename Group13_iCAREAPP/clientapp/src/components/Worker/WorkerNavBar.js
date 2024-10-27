import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function WorkerNavBar({ setIsAuthenticated }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        console.log('Logout button clicked');
        try {
            console.log('Sending logout request...');
            const response = await fetch('/Account/Logout', {
                method: 'GET',
                credentials: 'include',
            });
            console.log('Logout response status:', response.status);
            console.log('Logout response:', response);
            if (response.ok || response.status === 302) {
                console.log('Logout successful, clearing auth state...');
                setIsAuthenticated(false, []);
                console.log('Navigating to login page...');
                navigate('/login', { replace: true });
            } else {
                console.error('Logout failed with status:', response.status);
                const errorText = await response.text();
                console.error('Error details:', errorText);
                alert(`Logout failed (${response.status}). Please try again.`);
            }
        } catch (err) {
            console.error('Logout error:', err);
            alert('An error occurred during logout. Please try again.');
        }
    };

    const handleGoMyBoard = () => {
        navigate('/myboard');
    };

    const handleGoPallete = () => {
        navigate('/mypalette');
    };

    const handleGoDashboard = () => {
        navigate('/home');
    };

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <button
                        onClick={handleGoDashboard}
                        className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
                    >
                        iCare Dashboard
                    </button>
                    <div className="flex items-center space-x-4">
                        <button
                            type="button"
                            className="text-gray-600 hover:text-gray-900 px-4 py-2"
                            onClick={handleGoMyBoard}
                        >
                            MyBoard
                        </button>
                        <button
                            type="button"
                            className="text-gray-600 hover:text-gray-900 px-4 py-2"
                            onClick={handleGoPallete}
                        >
                            MyPalette
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