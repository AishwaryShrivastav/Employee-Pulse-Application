import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
  Res,
  Param,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { ResponsesService } from './responses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CreateResponseDto } from './dto/create-response.dto';
import { Types } from 'mongoose';

interface RequestWithUser {
  user: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

@Controller('responses')
@UseGuards(JwtAuthGuard)
export class ResponsesController {
  constructor(private readonly responsesService: ResponsesService) {}

  @Post()
  async create(@Body() createResponseDto: CreateResponseDto, @Req() req: RequestWithUser) {
    if (!req.user?.userId) {
      console.error('Auth error - user object:', req.user);
      throw new BadRequestException('User not authenticated');
    }

    try {
      const response = await this.responsesService.create({
        ...createResponseDto,
        userId: req.user.userId,
      });
      
      return {
        message: 'Survey response submitted successfully',
        response
      };
    } catch (error) {
      console.error('Error submitting survey response:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message || 'Failed to submit survey response');
    }
  }

  @Get('status')
  async getSurveyStatus(@Req() req: RequestWithUser) {
    if (!req.user?.userId) {
      throw new BadRequestException('User not authenticated');
    }
    try {
      return await this.responsesService.getSurveyStatusForUser(req.user.userId);
    } catch (error) {
      console.error('Error getting survey status:', error);
      throw new BadRequestException('Failed to get survey status');
    }
  }

  @Get('export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async exportToCSV(@Res() res: ExpressResponse) {
    const csv = await this.responsesService.exportToCSV();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=responses.csv');
    return res.send(csv);
  }

  @Get('my')
  async findMyResponses(@Req() req: RequestWithUser) {
    if (!req.user?.userId) {
      throw new BadRequestException('User not authenticated');
    }
    try {
      return await this.responsesService.findByUserId(req.user.userId);
    } catch (error) {
      console.error('Error finding user responses:', error);
      throw new BadRequestException('Failed to fetch responses');
    }
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(
    @Query('page') page: number = 1, 
    @Query('limit') limit: number = 10,
    @Query('surveyId') surveyId?: string
  ) {
    try {
      // If surveyId is provided, get responses for that survey
      if (surveyId) {
        console.log('Finding responses for survey:', surveyId);
        if (!Types.ObjectId.isValid(surveyId)) {
          throw new BadRequestException('Invalid survey ID');
        }
        return await this.responsesService.findBySurveyId(surveyId);
      }
      
      // Otherwise, get all responses with pagination
      return await this.responsesService.findAll(page, limit);
    } catch (error) {
      console.error('Error finding responses:', error);
      throw new BadRequestException(error.message || 'Failed to fetch responses');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid response ID');
    }
    try {
      const response = await this.responsesService.findOne(id);
      if (!response) {
        throw new NotFoundException('Response not found');
      }
      return response;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error finding response:', error);
      throw new BadRequestException('Failed to fetch response');
    }
  }
}
