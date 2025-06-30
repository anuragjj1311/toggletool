import api from './api';

export const tabService = {
  // Get all tabs configuration
  getTabsConfig: async () => {
    const response = await api.get('/toggles/config');
    return response.data;
  },

  // Get a specific tab
  getTab: async (tabId) => {
    const response = await api.get(`/tabs/${tabId}`);
    return response.data;
  },

  // Get all tab objects (id and title)
  getAllTabs: async () => {
    const response = await api.get('/tabs');
    return response.data;
  },
}; 