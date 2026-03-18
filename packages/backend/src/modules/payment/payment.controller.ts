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
import { PaymentService } from './payment.service';
import { CreatePaymentPlanDto } from './dto/create-payment-plan.dto';

@Controller('payment-plans')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async create(@Body() createPaymentPlanDto: CreatePaymentPlanDto) {
    return this.paymentService.create(createPaymentPlanDto);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.paymentService.findAll(query);
  }

  @Get('overdue')
  async getOverduePayments() {
    return this.paymentService.getOverduePayments();
  }

  @Get('upcoming')
  async getUpcomingPayments(@Query('days') days?: number) {
    return this.paymentService.getUpcomingPayments(days);
  }

  @Get('statistics')
  async getPaymentStatistics() {
    return this.paymentService.getPaymentStatistics();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePaymentPlanDto: Partial<CreatePaymentPlanDto>,
  ) {
    return this.paymentService.update(id, updatePaymentPlanDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.paymentService.remove(id);
    return { message: '删除成功' };
  }

  @Post(':id/confirm')
  async confirm(
    @Param('id') id: string,
    @Body('actualDate') actualDate?: Date,
  ) {
    return this.paymentService.confirm(id, actualDate);
  }
}
