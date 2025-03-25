import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Survey } from '../../survey/schemas/survey.schema';

export type ResponseDocument = Response & Document;

@Schema({ timestamps: true })
export class Response {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Survey', required: true })
  surveyId: Types.ObjectId;

  @Prop([{
    questionIndex: { type: Number, required: true },
    value: { type: String, required: true }
  }])
  answers: Array<{
    questionIndex: number;
    value: string;
  }>;

  @Prop({ type: Date, default: Date.now })
  submittedAt: Date;

  @Prop({ type: Boolean, default: true })
  isCompleted: boolean;
}

export const ResponseSchema = SchemaFactory.createForClass(Response);
