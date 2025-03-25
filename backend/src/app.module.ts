import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SurveyModule } from './survey/survey.module';
import { ResponsesModule } from './responses/responses.module';
import { SeedModule } from './seed/seed.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/employee-pulse',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    SurveyModule,
    ResponsesModule,
    SeedModule,
    AdminModule,
  ],
})
export class AppModule {}
