import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000,
});

export const weatherApi = {
  searchCities: async (name) => {
    try {
      const response = await api.get(`/cities/search`, {
        params: { name }
      });
      return response.data;
    } catch (error) {
      console.error("Error calling cities search API:", error);
      throw error;
    }
  },

  getWeatherDashboard: async (city) => {
    try {
      const response = await api.get(`/weather/dashboard`, {
        params: { city }
      });
      return response.data;
    } catch (error) {
      console.error("Error calling weather dashboard API:", error);
      throw error;
    }
  },

  getHistory: async () => {
    try {
      const response = await api.get(`/history`);
      return response.data;
    } catch (error) {
      console.error("Error calling history API:", error);
      throw error;
    }
  },

  getHistoryById: async (id) => {
    try {
      const response = await api.get(`/history/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error calling history detail API for ID ${id}:`, error);
      throw error;
    }
  },

  clearHistory: async () => {
    try {
      const response = await api.delete(`/history`);
      return response.data;
    } catch (error) {
      console.error("Error clearing history:", error);
      throw error;
    }
  },

  getWeatherHistory: async (city, startDate, endDate) => {
    try {
      const response = await api.get(`/weather/history`, {
        params: { city, start_date: startDate, end_date: endDate }
      });
      return response.data;
    } catch (error) {
      console.error("Error calling weather history API:", error);
      throw error;
    }
  },

  getWeatherCompare: async (city, startA, endA, startB, endB) => {
    try {
      const response = await api.get(`/weather/compare`, {
        params: {
          city,
          start_a: startA,
          end_a: endA,
          start_b: startB,
          end_b: endB
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error calling weather comparison API:", error);
      throw error;
    }
  },

  trainModels: async (city, periodYears = 2) => {
    try {
      const response = await api.post(`/ml/train`, {
        city,
        period_years: periodYears
      });
      return response.data;
    } catch (error) {
      console.error("Error calling train models API:", error);
      throw error;
    }
  },

  getPredictions: async (city) => {
    try {
      const response = await api.get(`/ml/predict`, {
        params: { city }
      });
      return response.data;
    } catch (error) {
      console.error("Error calling get predictions API:", error);
      throw error;
    }
  },

  getMLStatus: async (city) => {
    try {
      const response = await api.get(`/ml/status`, {
        params: { city }
      });
      return response.data;
    } catch (error) {
      console.error("Error calling get ML status API:", error);
      throw error;
    }
  }
};

export default api;
