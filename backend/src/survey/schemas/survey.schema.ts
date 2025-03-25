/**
 * Survey Schema Definition
 * 
 * This file defines the MongoDB schema for surveys in the application.
 * It includes both the main Survey schema and the embedded Question schema.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Type definition for Survey document with Mongoose Document methods
export type SurveyDocument = Survey & Document;

/**
 * Question Schema (Embedded Document)
 * 
 * Defines the structure of individual questions within a survey:
 * - Supports different question types (rating, choice, text)
 * - Can include optional answer choices
 * - Can be marked as required or optional
 */
@Schema()
class Question {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;  // Unique identifier for each question

  @Prop({ required: true })
  text: string;  // The question text/prompt

  @Prop({ required: true })
  type: string;  // Question type (e.g., 'rating', 'choice', 'text')

  @Prop({ type: [String], required: false })
  options?: string[];  // Available options for choice questions

  @Prop({ default: false })
  required: boolean;  // Whether the question must be answered
}

/**
 * Survey Schema
 * 
 * Defines the structure of surveys in the application:
 * - Contains metadata (title, description, dates)
 * - Includes an array of embedded Question documents
 * - Tracks status and activity state
 * - Manages timestamps automatically
 */
@Schema({ timestamps: true })
export class Survey {
  @Prop({ required: true })
  title: string;  // Survey title/name

  @Prop({ required: true })
  description: string;  // Survey description/purpose

  @Prop({ type: [Question], default: [] })
  questions: Question[];  // Array of survey questions

  @Prop({ default: true })
  isActive: boolean;  // Whether the survey is currently active

  @Prop({ type: String, enum: ['Pending', 'Submitted'], default: 'Pending' })
  status: string;  // Current status of the survey

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;  // When the survey was created

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;  // When the survey was last updated

  @Prop({ type: Date, required: false })
  dueDate?: Date;  // Optional deadline for survey responses

  @Prop({ type: Date, required: false })
  submittedAt?: Date;  // When the survey was submitted (if applicable)

  @Prop({ type: Number, default: 0 })
  responseCount: number;  // Number of responses received
}

// Create and export the Mongoose schema from the Survey class
export const SurveySchema = SchemaFactory.createForClass(Survey);
