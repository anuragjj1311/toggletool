import api from './api';

export const tabService = {
  // Get all tabs configuration
  getTabsConfig: async () => {
    const response = await api.get('/toggles/config');
    return response.data;
  },
}; 