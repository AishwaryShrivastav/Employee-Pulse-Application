import { Controller, Get, UseGuards, Logger, InternalServerErrorException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  private readonly logger = new Logger(AdminController.name);
  
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard-metrics')
  async getDashboardMetrics() {
    this.logger.log('Processing request for dashboard metrics');
    try {
      const metrics = await this.adminService.getDashboardMetrics();
      this.logger.debug('Successfully retrieved dashboard metrics');
      return metrics;
    } catch (error) {
      this.logger.error(`Error retrieving dashboard metrics: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve dashboard metrics');
    }
  }

  @Get('survey-participation-graph')
  async getSurveyParticipationGraph() {
    this.logger.log('Processing request for survey participation graph');
    try {
      const graphData = await this.adminService.getSurveyParticipationGraph();
      this.logger.debug('Successfully retrieved survey participation graph data');
      return graphData;
    } catch (error) {
      this.logger.error(`Error retrieving survey participation graph: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve survey participation graph data');
    }
  }
} 