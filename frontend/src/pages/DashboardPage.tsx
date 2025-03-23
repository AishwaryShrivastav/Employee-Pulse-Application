import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Survey, SurveyResponse } from '../types';
import { surveyAPI } from '../services/api';
import { SurveyForm } from '../components/SurveyForm';
import { ResponseList } from '../components/ResponseList';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [surveysData, responsesData] = await Promise.all([
        surveyAPI.getSurveys(),
        surveyAPI.getMyResponses(),
      ]);
      setSurveys(surveysData);
      setResponses(responsesData);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSurveySubmit = async () => {
    await fetchData();
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Employee Pulse Survey
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {surveys.map((survey) => (
            <div key={survey._id} className="card">
              <SurveyForm
                survey={survey}
                onSubmit={handleSurveySubmit}
              />
            </div>
          ))}

          <ResponseList responses={responses} />
        </div>
      </main>
    </div>
  );
}; 