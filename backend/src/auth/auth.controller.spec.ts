import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginRequest, RegisterRequest } from './interfaces/auth.interfaces';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser = {
    _id: 'test-id',
    name: 'Test User',
    email: 'test@example.com',
    role: 'employee',
  };

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
    authService = module.get<AuthService>(AuthService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginRequest: LoginRequest = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return token and user data when credentials are valid', async () => {
      const expectedResponse = {
        access_token: 'jwt-token',
        user: mockUser,
      };

      mockAuthService.validateUser.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginRequest);

      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        loginRequest.email,
        loginRequest.password,
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginRequest)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    const registerRequest: RegisterRequest = {
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
    };

    it('should return token and user data when registration is successful', async () => {
      const expectedResponse = {
        access_token: 'jwt-token',
        user: {
          ...mockUser,
          name: registerRequest.name,
          email: registerRequest.email,
        },
      };

      mockAuthService.register.mockResolvedValue(expectedResponse);

      const result = await controller.register(registerRequest);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerRequest);
      expect(result).toEqual(expectedResponse);
    });

    it('should propagate errors from the auth service', async () => {
      const error = new UnauthorizedException('Email already exists');
      mockAuthService.register.mockRejectedValue(error);

      await expect(controller.register(registerRequest)).rejects.toThrow(error);
    });
  });
}); 