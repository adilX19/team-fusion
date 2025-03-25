import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

export default function AuthGuard() {
    const token = Cookies.get('token');

    console.log(token)

    const isTokenValid = () => {
        if (!token) return false;

        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            return decoded.exp > currentTime;
        } catch (error) {
            return false; // Token is invalid
        }
    };

    return isTokenValid() ? <Outlet /> : <Navigate to="/" replace />;
};
