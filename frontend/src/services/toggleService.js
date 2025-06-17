import api from './api';
import { apiService } from './api';

export const toggleService = {
  // Get available toggle options
  getAvailableOptions: async () => {
    const response = await api.get('/available_options');
    return response.data;
  },

  // Get a specific toggle
  getToggle: async (toggleId) => {
    const response = await api.get(`/toggles/${toggleId}`);
    return response.data;
  },

  // Create a new toggle
  createToggle: async (tabId, toggleData) => {
    const response = await apiService.createToggle(tabId, toggleData);
    return response.data;
  },

  // Update a toggle
  updateToggle: async (toggleId, data) => {
    const response = await api.patch(`/toggles/${toggleId}`, data);
    return response.data;
  },

  // Delete a toggle
  deleteToggle: async (toggleId) => {
    const response = await api.delete(`/toggles/${toggleId}`);
    return response.data;
  },

  // Get tabs for a specific toggle
  getTabsForToggle: async (toggleId) => {
    const response = await api.get(`/toggles/${toggleId}/tabs_for_toggle`);
    return response.data;
  },

  // Restore a toggle
  restoreToggle: async (toggleId) => {
    const response = await api.patch(`/toggles/${toggleId}/restore`);
    return response.data;
  },

  // Reset a toggle
  resetToggle: async (toggleId) => {
    const response = await api.patch(`/toggles/${toggleId}/reset`);
    return response.data;
  }
}; 