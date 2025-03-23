import React from 'react';
import { SurveyResponse } from '../types';

interface ResponseListProps {
  responses: SurveyResponse[];
  isAdmin?: boolean;
}

export const ResponseList: React.FC<ResponseListProps> = ({ responses, isAdmin = false }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        {isAdmin ? 'All Survey Responses' : 'My Survey Responses'}
      </h2>

      <div className="space-y-4">
        {responses.map((response) => (
          <div key={response._id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {response.surveyId.title}
                </h3>
                {isAdmin && (
                  <p className="text-sm text-gray-500">
                    Submitted by: {response.userId.name}
                  </p>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {new Date(response.submittedAt).toLocaleDateString()}
              </p>
            </div>

            <div className="mt-4 space-y-4">
              {response.answers.map((answer, index) => (
                <div key={index} className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">
                    Question {answer.questionIndex + 1}
                  </p>
                  <p className="text-sm text-gray-900">
                    {typeof answer.value === 'number'
                      ? `${answer.value}/5`
                      : answer.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {responses.length === 0 && (
        <p className="text-gray-500 text-center py-4">
          No responses found.
        </p>
      )}
    </div>
  );
}; 