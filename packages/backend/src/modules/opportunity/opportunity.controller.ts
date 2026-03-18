import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { OpportunityService } from './opportunity.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { OpportunityStage } from './entities/opportunity.entity';

@Controller('opportunities')
export class OpportunityController {
  constructor(private readonly opportunityService: OpportunityService) {}

  @Post()
  async create(
    @Body() createOpportunityDto: CreateOpportunityDto,
    @Request() req: any,
  ) {
    return this.opportunityService.create(createOpportunityDto, req.user.userId);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.opportunityService.findAll(query);
  }

  @Get('funnel')
  async getSalesFunnel() {
    return this.opportunityService.getSalesFunnel();
  }

  @Get('forecast')
  async getSalesForecast() {
    return this.opportunityService.getSalesForecast();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.opportunityService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOpportunityDto: Partial<CreateOpportunityDto>,
  ) {
    return this.opportunityService.update(id, updateOpportunityDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.opportunityService.remove(id);
    return { message: '删除成功' };
  }

  @Put(':id/stage')
  async updateStage(
    @Param('id') id: string,
    @Body('stage') stage: OpportunityStage,
  ) {
    return this.opportunityService.updateStage(id, stage);
  }

  @Post(':id/win')
  async markAsWon(@Param('id') id: string) {
    return this.opportunityService.markAsWon(id);
  }

  @Post(':id/lose')
  async markAsLost(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.opportunityService.markAsLost(id, reason);
  }
}
