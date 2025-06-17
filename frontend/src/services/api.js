import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1'; // Adjust port as needed

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for handling errors
api.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors here
    console.error('API Error:', error);
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