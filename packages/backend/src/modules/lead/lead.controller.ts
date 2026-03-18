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
import { LeadService } from './lead.service';
import { CreateLeadDto } from './dto/create-lead.dto';

@Controller('leads')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Post()
  async create(@Body() createLeadDto: CreateLeadDto, @Request() req: any) {
    return this.leadService.create(createLeadDto, req.user.userId);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.leadService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.leadService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLeadDto: Partial<CreateLeadDto>,
  ) {
    return this.leadService.update(id, updateLeadDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.leadService.remove(id);
    return { message: '删除成功' };
  }

  @Post(':id/assign')
  async assign(@Param('id') id: string, @Body('userId') userId: string) {
    return this.leadService.assign(id, userId);
  }

  @Post(':id/convert')
  async convert(
    @Param('id') id: string,
    @Body() convertData: { customerId: string; opportunityId?: string },
  ) {
    return this.leadService.convert(id, convertData);
  }

  @Post(':id/lost')
  async markAsLost(@Param('id') id: string, @Body('reason') reason: string) {
    return this.leadService.markAsLost(id, reason);
  }
}
