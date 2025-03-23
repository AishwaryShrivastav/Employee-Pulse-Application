import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    _id: 'test-id',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword123',
    role: 'employee',
    toObject: () => ({
      _id: 'test-id',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword123',
      role: 'employee',
    }),
  };

  const mockUsersService = {
    findOneByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user object without password if validation succeeds', async () => {
      const email = 'test@example.com';
      const password = 'correctPassword';
      
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const result = await service.validateUser(email, password);
      
      const { password: _, ...expectedUser } = mockUser.toObject();
      expect(result).toEqual(expectedUser);
    });

    it('should return null if user is not found', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password');
      
      expect(result).toBeNull();
    });

    it('should return null if password is incorrect', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      const result = await service.validateUser('test@example.com', 'wrongPassword');
      
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should generate JWT token and return user data', async () => {
      const mockToken = 'generated-jwt-token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(mockUser);

      expect(result).toEqual({
        access_token: mockToken,
        user: {
          _id: mockUser._id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
        },
      });
    });

    it('should throw UnauthorizedException if user is null', async () => {
      await expect(service.login(null)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    const registerDto = {
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
      role: 'employee',
    };

    it('should create new user and return token with user data', async () => {
      const hashedPassword = 'hashedPassword123';
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve(hashedPassword));
      
      mockUsersService.create.mockResolvedValue({
        ...mockUser,
        ...registerDto,
        password: hashedPassword,
      });

      mockJwtService.sign.mockReturnValue('new-user-token');

      const result = await service.register(registerDto);

      expect(mockUsersService.create).toHaveBeenCalledWith({
        ...registerDto,
        password: hashedPassword,
      });

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException if email already exists', async () => {
      mockUsersService.create.mockRejectedValue({ code: 11000 });

      await expect(service.register(registerDto))
        .rejects
        .toThrow(UnauthorizedException);
    });

    it('should propagate other errors', async () => {
      const error = new Error('Database connection failed');
      mockUsersService.create.mockRejectedValue(error);

      await expect(service.register(registerDto))
        .rejects
        .toThrow(error);
    });
  });
}); 