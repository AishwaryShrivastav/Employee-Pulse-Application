/**
 * Root application module for the Employee Pulse API
 * 
 * This module integrates all feature modules and configures global dependencies:
 * - Configuration management
 * - Database connection
 * - Authentication
 * - Domain-specific modules (surveys, responses, etc.)
 */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SurveyModule } from './survey/survey.module';
import { ResponsesModule } from './responses/responses.module';
import { SeedModule } from './seed/seed.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    // Load environment variables from .env file
    // isGlobal: true makes the config available throughout the application
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Set up MongoDB connection using Mongoose
    // Uses environmental variable MONGODB_URI or falls back to localhost connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    // Feature modules
    AuthModule,      // Handles authentication and authorization
    UsersModule,     // Manages user accounts and profiles
    SurveyModule,    // Manages survey creation, editing, and retrieval
    ResponsesModule, // Handles survey responses from users
    SeedModule,      // Provides database seeding functionality
    AdminModule,     // Admin-specific features and analytics
  ],
})
export class AppModule {}
