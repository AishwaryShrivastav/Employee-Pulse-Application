import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Survey } from '../survey/schemas/survey.schema';
import { User } from '../users/schemas/user.schema';

export type ResponseDocument = Response & Document;

@Schema()
export class Answer {
  @Prop({ required: true })
  questionIndex: number;

  @Prop({ required: true })
  value: string;
}

@Schema({ timestamps: true })
export class Response {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ type: Types.ObjectId, ref: 'Survey', required: true })
  surveyId: Survey;

  @Prop({ type: [Answer], required: true })
  answers: Answer[];

  @Prop({ required: true })
  submittedAt: Date;
}

export const ResponseSchema = SchemaFactory.createForClass(Response); 