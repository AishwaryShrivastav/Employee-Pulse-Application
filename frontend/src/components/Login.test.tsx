import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
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

describe('Login Component', () => {
  const mockLogin = jest.fn();
  const mockAuthContext = {
    user: null,
    login: mockLogin,
    logout: jest.fn(),
    isAuthenticated: false,
    isAdmin: false,
    loading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <Login />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  it('should render the login form correctly', () => {
    renderComponent();
    
    // Check if the title is rendered
    expect(screen.getByText('Employee Pulse Login')).toBeInTheDocument();
    
    // Check if email and password inputs are rendered
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    
    // Check if login button is rendered
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should update input values when user types', () => {
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('should call login function with correct credentials on form submission', async () => {
    const loginResponse = {
      data: {
        access_token: 'mock-token',
        user: {
          _id: '123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'EMPLOYEE'
        }
      }
    };
    
    mockedAxios.post.mockResolvedValueOnce(loginResponse);
    
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/login`,
        {
          email: 'test@example.com',
          password: 'password123'
        }
      );
      expect(mockLogin).toHaveBeenCalledWith(loginResponse.data);
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should display error message on login failure', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Invalid credentials'
        }
      }
    });
    
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
    
    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should disable form submission during login process', async () => {
    // Using a delayed promise to simulate network latency
    mockedAxios.post.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        data: {
          access_token: 'mock-token',
          user: {
            _id: '123',
            name: 'Test User',
            email: 'test@example.com',
            role: 'EMPLOYEE'
          }
        }
      }), 100))
    );
    
    renderComponent();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    fireEvent.click(loginButton);
    
    // Immediately after clicking, button should be disabled
    expect(loginButton).toBeDisabled();
    
    // After the promise resolves, navigate should be called
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'));
  });

  it('should have form validation for required fields', async () => {
    renderComponent();
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    // Submit form without filling any fields
    fireEvent.click(loginButton);
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
    
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });
}); 