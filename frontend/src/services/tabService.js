import api from './api';

export const tabService = {
  // Get all tabs configuration
  getTabsConfig: async () => {
    const response = await api.get('/tabs/config');
    return response.data;
  },

  // Get a specific tab
  getTab: async (tabId) => {
    const response = await api.get(`/tabs/${tabId}`);
    return response.data;
  },

  // Update a tab
  updateTab: async (tabId, data) => {
    const response = await api.patch(`/tabs/${tabId}`, data);
    return response.data;
  },

  // Get toggles for a specific tab
  getTabToggles: async (tabId) => {
    const response = await api.get(`/tabs/${tabId}/toggles`);
    return response.data;
  },

  // Get category toggles for a tab
  getCategoryToggles: async (tabId) => {
    const response = await api.get(`/tabs/${tabId}/categories`);
    return response.data;
  },

  // Get shop toggles for a tab
  getShopToggles: async (tabId) => {
    const response = await api.get(`/tabs/${tabId}/shops`);
    return response.data;
  }
}; 