import {
  IsUUID,
  IsNotEmpty,
  IsNumber,
  IsDate,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentPlanDto {
  @IsUUID()
  @IsNotEmpty({ message: '合同ID不能为空' })
  contractId: string;

  @IsNumber()
  @Min(0.01, { message: '回款金额必须大于0' })
  amount: number;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty({ message: '计划回款日期不能为空' })
  plannedDate: Date;

  @IsString()
  @IsOptional()
  description?: string;
}
