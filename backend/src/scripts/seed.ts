import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersSeedService } from '../seed/users.seed';
import { SurveysSeedService } from '../seed/surveys.seed';
import { ResponsesSeedService } from '../seed/responses.seed';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

async function bootstrap() {
  console.log('Starting database seeding...');

  try {
    const app = await NestFactory.create(AppModule);

    // Get services
    const usersSeedService = app.get(UsersSeedService);
    const surveysSeedService = app.get(SurveysSeedService);
    const responsesSeedService = app.get(ResponsesSeedService);

    // Get models
    const UserModel = app.get<Model<any>>(getModelToken('User'));
    const SurveyModel = app.get<Model<any>>(getModelToken('Survey'));
    const ResponseModel = app.get<Model<any>>(getModelToken('Response'));

    // Drop existing collections
    console.log('Dropping existing collections...');
    await Promise.all([
      UserModel.deleteMany({}),
      SurveyModel.deleteMany({}),
      ResponseModel.deleteMany({}),
    ]);

    // Seed in sequence to maintain data consistency
    console.log('Seeding users...');
    await usersSeedService.seed();
    console.log('Seeding surveys...');
    await surveysSeedService.seed();
    console.log('Seeding responses...');
    await responsesSeedService.seed();

    console.log('Database seeding completed successfully');
    await app.close();
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
}

bootstrap(); 