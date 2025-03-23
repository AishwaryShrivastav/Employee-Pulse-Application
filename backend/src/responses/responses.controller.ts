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
} from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { ResponsesService } from './responses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CreateResponseDto } from './dto/create-response.dto';

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
  findMyResponses(@Req() req: RequestWithUser) {
    if (!req.user?.userId) {
      throw new BadRequestException('User not authenticated');
    }
    return this.responsesService.findByUserId(req.user.userId);
  }

  @Get()
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.responsesService.findAll(page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.responsesService.findOne(id);
  }
}
