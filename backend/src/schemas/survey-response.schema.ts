import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class SurveyResponse extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  surveyId: string;

  @Prop({ required: true, min: 1, max: 5 })
  satisfaction: number;

  @Prop({ required: true, min: 1, max: 5 })
  workLifeBalance: number;

  @Prop({ required: true, min: 1, max: 5 })
  teamCollaboration: number;

  @Prop()
  feedback: string;

  @Prop({ default: Date.now })
  submittedAt: Date;
}

export const SurveyResponseSchema = SchemaFactory.createForClass(SurveyResponse); 