import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

/**
 * Authentication service responsible for user authentication and token management.
 * Handles user login, registration, and JWT token operations.
 */
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Validates user credentials against the database.
   * @param email - User's email address
   * @param password - User's plain text password
   * @returns The user object without password if validation succeeds, null otherwise
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  /**
   * Generates a JWT token for authenticated users.
   * @param user - The authenticated user object
   * @returns Object containing the access token and user information
   * @throws UnauthorizedException if user validation fails
   */
  async login(user: any) {
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { 
      email: user.email, 
      sub: user._id, 
      role: user.role 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Registers a new user in the system.
   * @param createUserDto - User registration data
   * @returns Object containing the access token and user information
   * @throws Error if registration fails
   */
  async register(createUserDto: any) {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const user = await this.usersService.create({
        ...createUserDto,
        password: hashedPassword,
      });
      return this.login(user);
    } catch (error) {
      if (error.code === 11000) { // MongoDB duplicate key error
        throw new UnauthorizedException('Email already exists');
      }
      throw error;
    }
  }
} 