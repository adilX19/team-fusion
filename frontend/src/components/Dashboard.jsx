import React, { useEffect, useState } from "react";
import api from '../services/api';

export default function Dashboard() {

    const [message, setMessage] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {

        const socket = new WebSocket("ws://localhost:3001")

        socket.onmessage = (event) => {
            const notification = JSON.parse(event.data);
            console.log("New notification:", notification);
            // Update UI or state here
        };

        const fetchImages = async () => {

            try {
                const response = await api.get('/home', { withCredentials: true });
                if (response.status == 200) {
                    setMessage(response.data.message)
                }
            } catch (err) {
                setError(err.response ? err.response.data : 'Error fetching data');
            }
        }
        fetchImages();

        return () => socket.close();
    }, [])

    return (
      <>
        <h1>Welcome to Dashboard</h1>
        <p>{message}</p>
      </>
    );
}