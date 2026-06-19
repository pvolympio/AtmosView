import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000,
});

// Interceptor para injetar o token JWT em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
  },

  getWeatherSourceComparison: async (city, startDate, endDate) => {
    try {
      const response = await api.get(`/weather/source-comparison`, {
        params: { city, start_date: startDate, end_date: endDate }
      });
      return response.data;
    } catch (error) {
      console.error("Error calling weather source comparison API:", error);
      throw error;
    }
  },

  getNearestStations: async (lat, lon) => {
    try {
      const response = await api.get(`/stations/nearest`, {
        params: { lat, lon }
      });
      return response.data;
    } catch (error) {
      console.error("Error calling nearest station API:", error);
      throw error;
    }
  },

  // --- V5 AUTHENTICATION, FAVORITES, ALERTS & REPORTS ---
  login: async (email, password) => {
    try {
      const response = await api.post(`/auth/login`, { email, password });
      return response.data;
    } catch (error) {
      console.error("Error calling login API:", error);
      throw error;
    }
  },

  register: async (email, password, fullName) => {
    try {
      const response = await api.post(`/auth/register`, {
        email,
        password,
        full_name: fullName
      });
      return response.data;
    } catch (error) {
      console.error("Error calling register API:", error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get(`/auth/me`);
      return response.data;
    } catch (error) {
      console.error("Error calling getCurrentUser API:", error);
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put(`/auth/profile`, profileData);
      return response.data;
    } catch (error) {
      console.error("Error calling updateProfile API:", error);
      throw error;
    }
  },

  getFavorites: async () => {
    try {
      const response = await api.get(`/auth/favorites`);
      return response.data;
    } catch (error) {
      console.error("Error calling getFavorites API:", error);
      throw error;
    }
  },

  addFavorite: async (cityData) => {
    try {
      const response = await api.post(`/auth/favorites`, cityData);
      return response.data;
    } catch (error) {
      console.error("Error calling addFavorite API:", error);
      throw error;
    }
  },

  deleteFavorite: async (id) => {
    try {
      const response = await api.delete(`/auth/favorites/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error calling deleteFavorite API:", error);
      throw error;
    }
  },

  getAlerts: async () => {
    try {
      const response = await api.get(`/auth/alerts`);
      return response.data;
    } catch (error) {
      console.error("Error calling getAlerts API:", error);
      throw error;
    }
  },

  createAlert: async (alertData) => {
    try {
      const response = await api.post(`/auth/alerts`, alertData);
      return response.data;
    } catch (error) {
      console.error("Error calling createAlert API:", error);
      throw error;
    }
  },

  generateReport: async (city, reportType, period, data) => {
    try {
      const response = await api.post(`/reports/generate`, {
        city,
        report_type: reportType,
        period,
        data
      }, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error("Error calling generateReport API:", error);
      throw error;
    }
  }
};

export default api;
