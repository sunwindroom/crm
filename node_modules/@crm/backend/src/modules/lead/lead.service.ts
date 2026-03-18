import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead, LeadStatus } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';

@Injectable()
export class LeadService {
  constructor(
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
  ) {}

  async create(createLeadDto: CreateLeadDto, userId: string): Promise<Lead> {
    const lead = this.leadRepository.create({
      ...createLeadDto,
      assignedTo: userId,
      assignedAt: new Date(),
    });

    return this.leadRepository.save(lead);
  }

  async findAll(query: any): Promise<{ items: Lead[]; total: number }> {
    const {
      page = 1,
      pageSize = 10,
      status,
      source,
      keyword,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.leadRepository
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.assignedUser', 'user');

    if (status) {
      queryBuilder.andWhere('lead.status = :status', { status });
    }

    if (source) {
      queryBuilder.andWhere('lead.source = :source', { source });
    }

    if (keyword) {
      queryBuilder.andWhere(
        '(lead.name LIKE :keyword OR lead.company LIKE :keyword OR lead.phone LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    queryBuilder
      .orderBy(`lead.${sortBy}`, sortOrder)
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [items, total] = await queryBuilder.getManyAndCount();

    return { items, total };
  }

  async findOne(id: string): Promise<Lead> {
    const lead = await this.leadRepository.findOne({
      where: { id },
      relations: ['assignedUser'],
    });

    if (!lead) {
      throw new NotFoundException('线索不存在');
    }

    return lead;
  }

  async update(
    id: string,
    updateLeadDto: Partial<CreateLeadDto>,
  ): Promise<Lead> {
    const lead = await this.findOne(id);
    Object.assign(lead, updateLeadDto);
    return this.leadRepository.save(lead);
  }

  async remove(id: string): Promise<void> {
    const lead = await this.findOne(id);
    await this.leadRepository.remove(lead);
  }

  async assign(id: string, userId: string): Promise<Lead> {
    const lead = await this.findOne(id);
    lead.assignedTo = userId;
    lead.assignedAt = new Date();
    return this.leadRepository.save(lead);
  }

  async convert(
    id: string,
    convertData: { customerId: string; opportunityId?: string },
  ): Promise<Lead> {
    const lead = await this.findOne(id);

    if (lead.status === LeadStatus.CONVERTED) {
      throw new BadRequestException('线索已转化');
    }

    lead.status = LeadStatus.CONVERTED;
    return this.leadRepository.save(lead);
  }

  async markAsLost(id: string, reason: string): Promise<Lead> {
    const lead = await this.findOne(id);
    lead.status = LeadStatus.LOST;
    lead.lostReason = reason;
    return this.leadRepository.save(lead);
  }
}
