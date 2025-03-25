import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div>Loading information...</div>
    }

    console.log("PRoute:", children)

    if (!user) {
        // Redirect to login if user is not logged in
        return <Navigate to="/" />;
    }
    return children; // Render protected content
};

export default ProtectedRoute;
