import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/Login/LoginForm';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    return (
        <Router>
            <div className="min-h-screen bg-gray-50">
                <Routes>
                    <Route
                        path="/login"
                        element={
                            isAuthenticated ?
                                <Navigate to="/" replace /> :
                                <LoginForm setIsAuthenticated={setIsAuthenticated} />
                        }
                    />
                    <Route
                        path="/"
                        element={
                            !isAuthenticated ?
                                <Navigate to="/login" replace /> :
                                <div className="p-8">
                                    <h1 className="text-2xl font-bold">Welcome to iCare</h1>
                                </div>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;