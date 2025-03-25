export enum UserRole {
  EMPLOYEE = 'employee',
  ADMIN = 'admin',
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export enum QuestionType {
  RATING = 'rating',
  CHOICE = 'choice',
  TEXT = 'text',
}

export interface Question {
  text: string;
  type: QuestionType;
  options?: string[];
  required?: boolean;
}

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

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}
