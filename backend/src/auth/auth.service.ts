import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterRequest, LoginResponse } from './interfaces/auth.interfaces';
import { User, UserRole } from '../users/schemas/user.schema';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Document, Types } from 'mongoose';

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
   * @param pass - User's plain text password
   * @returns The user object without password if validation succeeds, null otherwise
   */
  async validateUser(email: string, pass: string): Promise<Omit<User, 'password'> | null> {
    try {
      const user = await this.usersService.findOneByEmail(email).catch(() => null);
      if (!user) {
        return null;
      }

      const isMatch = await bcrypt.compare(pass, user.password);
      if (!isMatch) {
        return null;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user.toObject();
      return result;
    } catch (error) {
      console.error('Error validating user:', error);
      return null;
    }
  }

  /**
   * Generates a JWT token for authenticated users.
   * @param user - The authenticated user object
   * @returns Object containing the access token and user information
   */
  async login(user: Omit<User, 'password'>): Promise<LoginResponse> {
    const payload = {
      email: user.email,
      sub: user._id,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload);
    return {
      access_token: token,
      user: {
        _id: (user._id as Types.ObjectId).toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Registers a new user in the system.
   * @param registerDto - User registration data
   * @returns Object containing the access token and user information
   * @throws ConflictException if email already exists
   */
  async register(registerDto: RegisterRequest): Promise<LoginResponse> {
    try {
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      const createUserDto: CreateUserDto = {
        ...registerDto,
        password: hashedPassword,
        role: UserRole.EMPLOYEE, // Default role for new registrations
      };

      const newUser = await this.usersService.create(createUserDto);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = newUser.toObject();
      return await this.login(userWithoutPassword);
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 11000) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }
}
