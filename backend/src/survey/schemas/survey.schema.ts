import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Survey extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop([
    {
      text: { type: String, required: true },
      type: { type: String, required: true, enum: ['text', 'rating', 'choice'] },
      options: [String],
      required: { type: Boolean, default: true },
    },
  ])
  questions: Array<{
    text: string;
    type: string;
    options?: string[];
    required: boolean;
  }>;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const SurveySchema = SchemaFactory.createForClass(Survey);
