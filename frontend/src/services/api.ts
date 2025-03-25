import axios, { AxiosInstance } from 'axios';
import type {
  Survey,
  SurveyResponse,
  Question,
  User,
  LoginCredentials,
} from '../types';

/**
 * API configuration constants
 */
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Create axios instance with default config
 */
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to add authentication token to requests
 */
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // Log token being sent for debugging
    console.log('Setting Authorization header with token', token.substring(0, 15) + '...');
  } else {
    console.warn('No token found in localStorage');
  }
  return config;
});

/**
 * Response interceptor to handle API errors and unauthorized responses
 */
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

/**
 * Authentication API endpoints
 */
export const authAPI = {
  /**
   * Login user with email and password
   * @param email User email
   * @param password User password
   * @returns Authentication response with token and user data
   */
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  /**
   * Get current user information using the stored token
   * @returns User data
   */
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

/**
 * Survey API endpoints
 */
export const surveyAPI = {
  /**
   * Get all surveys
   * @returns Array of surveys
   */
  getSurveys: async () => {
    const response = await api.get('/surveys');
    return response.data;
  },

  /**
   * Create a new survey (admin only)
   * @param survey Survey data to create
   * @returns Created survey
   */
  createSurvey: async (survey: { title: string; description: string; questions: Question[] }) => {
    const response = await api.post('/surveys', survey);
    return response.data;
  },

  /**
   * Update an existing survey (admin only)
   * @param id Survey ID
   * @param survey Updated survey data
   * @returns Updated survey
   */
  updateSurvey: async (id: string, survey: { title: string; description: string; questions: Question[] }) => {
    const response = await api.put(`/surveys/${id}`, survey);
    return response.data;
  },

  /**
   * Update survey status (admin only)
   * @param id Survey ID
   * @param isActive New active status
   * @returns Updated survey
   */
  updateSurveyStatus: async (id: string, isActive: boolean) => {
    const response = await api.patch(`/surveys/${id}/status`, { isActive });
    return response.data;
  },

  /**
   * Delete a survey (admin only)
   * @param id Survey ID
   * @returns Deletion confirmation
   */
  deleteSurvey: async (id: string) => {
    const response = await api.delete(`/surveys/${id}`);
    return response.data;
  },

  /**
   * Submit a survey response
   * @param surveyId Survey ID
   * @param answers User's answers to the survey
   * @returns Submission confirmation
   */
  submitResponse: async (surveyId: string, answers: Array<{ questionIndex: number; value: string }>) => {
    const response = await api.post('/responses', {
      surveyId,
      answers,
    });
    return response.data;
  },

  /**
   * Get user's own responses
   * @returns Array of user's survey responses
   */
  getMyResponses: async () => {
    try {
      console.log('Calling API: GET /responses/my');
      
      // Log auth token presence for debugging
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token found in localStorage when calling getMyResponses');
      }
      
      const response = await api.get('/responses/my');
      console.log('API response status:', response.status);
      
      if (!response.data || typeof response.data !== 'object') {
        console.error('Invalid response data format:', response.data);
        return [];
      }
      
      return response.data;
    } catch (error: any) {  // Type error as any to allow accessing properties
      console.error('Error fetching user responses:', error);
      
      // Check for specific error types
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        
        // If 401 Unauthorized, redirect to login
        if (error.response.status === 401) {
          console.error('Authentication error - redirecting to login');
          // Don't navigate here, let the component handle it
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      }
      
      throw error; // Re-throw the error for the component to handle
    }
  },

  /**
   * Get all responses (admin only)
   * @param page Page number for pagination
   * @param limit Number of items per page
   * @returns Paginated responses
   */
  getAllResponses: async (page = 1, limit = 10) => {
    const response = await api.get('/responses', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Get responses for a specific survey (admin only)
   * @param surveyId Survey ID
   * @returns Survey responses
   */
  getSurveyResponses: async (surveyId: string) => {
    try {
      console.log('Fetching responses for survey ID:', surveyId);
      const response = await api.get('/responses', {
        params: { surveyId },
      });
      console.log('Responses data received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching survey responses:', error);
      throw error;
    }
  },

  /**
   * Export responses to CSV (admin only)
   * @returns Blob with CSV data
   */
  exportResponses: async () => {
    const response = await api.get('/responses/export', {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Get survey completion status
   * @returns Status of surveys for the current user
   */
  getSurveyStatus: async () => {
    const response = await api.get('/responses/status');
    return response.data;
  },

  /**
   * Get surveys available to the current user
   * @returns Array of available surveys
   */
  getAvailableSurveys: async () => {
    const response = await api.get('/surveys/available');
    return response.data.map((survey: any) => ({
      id: survey._id,
      title: survey.title,
      description: survey.description,
      createdAt: survey.createdAt,
      status: survey.status || 'Pending',
      submittedAt: survey.submittedAt || null,
      questionCount: survey.questions?.length || 0,
      isActive: survey.isActive,
      dueDate: survey.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }));
  },

  /**
   * Get a single survey by ID
   * @param id Survey ID
   * @returns Survey details
   */
  getSurvey: async (id: string) => {
    console.log('Fetching survey with ID:', id);
    try {
      const response = await api.get(`/surveys/${id}`);
      const data = response.data;
      console.log('Survey data received:', data);
      
      return {
        id: data.id || data._id,
        title: data.title,
        description: data.description,
        totalQuestions: data.totalQuestions || data.questions.length,
        questions: data.questions.map((q: any) => ({
          id: q.id || q._id,
          index: q.index || 0,
          text: q.text,
          type: q.type,
          options: q.options || [],
          required: q.required || false
        }))
      };
    } catch (error) {
      console.error('Error fetching survey:', error);
      throw error;
    }
  },
};

/**
 * Export survey responses in the specified format
 * @param format Export format (e.g., 'csv', 'xlsx')
 * @returns URL to the exported file
 */
export const exportSurveyResponses = async (format: string): Promise<string> => {
  const response = await api.get(`/responses/export?format=${format}`);
  return response.data;
};

/**
 * Admin-specific API endpoints
 */
export const adminAPI = {
  /**
   * Get dashboard metrics for admin
   * @returns Dashboard metrics data
   */
  getDashboardMetrics: async () => {
    const response = await api.get('/admin/dashboard-metrics');
    return response.data;
  },

  /**
   * Get survey participation graph data
   * @returns Participation graph data
   */
  getSurveyParticipationGraph: async () => {
    const response = await api.get('/admin/survey-participation-graph');
    return response.data;
  },
};
