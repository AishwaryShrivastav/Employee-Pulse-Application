/**
 * User role enumeration
 */
export enum UserRole {
  EMPLOYEE = 'employee',
  ADMIN = 'admin',
}

/**
 * User interface representing user data
 */
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
}

/**
 * Authentication response from the API
 */
export interface AuthResponse {
  access_token: string;
  user: User;
}

/**
 * Question types supported in surveys
 */
export enum QuestionType {
  RATING = 'rating',
  CHOICE = 'choice',
  TEXT = 'text',
}

/**
 * Question interface representing a survey question
 */
export interface Question {
  text: string;
  type: QuestionType;
  options?: string[];
  required?: boolean;
}

/**
 * Survey interface representing a survey
 */
export interface Survey {
  _id: string;
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
  status: 'Pending' | 'Submitted';
  submittedAt: string | null;
  questionCount: number;
  isActive: boolean;
  dueDate: string;
}

/**
 * SurveyResponse interface representing a user's response to a survey
 */
export interface SurveyResponse {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  surveyId: {
    _id: string;
    title: string;
    questions?: Question[];
  };
  answers: Array<{
    questionIndex: number;
    value: string | number;
  }>;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * LoginCredentials interface for authentication
 */
export interface LoginCredentials {
  email: string;
  password: string;
}
