import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

// Define the User interface for type safety
interface User {
  _id: string;
  name: string;
  email: string;
  role: 'employee' | 'admin' | 'hr';
}

// Define the AuthContext type with all required methods
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

// Create the context with undefined as initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component that wraps the application
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch user data using the stored token
  const fetchUser = async () => {
    try {
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
    } catch (err) {
      // Clear invalid token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  // Handle user login
  const login = async (email: string, password: string) => {
    try {
      const { access_token, user: userData } = await authAPI.login(email, password);
      localStorage.setItem('token', access_token);
      setUser(userData);
      return userData;
    } catch (err) {
      throw new Error('Invalid email or password');
    }
  };

  // Handle user registration
  const register = async (name: string, email: string, password: string) => {
    try {
      const { access_token, user: userData } = await authAPI.register(name, email, password);
      localStorage.setItem('token', access_token);
      setUser(userData);
      return userData;
    } catch (err) {
      throw new Error('Registration failed');
    }
  };

  // Handle user logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 