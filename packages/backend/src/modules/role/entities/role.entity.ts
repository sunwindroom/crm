import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Permission {
  LEAD_CREATE = 'lead_create',
  LEAD_VIEW = 'lead_view',
  LEAD_EDIT = 'lead_edit',
  LEAD_DELETE = 'lead_delete',
  LEAD_ASSIGN = 'lead_assign',
  LEAD_CONVERT = 'lead_convert',
  CUSTOMER_CREATE = 'customer_create',
  CUSTOMER_VIEW = 'customer_view',
  CUSTOMER_EDIT = 'customer_edit',
  CUSTOMER_DELETE = 'customer_delete',
  PROJECT_CREATE = 'project_create',
  PROJECT_VIEW = 'project_view',
  PROJECT_EDIT = 'project_edit',
  PROJECT_DELETE = 'project_delete',
  CONTRACT_CREATE = 'contract_create',
  CONTRACT_VIEW = 'contract_view',
  CONTRACT_EDIT = 'contract_edit',
  CONTRACT_DELETE = 'contract_delete',
  PAYMENT_CREATE = 'payment_create',
  PAYMENT_VIEW = 'payment_view',
  PAYMENT_EDIT = 'payment_edit',
  PAYMENT_DELETE = 'payment_delete',
  USER_CREATE = 'user_create',
  USER_VIEW = 'user_view',
  USER_EDIT = 'user_edit',
  USER_DELETE = 'user_delete',
  ROLE_VIEW = 'role_view',
  ROLE_EDIT = 'role_edit',
  REPORT_VIEW = 'report_view',
  DASHBOARD_VIEW = 'dashboard_view',
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('simple-array', { default: [] })
  permissions: Permission[];

  @Column({ default: false })
  isSystem: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
