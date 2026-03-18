import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Opportunity,
  OpportunityStage,
  OpportunityStatus,
} from './entities/opportunity.entity';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';

@Injectable()
export class OpportunityService {
  constructor(
    @InjectRepository(Opportunity)
    private opportunityRepository: Repository<Opportunity>,
  ) {}

  async create(
    createOpportunityDto: CreateOpportunityDto,
    userId: string,
  ): Promise<Opportunity> {
    const opportunity = this.opportunityRepository.create({
      ...createOpportunityDto,
      createdBy: userId,
    });

    return this.opportunityRepository.save(opportunity);
  }

  async findAll(query: any): Promise<{ items: Opportunity[]; total: number }> {
    const {
      page = 1,
      pageSize = 10,
      stage,
      status,
      customerId,
      keyword,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.opportunityRepository
      .createQueryBuilder('opportunity')
      .leftJoinAndSelect('opportunity.customer', 'customer')
      .leftJoinAndSelect('opportunity.creator', 'user');

    if (stage) {
      queryBuilder.andWhere('opportunity.stage = :stage', { stage });
    }

    if (status) {
      queryBuilder.andWhere('opportunity.status = :status', { status });
    }

    if (customerId) {
      queryBuilder.andWhere('opportunity.customerId = :customerId', {
        customerId,
      });
    }

    if (keyword) {
      queryBuilder.andWhere('opportunity.name LIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    queryBuilder
      .orderBy(`opportunity.${sortBy}`, sortOrder)
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [items, total] = await queryBuilder.getManyAndCount();

    return { items, total };
  }

  async findOne(id: string): Promise<Opportunity> {
    const opportunity = await this.opportunityRepository.findOne({
      where: { id },
      relations: ['customer', 'creator'],
    });

    if (!opportunity) {
      throw new NotFoundException('商机不存在');
    }

    return opportunity;
  }

  async update(
    id: string,
    updateOpportunityDto: Partial<CreateOpportunityDto>,
  ): Promise<Opportunity> {
    const opportunity = await this.findOne(id);
    Object.assign(opportunity, updateOpportunityDto);
    return this.opportunityRepository.save(opportunity);
  }

  async remove(id: string): Promise<void> {
    const opportunity = await this.findOne(id);
    await this.opportunityRepository.remove(opportunity);
  }

  async updateStage(id: string, stage: OpportunityStage): Promise<Opportunity> {
    const opportunity = await this.findOne(id);

    // 更新阶段和概率
    opportunity.stage = stage;
    opportunity.probability = this.getStageProbability(stage);

    return this.opportunityRepository.save(opportunity);
  }

  async markAsWon(id: string): Promise<Opportunity> {
    const opportunity = await this.findOne(id);
    opportunity.status = OpportunityStatus.WON;
    opportunity.probability = 100;
    return this.opportunityRepository.save(opportunity);
  }

  async markAsLost(id: string, reason?: string): Promise<Opportunity> {
    const opportunity = await this.findOne(id);
    opportunity.status = OpportunityStatus.LOST;
    opportunity.probability = 0;
    return this.opportunityRepository.save(opportunity);
  }

  // 销售漏斗
  async getSalesFunnel(): Promise<any> {
    const opportunities = await this.opportunityRepository.find({
      where: { status: OpportunityStatus.ACTIVE },
    });

    const funnel: Record<OpportunityStage, { stage: OpportunityStage; stageName: string; count: number; amount: number; opportunities: Opportunity[] }> = {} as any;
    Object.values(OpportunityStage).forEach((stage) => {
      funnel[stage] = {
        stage,
        stageName: this.getStageName(stage),
        count: 0,
        amount: 0,
        opportunities: [],
      };
    });

    opportunities.forEach((opp) => {
      if (funnel[opp.stage]) {
        funnel[opp.stage].count += 1;
        funnel[opp.stage].amount += Number(opp.amount);
        funnel[opp.stage].opportunities.push(opp);
      }
    });

    return Object.values(funnel);
  }

  // 销售预测
  async getSalesForecast(): Promise<any> {
    const opportunities = await this.opportunityRepository.find({
      where: { status: OpportunityStatus.ACTIVE },
    });

    const forecast = opportunities.reduce(
      (total, opp) => {
        const weightedAmount = Number(opp.amount) * (opp.probability / 100);
        return {
          totalAmount: total.totalAmount + Number(opp.amount),
          weightedAmount: total.weightedAmount + weightedAmount,
          count: total.count + 1,
        };
      },
      { totalAmount: 0, weightedAmount: 0, count: 0 },
    );

    return forecast;
  }

  private getStageProbability(stage: OpportunityStage): number {
    const probabilities = {
      [OpportunityStage.INITIAL]: 20,
      [OpportunityStage.REQUIREMENT]: 40,
      [OpportunityStage.PROPOSAL]: 60,
      [OpportunityStage.NEGOTIATION]: 80,
      [OpportunityStage.CONTRACT]: 90,
    };
    return probabilities[stage] || 20;
  }

  private getStageName(stage: OpportunityStage): string {
    const names = {
      [OpportunityStage.INITIAL]: '初步接触',
      [OpportunityStage.REQUIREMENT]: '需求确认',
      [OpportunityStage.PROPOSAL]: '方案报价',
      [OpportunityStage.NEGOTIATION]: '商务谈判',
      [OpportunityStage.CONTRACT]: '签订合同',
    };
    return names[stage] || stage;
  }
}
