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

interface RequestWithUser {
  user: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

@Controller('surveys')
@UseGuards(JwtAuthGuard)
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

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

  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAllForAdmin() {
    return this.surveyService.findAllWithStats();
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.surveyService.findAll();
  }

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

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createSurveyDto: CreateSurveyDto) {
    return this.surveyService.create(createSurveyDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateSurveyDto: UpdateSurveyDto) {
    return this.surveyService.update(id, updateSurveyDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.surveyService.updateStatus(id, isActive);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.surveyService.remove(id);
  }

  @Post('seed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async seedDefaultSurvey() {
    return this.surveyService.createDefaultSurvey();
  }
}
