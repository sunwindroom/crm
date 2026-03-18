import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectStatus } from './entities/project.entity';
import { Milestone } from './entities/milestone.entity';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectService.create(createProjectDto);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.projectService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.projectService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: Partial<CreateProjectDto>,
  ) {
    return this.projectService.update(id, updateProjectDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.projectService.remove(id);
    return { message: '删除成功' };
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ProjectStatus,
  ) {
    return this.projectService.updateStatus(id, status);
  }

  // 里程碑管理
  @Post(':id/milestones')
  async addMilestone(
    @Param('id') id: string,
    @Body() milestoneData: Partial<Milestone>,
  ) {
    return this.projectService.addMilestone(id, milestoneData);
  }

  @Get(':id/milestones')
  async getMilestones(@Param('id') id: string) {
    return this.projectService.getMilestones(id);
  }

  @Post('milestones/:milestoneId/complete')
  async completeMilestone(@Param('milestoneId') milestoneId: string) {
    return this.projectService.completeMilestone(milestoneId);
  }
}
