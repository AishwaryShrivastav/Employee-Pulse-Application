/**
 * User Schema Definition
 * 
 * This file defines the MongoDB schema for user data in the application.
 * It includes the user model properties and role enum for access control.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * UserRole Enumeration
 * 
 * Defines the available user roles for role-based access control:
 * - EMPLOYEE: Regular user who can complete surveys
 * - ADMIN: Administrative user with full system access
 */
export enum UserRole {
  EMPLOYEE = 'employee',
  ADMIN = 'admin'
}

/**
 * User Schema
 * 
 * Defines the structure and validation rules for user documents:
 * - Includes basic user information (name, email)
 * - Stores securely hashed passwords
 * - Contains role information for authorization
 * - Automatically manages timestamps for created/updated
 */
@Schema({ timestamps: true }) // Adds createdAt and updatedAt fields automatically
export class User extends Document {
  @Prop({ required: true })
  name: string;  // User's full name

  @Prop({ required: true, unique: true })
  email: string; // User's email (must be unique)

  @Prop({ required: true })
  password: string; // Hashed password (never stored in plain text)

  @Prop({ type: String, enum: UserRole, default: UserRole.EMPLOYEE })
  role: UserRole; // User's role for access control
}

// Create and export the Mongoose schema from the User class
export const UserSchema = SchemaFactory.createForClass(User);
