import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Survey, SurveySchema } from '../survey/schemas/survey.schema';
import { Response, ResponseSchema } from '../responses/schemas/response.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { SurveyResponse, SurveyResponseSchema } from '../schemas/survey-response.schema';
import { OpenAIService } from '../services/openai.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Survey.name, schema: SurveySchema },
      { name: Response.name, schema: ResponseSchema },
      { name: User.name, schema: UserSchema },
      { name: SurveyResponse.name, schema: SurveyResponseSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, OpenAIService],
})
export class AdminModule {} 