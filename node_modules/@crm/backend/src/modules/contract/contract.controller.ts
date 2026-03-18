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
import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/create-contract.dto';

@Controller('contracts')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Post()
  async create(@Body() createContractDto: CreateContractDto, @Request() req: any) {
    return this.contractService.create(createContractDto, req.user.userId);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.contractService.findAll(query);
  }

  @Get('expiring')
  async getExpiringContracts(@Query('days') days?: number) {
    return this.contractService.getExpiringContracts(days);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.contractService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateContractDto: Partial<CreateContractDto>,
  ) {
    return this.contractService.update(id, updateContractDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.contractService.remove(id);
    return { message: '删除成功' };
  }

  @Post(':id/submit')
  async submitForApproval(@Param('id') id: string) {
    return this.contractService.submitForApproval(id);
  }

  @Post(':id/approve')
  async approve(@Param('id') id: string) {
    return this.contractService.approve(id);
  }

  @Post(':id/reject')
  async reject(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.contractService.reject(id, reason);
  }

  @Post(':id/sign')
  async sign(
    @Param('id') id: string,
    @Body('signDate') signDate: Date,
  ) {
    return this.contractService.sign(id, signDate);
  }
}
