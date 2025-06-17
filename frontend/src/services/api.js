import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1'; // Use absolute URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for CORS with credentials
});

// Add request interceptor for handling errors
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

// API service functions
export const apiService = {
  // Get all tabs with toggles
  getAllTabs: () => api.get('/tabs'),
  
  // Get available options (tab types, toggle types, etc.)
  getAvailableOptions: () => api.get('/toggles/available_options'),
  
  // Toggle operations
  createToggle: (tabId, toggleData) => 
    api.post(`/tabs/${tabId}/toggles`, toggleData),
  
  updateToggle: (tabId, toggleId, toggleData) => 
    api.put(`/tabs/${tabId}/toggles/${toggleId}`, toggleData),
  
  deleteToggle: (tabId, toggleId) => 
    api.delete(`/tabs/${tabId}/toggles/${toggleId}`),
  
  restoreToggle: (tabId, toggleId) => 
    api.post(`/tabs/${tabId}/toggles/${toggleId}/restore`),
  
  resetToggle: (tabId, toggleId) => 
    api.post(`/tabs/${tabId}/toggles/${toggleId}/reset`),
  
  // Get toggles for specific tab
  getTogglesForTab: (tabId, params = {}) => 
    api.get(`/tabs/${tabId}/toggles`, { params }),
  
  // Get tabs for specific toggle
  getTabsForToggle: (toggleId, params = {}) => 
    api.get(`/toggles/${toggleId}/tabs_for_toggle`, { params }),
};

export default api;