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

  createToggle: async (tab_id, data) => {
    const response = await api.post(`/toggles/tabs/${tab_id}`, data);
    return response.data;
  },

  // Delete a toggle
  deleteToggle: async (toggleId) => {
    const response = await apiService.deleteToggle(toggleId);
    return response.data;
  },

  // Get tabs for a specific toggle
  getTabsForToggle: async (toggleId) => {
    const response = await api.get(`/toggles/${toggleId}/tabs_for_toggle`);
    return response.data;
  },

  // Restore a toggle for a specific tab
  restoreToggle: async (toggleId, tabId) => {
    if (tabId) {
      const response = await apiService.restoreToggle(toggleId, tabId);
      return response.data;
    } else {
      const response = await apiService.restoreToggle(toggleId);
      return response.data;
    }
  },

  resetToggle: async (toggleId) => {
    const response = await apiService.resetToggle(toggleId);
    return response.data;
  },

  // Associate an existing toggle with a tab
  associateToggleWithTab: async (toggleId, tabId, data = {}) => {
    const response = await api.post(`/toggles/${toggleId}/tabs/${tabId}/associate`, data);
    return response.data;
  },

  // Update tab-toggle association for a specific tab and toggle
  updateTabToggleAssociation: async (toggleId, tabId, data = {}) => {
    const response = await api.patch(`/toggles/${toggleId}/tabs/${tabId}/association`, { association: data });
    return response.data;
  },
}; 