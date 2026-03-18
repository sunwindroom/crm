import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract, ContractStatus } from './entities/contract.entity';
import { CreateContractDto } from './dto/create-contract.dto';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
  ) {}

  async create(
    createContractDto: CreateContractDto,
    userId: string,
  ): Promise<Contract> {
    // 检查合同编号是否已存在
    const existing = await this.contractRepository.findOne({
      where: { contractNo: createContractDto.contractNo },
    });

    if (existing) {
      throw new ConflictException('合同编号已存在');
    }

    const contract = this.contractRepository.create({
      ...createContractDto,
      createdBy: userId,
    });

    return this.contractRepository.save(contract);
  }

  async findAll(query: any): Promise<{ items: Contract[]; total: number }> {
    const {
      page = 1,
      pageSize = 10,
      status,
      customerId,
      keyword,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.contractRepository
      .createQueryBuilder('contract')
      .leftJoinAndSelect('contract.customer', 'customer')
      .leftJoinAndSelect('contract.creator', 'user');

    if (status) {
      queryBuilder.andWhere('contract.status = :status', { status });
    }

    if (customerId) {
      queryBuilder.andWhere('contract.customerId = :customerId', {
        customerId,
      });
    }

    if (keyword) {
      queryBuilder.andWhere(
        '(contract.name LIKE :keyword OR contract.contractNo LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    queryBuilder
      .orderBy(`contract.${sortBy}`, sortOrder)
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [items, total] = await queryBuilder.getManyAndCount();

    return { items, total };
  }

  async findOne(id: string): Promise<Contract> {
    const contract = await this.contractRepository.findOne({
      where: { id },
      relations: ['customer', 'creator'],
    });

    if (!contract) {
      throw new NotFoundException('合同不存在');
    }

    return contract;
  }

  async update(
    id: string,
    updateContractDto: Partial<CreateContractDto>,
  ): Promise<Contract> {
    const contract = await this.findOne(id);

    // 只有草稿状态才能修改
    if (contract.status !== ContractStatus.DRAFT) {
      throw new BadRequestException('只有草稿状态的合同才能修改');
    }

    Object.assign(contract, updateContractDto);
    return this.contractRepository.save(contract);
  }

  async remove(id: string): Promise<void> {
    const contract = await this.findOne(id);

    if (contract.status !== ContractStatus.DRAFT) {
      throw new BadRequestException('只有草稿状态的合同才能删除');
    }

    await this.contractRepository.remove(contract);
  }

  async submitForApproval(id: string): Promise<Contract> {
    const contract = await this.findOne(id);

    if (contract.status !== ContractStatus.DRAFT) {
      throw new BadRequestException('只有草稿状态的合同才能提交审批');
    }

    contract.status = ContractStatus.PENDING;
    return this.contractRepository.save(contract);
  }

  async approve(id: string): Promise<Contract> {
    const contract = await this.findOne(id);

    if (contract.status !== ContractStatus.PENDING) {
      throw new BadRequestException('只有待审批状态的合同才能审批');
    }

    contract.status = ContractStatus.APPROVED;
    return this.contractRepository.save(contract);
  }

  async reject(id: string, reason?: string): Promise<Contract> {
    const contract = await this.findOne(id);

    if (contract.status !== ContractStatus.PENDING) {
      throw new BadRequestException('只有待审批状态的合同才能驳回');
    }

    contract.status = ContractStatus.DRAFT;
    return this.contractRepository.save(contract);
  }

  async sign(id: string, signDate: Date): Promise<Contract> {
    const contract = await this.findOne(id);

    if (contract.status !== ContractStatus.APPROVED) {
      throw new BadRequestException('只有已审批状态的合同才能签署');
    }

    contract.status = ContractStatus.SIGNED;
    contract.signDate = signDate;
    return this.contractRepository.save(contract);
  }

  async getExpiringContracts(days: number = 30): Promise<Contract[]> {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    return this.contractRepository
      .createQueryBuilder('contract')
      .where('contract.status = :status', { status: ContractStatus.EXECUTING })
      .andWhere('contract.endDate <= :targetDate', { targetDate })
      .getMany();
  }
}
