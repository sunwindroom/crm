import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsDate,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectType, ProjectStatus } from '../entities/project.entity';

export class CreateProjectDto {
  @IsUUID()
  @IsNotEmpty({ message: '客户ID不能为空' })
  customerId: string;

  @IsUUID()
  @IsOptional()
  opportunityId?: string;

  @IsUUID()
  @IsOptional()
  contractId?: string;

  @IsString()
  @IsNotEmpty({ message: '项目名称不能为空' })
  name: string;

  @IsEnum(ProjectType)
  @IsNotEmpty({ message: '项目类型不能为空' })
  type: ProjectType;

  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @IsUUID()
  @IsNotEmpty({ message: '项目经理不能为空' })
  manager: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty({ message: '开始日期不能为空' })
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty({ message: '结束日期不能为空' })
  endDate: Date;

  @IsString()
  @IsOptional()
  description?: string;
}
