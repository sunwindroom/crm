import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Customer } from '../../customer/entities/customer.entity';
import { User } from '../../user/entities/user.entity';

export enum OpportunityStage {
  INITIAL = 'initial',           // 初步接触
  REQUIREMENT = 'requirement',   // 需求确认
  PROPOSAL = 'proposal',         // 方案报价
  NEGOTIATION = 'negotiation',   // 商务谈判
  CONTRACT = 'contract',         // 签订合同
}

export enum OpportunityStatus {
  ACTIVE = 'active',
  WON = 'won',
  LOST = 'lost',
}

@Entity('opportunities')
export class Opportunity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerId: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ nullable: true })
  projectId: string;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: OpportunityStage,
    default: OpportunityStage.INITIAL,
  })
  stage: OpportunityStage;

  @Column({ type: 'int', default: 20 })
  probability: number;

  @Column({ type: 'date', nullable: true })
  expectedCloseDate: Date;

  @Column({
    type: 'enum',
    enum: OpportunityStatus,
    default: OpportunityStatus.ACTIVE,
  })
  status: OpportunityStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
