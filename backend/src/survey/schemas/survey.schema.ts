import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SurveyDocument = Survey & Document;

@Schema()
class Question {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  type: string;

  @Prop({ type: [String], required: false })
  options?: string[];

  @Prop({ default: false })
  required: boolean;
}

@Schema({ timestamps: true })
export class Survey {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [Question], default: [] })
  questions: Question[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: String, enum: ['Pending', 'Submitted'], default: 'Pending' })
  status: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @Prop({ type: Date, required: false })
  dueDate?: Date;

  @Prop({ type: Date, required: false })
  submittedAt?: Date;

  @Prop({ type: Number, default: 0 })
  responseCount: number;
}

export const SurveySchema = SchemaFactory.createForClass(Survey);
