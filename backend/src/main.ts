/**
 * Main entry point for the Employee Pulse API backend application
 * 
 * This file configures and bootstraps the NestJS application with:
 * - Global API prefix
 * - CORS support
 * - Input validation
 * - Swagger documentation
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Bootstrap function to initialize and start the NestJS application
 */
async function bootstrap() {
  // Create a new NestJS application instance with the root AppModule
  const app = await NestFactory.create(AppModule);

  // Enable Cross-Origin Resource Sharing (CORS) to allow frontend access
  // from different domains/origins (important for local development)
  app.enableCors();

  // Set global prefix 'api' for all routes (e.g., /api/auth, /api/surveys)
  app.setGlobalPrefix('api');

  // Enable automatic request validation using class-validator decorators
  // - transform: automatically transform payloads to DTO instances
  // - whitelist: strip properties that aren't defined in the DTO
  // - forbidNonWhitelisted: throw error if unknown properties are sent
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configure Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('Employee Pulse API')
    .setDescription('API documentation for Employee Pulse Application')
    .setVersion('1.0')
    .addBearerAuth()  // Enable JWT authentication in Swagger UI
    .build();

  // Create and set up Swagger documentation at /api/docs endpoint
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Start the server on the specified port (default: 3000)
  // Uses environment variable PORT if available
  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://localhost:${port}/api`);
}

// Handle promise rejection properly to prevent unhandled promise rejection
bootstrap().catch(err => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
