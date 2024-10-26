import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/Login/LoginForm';
import AdminDashboard from './components/Admin/AdminDashboard'; // Add this import
import WorkerNavBar from './components/Worker/WorkerNavBar';
import MyPalette from './components/Worker/MyPalette/MyPalette';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRoles, setUserRoles] = useState([]);

    const handleAuth = (authStatus, roles = []) => {
        console.log('Setting auth status:', authStatus, 'roles:', roles);
        setIsAuthenticated(authStatus);
        setUserRoles(roles);
    };

    console.log('Current auth status:', isAuthenticated, 'roles:', userRoles); // Debug log

    return (
        <Router>
            <div className="min-h-screen bg-gray-50">
                <Routes>
                    <Route
                        path="/login"
                        element={
                            isAuthenticated ?
                                (userRoles.includes('Admin') ?
                                    <Navigate to="/admin" replace /> :
                                    <Navigate to="/" replace />
                                ) :
                                <LoginForm setIsAuthenticated={handleAuth} />
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            !isAuthenticated ? (
                                <Navigate to="/login" replace />
                            ) : userRoles.includes('Admin') ? (
                                <AdminDashboard />
                            ) : (
                                <Navigate to="/" replace />
                            )
                        }
                    />
                    <Route
                        path="/home"
                        element={
                            !isAuthenticated ? (
                                <Navigate to="/login" replace />
                            ) : userRoles.includes('Admin') ? (
                                <Navigate to="/admin" replace />
                            ) : (
                                <WorkerNavBar/>
                            )
                        }
                    />
                    <Route
                        path="/"
                        element={
                            !isAuthenticated ? (
                                <Navigate to="/login" replace />
                            ) : userRoles.includes('Admin') ? (
                                <Navigate to="/admin" replace />
                            ) : (
                                <div className="p-8">
                                    <h1 className="text-2xl font-bold">Welcome to iCare</h1>
                                </div>
                            )
                        }
                    />
                    <Route
                        path='/mypalette'
                        element={
                            !isAuthenticated ? (
                                <Navigate to="/login" replace />
                            ) : userRoles.includes('Admin') ? (
                                <Navigate to='/admin' replace />
                            ) : (
                                <MyPalette/>
                            )
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;