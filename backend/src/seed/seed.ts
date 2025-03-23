import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersSeedService } from './users.seed';
import { SurveysSeedService } from './surveys.seed';
import { ResponsesSeedService } from './responses.seed';

async function seed() {
  const app = await NestFactory.create(AppModule);

  try {
    console.log('Starting database seeding...');

    // Get services
    const usersSeedService = app.get(UsersSeedService);
    const surveysSeedService = app.get(SurveysSeedService);
    const responsesSeedService = app.get(ResponsesSeedService);

    // Seed in sequence to maintain data consistency
    await usersSeedService.seed();
    await surveysSeedService.seed();
    await responsesSeedService.seed();

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Handle promise rejection properly
seed().catch(err => {
  console.error('Failed to seed database:', err);
  process.exit(1);
});
