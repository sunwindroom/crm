import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentPlan, PaymentStatus } from './entities/payment-plan.entity';
import { CreatePaymentPlanDto } from './dto/create-payment-plan.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentPlan)
    private paymentPlanRepository: Repository<PaymentPlan>,
  ) {}

  async create(createPaymentPlanDto: CreatePaymentPlanDto): Promise<PaymentPlan> {
    const paymentPlan = this.paymentPlanRepository.create(createPaymentPlanDto);
    return this.paymentPlanRepository.save(paymentPlan);
  }

  async findAll(query: any): Promise<{ items: PaymentPlan[]; total: number }> {
    const {
      page = 1,
      pageSize = 10,
      status,
      contractId,
      sortBy = 'plannedDate',
      sortOrder = 'ASC',
    } = query;

    const queryBuilder = this.paymentPlanRepository
      .createQueryBuilder('paymentPlan')
      .leftJoinAndSelect('paymentPlan.contract', 'contract');

    if (status) {
      queryBuilder.andWhere('paymentPlan.status = :status', { status });
    }

    if (contractId) {
      queryBuilder.andWhere('paymentPlan.contractId = :contractId', {
        contractId,
      });
    }

    queryBuilder
      .orderBy(`paymentPlan.${sortBy}`, sortOrder)
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [items, total] = await queryBuilder.getManyAndCount();

    return { items, total };
  }

  async findOne(id: string): Promise<PaymentPlan> {
    const paymentPlan = await this.paymentPlanRepository.findOne({
      where: { id },
      relations: ['contract'],
    });

    if (!paymentPlan) {
      throw new NotFoundException('回款计划不存在');
    }

    return paymentPlan;
  }

  async update(
    id: string,
    updatePaymentPlanDto: Partial<CreatePaymentPlanDto>,
  ): Promise<PaymentPlan> {
    const paymentPlan = await this.findOne(id);
    Object.assign(paymentPlan, updatePaymentPlanDto);
    return this.paymentPlanRepository.save(paymentPlan);
  }

  async remove(id: string): Promise<void> {
    const paymentPlan = await this.findOne(id);
    await this.paymentPlanRepository.remove(paymentPlan);
  }

  async confirm(id: string, actualDate?: Date): Promise<PaymentPlan> {
    const paymentPlan = await this.findOne(id);

    if (paymentPlan.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('该回款计划已完成');
    }

    paymentPlan.status = PaymentStatus.COMPLETED;
    paymentPlan.actualDate = actualDate || new Date();

    return this.paymentPlanRepository.save(paymentPlan);
  }

  async getOverduePayments(): Promise<PaymentPlan[]> {
    const today = new Date();

    return this.paymentPlanRepository
      .createQueryBuilder('paymentPlan')
      .where('paymentPlan.status = :status', { status: PaymentStatus.PENDING })
      .andWhere('paymentPlan.plannedDate < :today', { today })
      .getMany();
  }

  async getUpcomingPayments(days: number = 7): Promise<PaymentPlan[]> {
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    return this.paymentPlanRepository
      .createQueryBuilder('paymentPlan')
      .where('paymentPlan.status = :status', { status: PaymentStatus.PENDING })
      .andWhere('paymentPlan.plannedDate >= :today', { today })
      .andWhere('paymentPlan.plannedDate <= :targetDate', { targetDate })
      .getMany();
  }

  async getPaymentStatistics(): Promise<any> {
    const allPayments = await this.paymentPlanRepository.find();

    const statistics = allPayments.reduce(
      (acc, payment) => {
        const amount = Number(payment.amount);

        if (payment.status === PaymentStatus.COMPLETED) {
          acc.completedAmount += amount;
          acc.completedCount += 1;
        } else {
          acc.pendingAmount += amount;
          acc.pendingCount += 1;
        }

        acc.totalAmount += amount;
        acc.totalCount += 1;

        return acc;
      },
      {
        totalAmount: 0,
        completedAmount: 0,
        pendingAmount: 0,
        totalCount: 0,
        completedCount: 0,
        pendingCount: 0,
        completionRate: 0,
      },
    );

    statistics.completionRate =
      statistics.totalAmount > 0
        ? (statistics.completedAmount / statistics.totalAmount) * 100
        : 0;

    return statistics;
  }
}
