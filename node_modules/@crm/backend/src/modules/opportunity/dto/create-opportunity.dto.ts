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
import { OpportunityStage, OpportunityStatus } from '../entities/opportunity.entity';

export class CreateOpportunityDto {
  @IsUUID()
  @IsNotEmpty({ message: '客户ID不能为空' })
  customerId: string;

  @IsString()
  @IsNotEmpty({ message: '商机名称不能为空' })
  name: string;

  @IsNumber()
  @Min(0.01, { message: '商机金额必须大于0' })
  amount: number;

  @IsEnum(OpportunityStage)
  @IsOptional()
  stage?: OpportunityStage;

  @IsNumber()
  @IsOptional()
  probability?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expectedCloseDate?: Date;

  @IsEnum(OpportunityStatus)
  @IsOptional()
  status?: OpportunityStatus;

  @IsString()
  @IsOptional()
  description?: string;
}
