import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get auth token from localStorage or store
    const storedData = localStorage.getItem('app-storage');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        const authToken = parsedData?.state?.authentication_state?.auth_token;
        if (authToken) {
          config.headers.Authorization = `Bearer ${authToken}`;
        }
      } catch (error) {
        console.error('Failed to parse stored auth data:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('app-storage');
      window.location.href = '/login';
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    } else if (error.response?.status >= 500) {
      console.error('Server error:', error.response.status);
    }
    return Promise.reject(error);
  }
);

export default api;