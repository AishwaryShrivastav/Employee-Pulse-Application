import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Survey, Question, QuestionType } from '../types';
import { surveyAPI } from '../services/api';

export const SurveyManagementPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSurvey, setNewSurvey] = useState<{
    title: string;
    description: string;
    questions: Question[];
  }>({
    title: '',
    description: '',
    questions: [],
  });

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const data = await surveyAPI.getSurveys();
      setSurveys(data);
    } catch (err) {
      setError('Failed to fetch surveys');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await surveyAPI.createSurvey(newSurvey);
      setShowCreateForm(false);
      setNewSurvey({
        title: '',
        description: '',
        questions: [],
      });
      fetchSurveys();
    } catch (err) {
      setError('Failed to create survey');
    }
  };

  const handleDeleteSurvey = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this survey?')) {
      return;
    }
    try {
      await surveyAPI.deleteSurvey(id);
      fetchSurveys();
    } catch (err) {
      setError('Failed to delete survey. Please try again.');
    }
  };

  const addQuestion = () => {
    setNewSurvey(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          text: '',
          type: QuestionType.RATING,
          options: [],
          required: true,
        },
      ],
    }));
  };

  const updateQuestion = (index: number, field: string, value: string | boolean) => {
    setNewSurvey(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      ),
    }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Survey Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Survey Management</h1>
          <button onClick={() => setShowCreateForm(true)} className="btn btn-primary">
            Create New Survey
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateSurvey} className="card mb-8">
            <h2 className="text-xl font-semibold mb-4">Create New Survey</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={newSurvey.title}
                  onChange={e => setNewSurvey(prev => ({ ...prev, title: e.target.value }))}
                  className="form-input mt-1 block w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newSurvey.description}
                  onChange={e => setNewSurvey(prev => ({ ...prev, description: e.target.value }))}
                  className="form-textarea mt-1 block w-full"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Questions</label>
                <div className="space-y-4 mt-2">
                  {newSurvey.questions.map((question, index) => (
                    <div key={index} className="p-4 border rounded">
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={question.text}
                          onChange={e => updateQuestion(index, 'text', e.target.value)}
                          placeholder="Question text"
                          className="form-input block w-full"
                          required
                        />
                        <select
                          value={question.type}
                          onChange={e => updateQuestion(index, 'type', e.target.value)}
                          className="form-select block w-full"
                          required
                        >
                          <option value={QuestionType.RATING}>Rating</option>
                          <option value={QuestionType.CHOICE}>Choice</option>
                          <option value={QuestionType.TEXT}>Text</option>
                        </select>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={question.required}
                            onChange={e => updateQuestion(index, 'required', e.target.checked)}
                            className="form-checkbox"
                          />
                          <span className="ml-2 text-sm text-gray-700">Required</span>
                        </label>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addQuestion} className="btn btn-secondary">
                    Add Question
                  </button>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Survey
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {surveys.map(survey => (
            <div key={survey._id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{survey.title}</h3>
                  <p className="text-sm text-gray-500">{survey.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/surveys/${survey._id}/edit`)}
                    className="btn btn-secondary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSurvey(survey._id)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => navigate(`/surveys/${survey._id}/responses`)}
                    className="btn btn-primary"
                  >
                    View Responses
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700">Questions:</h4>
                <ul className="mt-2 space-y-1">
                  {survey.questions.map((question, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {index + 1}. {question.text} ({question.type})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
