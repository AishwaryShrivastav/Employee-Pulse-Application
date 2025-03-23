import { Controller, Get, Post, Body, Query, UseGuards, Req, Res, Param } from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { ResponsesService } from './responses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    userId: string;
  };
}

@Controller('responses')
@UseGuards(JwtAuthGuard)
export class ResponsesController {
  constructor(private readonly responsesService: ResponsesService) {}

  @Post()
  create(@Body() createResponseDto: any, @Req() req: RequestWithUser) {
    return this.responsesService.create({
      ...createResponseDto,
      userId: req.user.userId,
    });
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