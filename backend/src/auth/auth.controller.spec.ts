import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { LoginRequest, RegisterRequest } from './interfaces/auth.interfaces';
import { UserRole } from '../users/schemas/user.schema';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto: LoginRequest = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      _id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      role: UserRole.EMPLOYEE,
    };

    it('should return token and user data for valid credentials', async () => {
      mockAuthService.validateUser.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue({
        access_token: 'jwt_token',
        user: mockUser,
      });

      const result = await controller.login(loginDto);

      expect(result).toEqual({
        access_token: 'jwt_token',
        user: mockUser,
      });
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    const registerDto: RegisterRequest = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      _id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      role: UserRole.EMPLOYEE,
    };

    it('should register a new user and return token', async () => {
      mockAuthService.register.mockResolvedValue({
        access_token: 'jwt_token',
        user: mockUser,
      });

      const result = await controller.register(registerDto);

      expect(result).toEqual({
        access_token: 'jwt_token',
        user: mockUser,
      });
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });
  });
});
