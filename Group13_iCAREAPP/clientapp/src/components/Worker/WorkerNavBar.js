import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function WorkerNavBar() {
    const navigate = useNavigate();

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

    const handleGoPallete = () => {
        navigate('/mypalette');
    }

    return (
            <nav className="bg-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-2xl font-bold text-gray-900">iCare Dashboard</h1>
                        
                        <a className='text-gray-600 px-4' onClick={handleGoPallete}></a>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>
    );
}