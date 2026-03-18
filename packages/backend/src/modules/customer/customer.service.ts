import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { Contact } from './entities/contact.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
  ) {}

  async create(
    createCustomerDto: CreateCustomerDto,
    userId: string,
  ): Promise<Customer> {
    // 检查客户名称是否已存在
    const existing = await this.customerRepository.findOne({
      where: { name: createCustomerDto.name },
    });

    if (existing) {
      throw new ConflictException('客户名称已存在');
    }

    const customer = this.customerRepository.create({
      ...createCustomerDto,
      createdBy: userId,
    });

    return this.customerRepository.save(customer);
  }

  async findAll(query: any): Promise<{ items: Customer[]; total: number }> {
    const {
      page = 1,
      pageSize = 10,
      level,
      status,
      industry,
      keyword,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.customerRepository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.creator', 'user');

    if (level) {
      queryBuilder.andWhere('customer.level = :level', { level });
    }

    if (status) {
      queryBuilder.andWhere('customer.status = :status', { status });
    }

    if (industry) {
      queryBuilder.andWhere('customer.industry = :industry', { industry });
    }

    if (keyword) {
      queryBuilder.andWhere(
        '(customer.name LIKE :keyword OR customer.phone LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    queryBuilder
      .orderBy(`customer.${sortBy}`, sortOrder)
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [items, total] = await queryBuilder.getManyAndCount();

    return { items, total };
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['creator', 'contacts'],
    });

    if (!customer) {
      throw new NotFoundException('客户不存在');
    }

    return customer;
  }

  async getCustomer360View(id: string): Promise<any> {
    const customer = await this.findOne(id);

    // 这里可以添加更多关联数据查询
    // 如商机、项目、合同、回款等

    return {
      customer,
      // 后续可以添加：
      // opportunities: [],
      // projects: [],
      // contracts: [],
      // payments: [],
      // activities: [],
    };
  }

  async update(
    id: string,
    updateCustomerDto: Partial<CreateCustomerDto>,
  ): Promise<Customer> {
    const customer = await this.findOne(id);

    if (
      updateCustomerDto.name &&
      updateCustomerDto.name !== customer.name
    ) {
      const existing = await this.customerRepository.findOne({
        where: { name: updateCustomerDto.name },
      });

      if (existing) {
        throw new ConflictException('客户名称已存在');
      }
    }

    Object.assign(customer, updateCustomerDto);
    return this.customerRepository.save(customer);
  }

  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id);
    await this.customerRepository.remove(customer);
  }

  // 联系人管理
  async addContact(
    customerId: string,
    contactData: Partial<Contact>,
  ): Promise<Contact> {
    const customer = await this.findOne(customerId);

    const contact = this.contactRepository.create({
      ...contactData,
      customerId: customer.id,
    });

    return this.contactRepository.save(contact);
  }

  async getContacts(customerId: string): Promise<Contact[]> {
    return this.contactRepository.find({
      where: { customerId },
      order: { isPrimary: 'DESC', createdAt: 'DESC' },
    });
  }

  async updateContact(
    contactId: string,
    contactData: Partial<Contact>,
  ): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { id: contactId },
    });

    if (!contact) {
      throw new NotFoundException('联系人不存在');
    }

    Object.assign(contact, contactData);
    return this.contactRepository.save(contact);
  }

  async removeContact(contactId: string): Promise<void> {
    const contact = await this.contactRepository.findOne({
      where: { id: contactId },
    });

    if (!contact) {
      throw new NotFoundException('联系人不存在');
    }

    await this.contactRepository.remove(contact);
  }
}
