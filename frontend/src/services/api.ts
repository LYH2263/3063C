import axios from 'axios';
import { getApiBaseUrl } from '../config';

const baseURL = getApiBaseUrl();

const api = axios.create({
    baseURL,
    timeout: 10000,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// We will handle global errors in the UI layer (AuthContext / Error Boundary)
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        return Promise.reject(error.response?.data || error);
    }
);

export default api;
