import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/Login/LoginForm';
import AdminDashboard from './components/Admin/AdminDashboard';
import WorkerNavBar from './components/Worker/WorkerNavBar';
import MyPalette from './components/Worker/MyPalette/MyPalette';
import Dashboard from './components/Worker/Dashboard/Dashboard';
import MyBoard from './components/Worker/MyBoard/MyBoard';
import ICareBoard from './components/Worker/ICareBoard/ICareBoard';

// Create a layout component that includes the navbar
const WorkerLayout = ({ children, handleAuth }) => {
    return (
        <div>
            <WorkerNavBar setIsAuthenticated={handleAuth} />
            <div className="p-4">
                {children}
            </div>
        </div>
    );
};

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRoles, setUserRoles] = useState([]);

    const handleAuth = (authStatus, roles = []) => {
        console.log('Setting auth status:', authStatus, 'roles:', roles);
        setIsAuthenticated(authStatus);
        setUserRoles(roles);
    };

    console.log('Current auth status:', isAuthenticated, 'roles:', userRoles);

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
                                    <Navigate to="/home" replace />
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
                                <AdminDashboard setIsAuthenticated={handleAuth} />
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
                                <WorkerLayout handleAuth={handleAuth}>
                                    <Dashboard />
                                </WorkerLayout>
                            )
                        }
                    />

                    {/* MyBoard route */}
                    <Route
                        path="/myboard"
                        element={
                            !isAuthenticated ? (
                                <Navigate to="/login" replace />
                            ) : userRoles.includes('Admin') ? (
                                <Navigate to="/admin" replace />
                            ) : (
                                <WorkerLayout handleAuth={handleAuth}>
                                    <MyBoard />
                                </WorkerLayout>
                            )
                        }
                    />
                    <Route
                        path="/mypalette"
                        element={
                            !isAuthenticated ? (
                                <Navigate to="/login" replace />
                            ) : userRoles.includes('Admin') ? (
                                <Navigate to="/admin" replace />
                            ) : (
                                <WorkerLayout handleAuth={handleAuth}>
                                    <MyPalette />
                                </WorkerLayout>
                            )
                        }
                    />
                    <Route
                        path="/icareboard"
                        element={
                            !isAuthenticated ? (
                                <Navigate to="/login" replace />
                            ) : userRoles.includes('Admin') ? (
                                <Navigate to="/admin" replace />
                            ) : (
                                <WorkerLayout handleAuth={handleAuth}>
                                    <ICareBoard />
                                </WorkerLayout>
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
                                <Navigate to="/home" replace />
                            )
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;