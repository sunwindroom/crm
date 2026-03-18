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
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { Contact } from './entities/contact.entity';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDto, @Request() req: any) {
    return this.customerService.create(createCustomerDto, req.user.userId);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.customerService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  @Get(':id/360')
  async getCustomer360View(@Param('id') id: string) {
    return this.customerService.getCustomer360View(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: Partial<CreateCustomerDto>,
  ) {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.customerService.remove(id);
    return { message: '删除成功' };
  }

  // 联系人管理
  @Post(':id/contacts')
  async addContact(
    @Param('id') id: string,
    @Body() contactData: Partial<Contact>,
  ) {
    return this.customerService.addContact(id, contactData);
  }

  @Get(':id/contacts')
  async getContacts(@Param('id') id: string) {
    return this.customerService.getContacts(id);
  }

  @Put('contacts/:contactId')
  async updateContact(
    @Param('contactId') contactId: string,
    @Body() contactData: Partial<Contact>,
  ) {
    return this.customerService.updateContact(contactId, contactData);
  }

  @Delete('contacts/:contactId')
  async removeContact(@Param('contactId') contactId: string) {
    await this.customerService.removeContact(contactId);
    return { message: '删除成功' };
  }
}
