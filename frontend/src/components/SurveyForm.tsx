import React, { useState } from 'react';
import { Survey, Question, QuestionType } from '../types';
import { surveyAPI } from '../services/api';

interface SurveyFormProps {
  survey: Survey;
  onSubmit: () => void;
}

export const SurveyForm: React.FC<SurveyFormProps> = ({ survey, onSubmit }) => {
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formattedAnswers = Object.entries(answers).map(([index, value]) => ({
        questionIndex: parseInt(index),
        value,
      }));

      await surveyAPI.submitResponse(survey._id, formattedAnswers);
      onSubmit();
    } catch (err) {
      setError('Failed to submit survey. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex: number, value: string | number) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: value,
    }));
  };

  const renderQuestion = (question: Question, index: number) => {
    switch (question.type) {
      case QuestionType.RATING:
        return (
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map(rating => (
              <label key={rating} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`question-${index}`}
                  value={rating}
                  checked={answers[index] === rating}
                  onChange={e => handleAnswerChange(index, parseInt(e.target.value))}
                  className="form-radio"
                  required={question.required}
                />
                <span className="text-sm text-gray-700">{rating}</span>
              </label>
            ))}
          </div>
        );

      case QuestionType.CHOICE:
        return (
          <div className="space-y-2">
            {question.options?.map((option: string) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`question-${index}`}
                  value={option}
                  checked={answers[index] === option}
                  onChange={e => handleAnswerChange(index, e.target.value)}
                  className="form-radio"
                  required={question.required}
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case QuestionType.TEXT:
        return (
          <textarea
            value={(answers[index] as string) || ''}
            onChange={e => handleAnswerChange(index, e.target.value)}
            className="form-textarea w-full"
            rows={4}
            required={question.required}
          />
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        {survey.questions.map((question, index) => (
          <div key={index} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {question.text}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderQuestion(question, index)}
          </div>
        ))}
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading ? 'Submitting...' : 'Submit Survey'}
      </button>
    </form>
  );
};
