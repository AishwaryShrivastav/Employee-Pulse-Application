import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import SurveyList from './SurveyList';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock navigate function from react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('SurveyList Component', () => {
  const mockSurveys = [
    {
      _id: '1',
      title: 'Employee Satisfaction Survey',
      description: 'Rate your job satisfaction',
      isActive: true,
      status: 'ACTIVE',
      responseCount: 5,
      dueDate: '2023-06-30T00:00:00.000Z',
      userStatus: { status: 'PENDING', responseId: null },
    },
    {
      _id: '2',
      title: 'Work Environment Survey',
      description: 'Rate your work environment',
      isActive: true,
      status: 'ACTIVE',
      responseCount: 10,
      dueDate: '2023-07-15T00:00:00.000Z',
      userStatus: { status: 'COMPLETED', responseId: 'resp123' },
    },
    {
      _id: '3',
      title: 'Team Collaboration Survey',
      description: 'Rate team collaboration',
      isActive: false,
      status: 'DRAFT',
      responseCount: 0,
      dueDate: '2023-08-01T00:00:00.000Z',
      userStatus: { status: 'PENDING', responseId: null },
    },
  ];

  const mockUser = {
    _id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'EMPLOYEE',
  };

  const mockAuthContext = {
    user: mockUser,
    login: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: true,
    isAdmin: false,
    loading: false,
  };

  const mockAdminAuthContext = {
    ...mockAuthContext,
    isAdmin: true,
    user: { ...mockUser, role: 'ADMIN' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock surveys fetch
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/api/surveys')) {
        return Promise.resolve({ data: mockSurveys });
      }
      return Promise.reject(new Error('not found'));
    });
  });

  const renderComponent = (isAdmin = false) => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={isAdmin ? mockAdminAuthContext : mockAuthContext}>
          <SurveyList />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  it('should render survey list with correct data', async () => {
    renderComponent();
    
    // Initially should show loading state
    expect(screen.getByText(/loading surveys/i)).toBeInTheDocument();
    
    // Wait for surveys to load
    await waitFor(() => {
      expect(screen.queryByText(/loading surveys/i)).not.toBeInTheDocument();
    });
    
    // Should display survey titles
    expect(screen.getByText('Employee Satisfaction Survey')).toBeInTheDocument();
    expect(screen.getByText('Work Environment Survey')).toBeInTheDocument();
    
    // Should display survey descriptions
    expect(screen.getByText('Rate your job satisfaction')).toBeInTheDocument();
    expect(screen.getByText('Rate your work environment')).toBeInTheDocument();
    
    // Should display status badges
    const pendingBadges = screen.getAllByText('Pending');
    const completedBadges = screen.getAllByText('Completed');
    expect(pendingBadges.length).toBe(1); // Only active surveys are shown to employees
    expect(completedBadges.length).toBe(1);
  });

  it('should navigate to survey form when Take Survey button is clicked', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.queryByText(/loading surveys/i)).not.toBeInTheDocument();
    });
    
    // Find the Take Survey button for the first survey
    const takeSurveyButton = screen.getAllByText('Take Survey')[0];
    fireEvent.click(takeSurveyButton);
    
    // Should navigate to the survey form page with the correct survey ID
    expect(mockNavigate).toHaveBeenCalledWith('/surveys/1');
  });

  it('should navigate to view response when View Response button is clicked', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.queryByText(/loading surveys/i)).not.toBeInTheDocument();
    });
    
    // Find the View Response button for the completed survey
    const viewResponseButton = screen.getByText('View Response');
    fireEvent.click(viewResponseButton);
    
    // Should navigate to the response view page with the correct response ID
    expect(mockNavigate).toHaveBeenCalledWith('/responses/resp123');
  });

  it('should display admin actions for admin users', async () => {
    renderComponent(true); // Render for admin
    
    await waitFor(() => {
      expect(screen.queryByText(/loading surveys/i)).not.toBeInTheDocument();
    });
    
    // Should display add survey button for admins
    expect(screen.getByText('Add New Survey')).toBeInTheDocument();
    
    // Should display edit buttons for each survey
    const editButtons = screen.getAllByText('Edit');
    expect(editButtons.length).toBe(3); // All surveys should have edit buttons for admin
    
    // Should display delete buttons for each survey
    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons.length).toBe(3);
  });

  it('should display survey statistics for each survey', async () => {
    renderComponent(true); // Admin can see all stats
    
    await waitFor(() => {
      expect(screen.queryByText(/loading surveys/i)).not.toBeInTheDocument();
    });
    
    // Should display response counts
    expect(screen.getByText('Responses: 5')).toBeInTheDocument();
    expect(screen.getByText('Responses: 10')).toBeInTheDocument();
    
    // Should display due dates in readable format
    const dueDates = screen.getAllByText(/due:/i);
    expect(dueDates.length).toBe(3);
  });

  it('should handle errors when fetching surveys fails', async () => {
    // Mock a failed API call
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.queryByText(/loading surveys/i)).not.toBeInTheDocument();
    });
    
    // Should display error message
    expect(screen.getByText(/error loading surveys/i)).toBeInTheDocument();
  });

  it('should navigate to create survey page when Add New Survey is clicked (admin)', async () => {
    renderComponent(true); // Render for admin
    
    await waitFor(() => {
      expect(screen.queryByText(/loading surveys/i)).not.toBeInTheDocument();
    });
    
    // Click the Add New Survey button
    const addButton = screen.getByText('Add New Survey');
    fireEvent.click(addButton);
    
    // Should navigate to the create survey page
    expect(mockNavigate).toHaveBeenCalledWith('/admin/surveys/create');
  });

  it('should handle edit survey action', async () => {
    renderComponent(true); // Render for admin
    
    await waitFor(() => {
      expect(screen.queryByText(/loading surveys/i)).not.toBeInTheDocument();
    });
    
    // Click the first Edit button
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Should navigate to the edit survey page with the correct ID
    expect(mockNavigate).toHaveBeenCalledWith('/admin/surveys/1/edit');
  });

  it('should handle delete survey action', async () => {
    // Mock a successful delete API call
    mockedAxios.delete.mockResolvedValueOnce({});
    
    renderComponent(true); // Render for admin
    
    await waitFor(() => {
      expect(screen.queryByText(/loading surveys/i)).not.toBeInTheDocument();
    });
    
    // Click the first Delete button
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    // Should show confirmation dialog
    expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
    
    // Confirm deletion
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    
    // Should call the delete API with the correct ID
    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/surveys/1`
      );
    });
    
    // Should refresh the survey list
    expect(mockedAxios.get).toHaveBeenCalledTimes(2); // Initial load + refresh after delete
  });
}); 