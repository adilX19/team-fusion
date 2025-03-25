import axios from 'axios';
import Cookies from 'js-cookie'; // Assuming the token is stored in cookies

const api = axios.create({
    baseURL: 'http://localhost:5000', // Replace with your API base URL
});

api.interceptors.request.use((config) => {
    const token = Cookies.get('token'); // Get token from cookies
    console.log("Interceptor: ", token)
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
