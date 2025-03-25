/**
 * Response Schema Definition
 * 
 * This file defines the MongoDB schema for survey responses in the application.
 * It captures user answers to survey questions and tracks submission metadata.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Survey } from '../../survey/schemas/survey.schema';

// Type definition for Response document with Mongoose Document methods
export type ResponseDocument = Response & Document;

/**
 * Response Schema
 * 
 * Defines the structure of survey responses in the application:
 * - Links responses to both users and surveys
 * - Stores an array of answers to survey questions
 * - Tracks submission time and completion status
 * - Manages timestamps automatically
 */
@Schema({ timestamps: true })
export class Response {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;  // Reference to the user who submitted the response

  @Prop({ type: Types.ObjectId, ref: 'Survey', required: true })
  surveyId: Types.ObjectId;  // Reference to the survey being responded to

  @Prop([{
    questionIndex: { type: Number, required: true },
    value: { type: String, required: true }
  }])
  answers: Array<{
    questionIndex: number;  // Index of the question in the survey
    value: string;          // User's answer to the question
  }>;  // Array of answers to survey questions

  @Prop({ type: Date, default: Date.now })
  submittedAt: Date;  // When the response was submitted

  @Prop({ type: Boolean, default: true })
  isCompleted: boolean;  // Whether the response is complete or partial
}

// Create and export the Mongoose schema from the Response class
export const ResponseSchema = SchemaFactory.createForClass(Response);
