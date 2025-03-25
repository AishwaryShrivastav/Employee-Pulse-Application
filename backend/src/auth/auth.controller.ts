import {
  Controller,
  Post,
  Get,
  Body,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequest, RegisterRequest, LoginResponse } from './interfaces/auth.interfaces';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '../users/schemas/user.schema';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// Swagger response class
class LoginResponseDto implements LoginResponse {
  @ApiProperty()
  access_token: string;

  @ApiProperty({
    type: 'object',
    properties: {
      _id: { type: 'string' },
      name: { type: 'string' },
      email: { type: 'string' },
      role: { type: 'string', enum: Object.values(UserRole) },
    },
  })
  user: {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

/**
 * Controller handling authentication-related endpoints
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Authenticates a user and returns a JWT token
   * @param loginDto - Login credentials
   * @returns JWT token and user information
   * @throws UnauthorizedException if credentials are invalid
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginRequest): Promise<LoginResponse> {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  /**
   * Registers a new user in the system
   * @param registerDto - User registration data
   * @returns JWT token and user information
   */
  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'User successfully registered', type: LoginResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() registerDto: RegisterRequest): Promise<LoginResponse> {
    return this.authService.register(registerDto);
  }

  /**
   * Retrieves the current authenticated user
   * @param req - Request with the user from JWT token
   * @returns Current user information
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Current user information' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@Request() req) {
    console.log('GET /auth/me endpoint called with user:', req.user?.userId);
    return req.user;
  }
}
