/**
 * Survey Controller
 * 
 * Handles HTTP requests related to surveys in the application.
 * Implements role-based access control for administrative operations.
 */
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { SurveyService } from './survey.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';

/**
 * Extended Request interface with user authentication data
 */
interface RequestWithUser {
  user: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

/**
 * Controller for managing surveys
 * All routes require authentication (JwtAuthGuard)
 * Admin-specific operations are protected by RolesGuard
 */
@Controller('surveys')
@UseGuards(JwtAuthGuard)
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  /**
   * Get surveys available for the current user
   * Accessible by all authenticated users
   */
  @Get('available')
  async getAvailableSurveys(@Req() req: RequestWithUser) {
    if (!req.user?.userId) {
      throw new BadRequestException('User not authenticated');
    }
    try {
      return await this.surveyService.getAvailableSurveysForUser(req.user.userId);
    } catch (error) {
      console.error('Error getting available surveys:', error);
      throw new BadRequestException('Failed to fetch available surveys');
    }
  }

  /**
   * Get all surveys with statistics (admin view)
   * Restricted to ADMIN users only
   */
  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAllForAdmin() {
    return this.surveyService.findAllWithStats();
  }

  /**
   * Get all surveys
   * Accessible by all authenticated users
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.surveyService.findAll();
  }

  /**
   * Get a specific survey by ID
   * Accessible by all authenticated users
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    try {
      console.log(`Attempting to fetch survey with ID: ${id}`);
      return await this.surveyService.findOne(id);
    } catch (error) {
      console.error(`Error fetching survey with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new survey
   * Restricted to ADMIN users only
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createSurveyDto: CreateSurveyDto) {
    return this.surveyService.create(createSurveyDto);
  }

  /**
   * Update an existing survey by ID
   * Restricted to ADMIN users only
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateSurveyDto: UpdateSurveyDto) {
    return this.surveyService.update(id, updateSurveyDto);
  }

  /**
   * Update the active status of a survey
   * Restricted to ADMIN users only
   */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.surveyService.updateStatus(id, isActive);
  }

  /**
   * Delete a survey by ID
   * Restricted to ADMIN users only
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.surveyService.remove(id);
  }

  /**
   * Create a default survey (for testing/seeding)
   * Restricted to ADMIN users only
   */
  @Post('seed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async seedDefaultSurvey() {
    return this.surveyService.createDefaultSurvey();
  }
}
