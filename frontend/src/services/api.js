import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true 
});

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

api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.data);
    return response;
  },
  (error) => {
    if (error.response) {

      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  getAllTabs: () => api.get('/tabs'),
  
  getAvailableOptions: () => api.get('/toggles/available_options'),
  
  deleteToggle: (toggleId) => 
    api.delete(`/toggles/${toggleId}`),
  
  restoreToggle: (toggleId, tabId = null) => {
    if (tabId) {
      return api.patch(`/toggles/${toggleId}/tabs/${tabId}/restore`);
    } else {
      return api.patch(`/toggles/${toggleId}/restore`);
    }
  },
  
  resetToggle: (toggleId) => 
    api.patch(`/toggles/${toggleId}/reset`),
  
  getTabsForToggle: (toggleId, params = {}) => 
    api.get(`/toggles/${toggleId}/tabs_for_toggle`, { params }),
};

export default api;