import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Survey, SurveySchema } from '../survey/schemas/survey.schema';
import { Response, ResponseSchema } from '../responses/schemas/response.schema';
import { UsersSeedService } from './users.seed';
import { SurveysSeedService } from './surveys.seed';
import { ResponsesSeedService } from './responses.seed';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Survey.name, schema: SurveySchema },
      { name: Response.name, schema: ResponseSchema },
    ]),
  ],
  providers: [UsersSeedService, SurveysSeedService, ResponsesSeedService],
  exports: [UsersSeedService, SurveysSeedService, ResponsesSeedService],
})
export class SeedModule {}
