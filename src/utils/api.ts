import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Get backend URL from environment variable or use default
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: `${BACKEND_URL}/api/v1`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // You can add any request modifications here
        // For example: adding auth token
        // const token = localStorage.getItem('token');
        // if (token) {
        //     config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError) => {
        // Handle different error scenarios
        if (error.response) {
            // Server responded with error status
            const message =
                (error.response.data as { message?: string })?.message || 'An error occurred';
            return Promise.reject(new Error(message));
        } else if (error.request) {
            // Request made but no response received
            return Promise.reject(
                new Error('No response from server. Please check your connection.')
            );
        } else {
            // Something else happened
            return Promise.reject(new Error('An unexpected error occurred'));
        }
    }
);

export default api;
