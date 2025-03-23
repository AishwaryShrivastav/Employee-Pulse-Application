import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SurveyService } from './survey.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.surveyService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createSurveyDto: any) {
    return this.surveyService.create(createSurveyDto);
  }

  @Post('seed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async seedDefaultSurvey() {
    return this.surveyService.createDefaultSurvey();
  }
}
