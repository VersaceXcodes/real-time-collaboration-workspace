import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 30000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: (status) => {
    // Accept status codes from 200-299 and 401 (for auth handling)
    return (status >= 200 && status < 300) || status === 401;
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
  async (error) => {
    const originalRequest = error.config;
    
    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - server may be slow or unavailable');
      return Promise.reject(new Error('Request timeout. Please try again.'));
    }
    
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - server may be unavailable');
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    
    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('app-storage');
      // Force a page reload to clear all state
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
        window.location.reload();
      }
      return Promise.reject(error);
    }
    
    // Handle 502 Bad Gateway with retry logic
    if (error.response?.status === 502 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.warn('502 Bad Gateway - retrying request...');
      
      // Wait 1 second before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      return api(originalRequest);
    }
    
    // Handle server errors
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.status, error.response.data);
      return Promise.reject(new Error(`Server error (${error.response.status}). Please try again later.`));
    }
    
    // Handle client errors
    if (error.response?.status >= 400 && error.response?.status < 500) {
      console.error('Client error:', error.response.status, error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;