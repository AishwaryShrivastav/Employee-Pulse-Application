import { UserRole } from '../../users/schemas/user.schema';

/**
 * Interface for JWT payload structure
 */
export interface JwtPayload {
  email: string;
  sub: string;  // user ID
  role: UserRole;
}

/**
 * Interface for login response
 */
export interface LoginResponse {
  access_token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

/**
 * Interface for registration request data
 */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

/**
 * Interface for login request data
 */
export interface LoginRequest {
  email: string;
  password: string;
} 