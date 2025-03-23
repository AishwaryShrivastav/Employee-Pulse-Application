import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedModule } from './seed.module';
import { UsersSeedService } from './users.seed';
import { SurveysSeedService } from './surveys.seed';
import { ResponsesSeedService } from './responses.seed';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedModule = app.select(SeedModule);
  const usersSeedService = seedModule.get(UsersSeedService);
  const surveysSeedService = seedModule.get(SurveysSeedService);
  const responsesSeedService = seedModule.get(ResponsesSeedService);
  
  try {
    // Create users first
    const users = await usersSeedService.seed();
    
    // Create surveys
    const surveys = await surveysSeedService.seed();
    
    // Create responses
    await responsesSeedService.seed(users, surveys);
    
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await app.close();
  }
}

bootstrap(); 