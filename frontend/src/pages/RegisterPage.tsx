import React from 'react';
import { Link } from 'react-router-dom';
import { AuthForm } from '../components/AuthForm';

export const RegisterPage: React.FC = () => {
  return (
    <div>
      <AuthForm mode="register" />
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-800">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}; 