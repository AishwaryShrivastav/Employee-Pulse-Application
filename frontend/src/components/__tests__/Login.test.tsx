import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthForm } from './AuthForm';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Login Component', () => {
  const mockLogin = jest.fn();
  const mockAuthContext = {
    user: null,
    loading: false,
    login: mockLogin,
    logout: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <AuthForm />
      </AuthContext.Provider>
    );
  });

  it('should render the login form correctly', () => {
    // Check if email and password inputs are rendered
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByText('Employee Pulse Login')).toBeInTheDocument();

    // Check if email and password inputs are empty
    expect(screen.getByLabelText(/email/i)).toHaveValue('');
    expect(screen.getByLabelText(/password/i)).toHaveValue('');

    // Check if login button is rendered
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should update form values when user types', () => {
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
        access_token: 'test-token',
        user: {
          id: '1',
          email: 'test@example.com',
          role: 'user',
        },
      },
    };

    // Mock the axios post request
    mockedAxios.post.mockResolvedValueOnce(loginResponse);

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

    // Submit the form
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    // Wait for the API call to complete
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/login`,
        {
          email: 'test@example.com',
          password: 'password123',
        }
      );
      expect(mockLogin).toHaveBeenCalledWith(loginResponse.data);
    });
  });

  it('should display error message on login failure', async () => {
    // Mock the axios post request to reject
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Invalid credentials',
        },
      },
    });

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });

    // Submit the form
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    // Wait for the error message
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  it('should disable form submission during login process', async () => {
    // Mock a delayed API response
    mockedAxios.post.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: {
                access_token: 'test-token',
                user: {
                  id: '1',
                  email: 'test@example.com',
                  role: 'user',
                },
              },
            });
          }, 1000);
        })
    );

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

    // Submit the form
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    // Check if button is disabled immediately after submission
    expect(loginButton).toBeDisabled();

    // Wait for the API call to complete
    await waitFor(() => {
      expect(loginButton).not.toBeDisabled();
    });
  });

  it('should validate required fields', async () => {
    // Submit the form without filling in any fields
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    // Check for validation messages
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });
}); 