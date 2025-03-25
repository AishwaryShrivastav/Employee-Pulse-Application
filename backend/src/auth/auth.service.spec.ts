import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException } from '@nestjs/common';
import { UserRole } from '../users/schemas/user.schema';
import * as bcrypt from 'bcrypt';

// Mock implementations
jest.mock('bcrypt');

const mockUser = {
  _id: '60d0fe4f5311236168a109ca',
  name: 'John Doe',
  email: 'john@example.com',
  password: 'hashedPassword123',
  role: UserRole.EMPLOYEE,
  toObject: jest.fn().mockReturnValue({
    _id: '60d0fe4f5311236168a109ca',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedPassword123',
    role: UserRole.EMPLOYEE,
  }),
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user object without password if validation succeeds', async () => {
      // Arrange
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.validateUser('john@example.com', 'password123');

      // Assert
      expect(usersService.findOneByEmail).toHaveBeenCalledWith('john@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword123');
      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('name', 'John Doe');
    });

    it('should return null if user is not found', async () => {
      // Arrange
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null as any);

      // Act
      const result = await service.validateUser('nonexistent@example.com', 'password123');

      // Assert
      expect(result).toBeNull();
    });

    it('should return null if password is incorrect', async () => {
      // Arrange
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act
      const result = await service.validateUser('john@example.com', 'wrongPassword');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should generate a JWT token and return it with user info', async () => {
      // Arrange
      const user = { ...mockUser };
      // Create a new object without the password field
      const userWithoutPassword = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      };
      
      const token = 'generatedJwtToken';
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(token);

      // Act
      const result = await service.login(user as any);

      // Assert
      expect(jwtService.signAsync).toHaveBeenCalled();
      expect(result).toEqual({
        access_token: token,
        user: expect.objectContaining({
          _id: mockUser._id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
        }),
      });
    });
  });

  describe('register', () => {
    it('should create a new user and return login info', async () => {
      // Arrange
      const registerDto = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
      };
      const hashedPassword = 'hashedPassword123';
      const newUser = {
        ...registerDto,
        _id: 'newUserId',
        role: UserRole.EMPLOYEE,
        password: hashedPassword,
        toObject: jest.fn().mockReturnValue({
          _id: 'newUserId',
          name: 'New User',
          email: 'newuser@example.com',
          password: hashedPassword,
          role: UserRole.EMPLOYEE,
        }),
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      jest.spyOn(usersService, 'create').mockResolvedValue(newUser as any);
      jest.spyOn(service, 'login').mockResolvedValue({
        access_token: 'newUserToken',
        user: {
          _id: 'newUserId',
          name: 'New User',
          email: 'newuser@example.com',
          role: UserRole.EMPLOYEE,
        },
      });

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(usersService.create).toHaveBeenCalledWith({
        ...registerDto,
        password: hashedPassword,
        role: UserRole.EMPLOYEE,
      });
      expect(service.login).toHaveBeenCalled();
      expect(result).toEqual({
        access_token: 'newUserToken',
        user: {
          _id: 'newUserId',
          name: 'New User',
          email: 'newuser@example.com',
          role: UserRole.EMPLOYEE,
        },
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      // Arrange
      const registerDto = {
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123',
      };
      const error = new Error('Duplicate key error');
      (error as any).code = 11000;
      jest.spyOn(usersService, 'create').mockRejectedValue(error);

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });
});
