import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDate,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ContractStatus } from '../entities/contract.entity';

export class CreateContractDto {
  @IsUUID()
  @IsNotEmpty({ message: '客户ID不能为空' })
  customerId: string;

  @IsUUID()
  @IsOptional()
  opportunityId?: string;

  @IsString()
  @IsNotEmpty({ message: '合同编号不能为空' })
  contractNo: string;

  @IsString()
  @IsNotEmpty({ message: '合同名称不能为空' })
  name: string;

  @IsNumber()
  @Min(0.01, { message: '合同金额必须大于0' })
  amount: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  signDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty({ message: '开始日期不能为空' })
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty({ message: '结束日期不能为空' })
  endDate: Date;

  @IsEnum(ContractStatus)
  @IsOptional()
  status?: ContractStatus;

  @IsString()
  @IsOptional()
  description?: string;
}
