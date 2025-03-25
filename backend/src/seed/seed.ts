import { NestFactory } from '@nestjs/core';
import { UsersSeedService } from './users.seed';
import { SurveysSeedService } from './surveys.seed';
import { ResponsesSeedService } from './responses.seed';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

async function seed() {
  try {
    const app = await NestFactory.create(AppModule);

    console.log('Starting database seeding...');

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
    await usersSeedService.seed();
    await surveysSeedService.seed();
    await responsesSeedService.seed();

    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed().catch(err => {
  console.error('Failed to seed database:', err);
  process.exit(1);
});
