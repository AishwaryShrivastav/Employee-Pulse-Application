import axios, { AxiosInstance } from 'axios';
import { Survey, SurveyResponse, Question } from '../types';

// API configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authentication token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle API errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API endpoints
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Survey API endpoints
export const surveyAPI = {
  // Get all surveys
  getSurveys: async () => {
    const response = await api.get('/survey');
    return response.data;
  },

  // Create a new survey (admin only)
  createSurvey: async (survey: {
    title: string;
    description: string;
    questions: Question[];
  }) => {
    const response = await api.post('/survey', survey);
    return response.data;
  },

  // Delete a survey (admin only)
  deleteSurvey: async (id: string) => {
    const response = await api.delete(`/survey/${id}`);
    return response.data;
  },

  // Submit a survey response
  submitResponse: async (surveyId: string, answers: any[]) => {
    const response = await api.post('/responses', {
      surveyId,
      answers,
    });
    return response.data;
  },

  // Get user's responses
  getMyResponses: async () => {
    const response = await api.get('/responses/my');
    return response.data;
  },

  // Get all responses (admin only)
  getAllResponses: async (page = 1, limit = 10) => {
    const response = await api.get('/responses', {
      params: { page, limit },
    });
    return response.data;
  },

  // Export responses to CSV (admin only)
  exportResponses: async () => {
    const response = await api.get('/responses/export', {
      responseType: 'blob',
    });
    return response.data;
  },
}; 