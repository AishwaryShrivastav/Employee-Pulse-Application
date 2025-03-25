/**
 * Authentication Module
 * 
 * This module handles all authentication-related functionality including:
 * - User login and authentication
 * - JWT token generation and validation
 * - User registration (if needed)
 * - Security strategies
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // Import UsersModule to have access to user data and validation
    UsersModule,
    
    // Import PassportModule for authentication strategies
    PassportModule,
    
    // Configure JWT authentication
    // - Loads JWT_SECRET from environment variables
    // - Sets token expiration time to 1 day
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController], // Handle HTTP requests for authentication
  providers: [
    AuthService,  // Core authentication business logic
    JwtStrategy,  // JWT validation strategy for protected routes
  ],
  exports: [AuthService], // Export AuthService for use in other modules
})
export class AuthModule {}
