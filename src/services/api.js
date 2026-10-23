import axios from 'axios';

// Create an Axios instance pointing to your Node.js backend
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Make sure your backend is running here
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach the JWT token to every request if it exists in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;