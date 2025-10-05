import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsMongoId,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';

export class CreateExpenseDto {
  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  amount: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  reimbursedamount?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  allocatedAmount?: number;

  @IsMongoId()
  department: string;

  @IsMongoId()
  @IsOptional()
  subDepartment?: string;

  @IsString()
  @IsOptional()
  paymentMode?: string;

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  isReimbursed?: boolean;

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  isApproved?: boolean;
}

export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {}
