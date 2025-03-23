import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Survey } from '../../survey/schemas/survey.schema';

@Schema({ timestamps: true })
export class Response {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Survey', required: true })
  surveyId: Survey;

  @Prop([{
    questionIndex: { type: Number, required: true },
    value: { type: MongooseSchema.Types.Mixed, required: true }
  }])
  answers: Array<{
    questionIndex: number;
    value: string | number;
  }>;

  @Prop({ type: Date, default: Date.now })
  submittedAt: Date;
}

export type ResponseDocument = Response & Document;
export const ResponseSchema = SchemaFactory.createForClass(Response); 