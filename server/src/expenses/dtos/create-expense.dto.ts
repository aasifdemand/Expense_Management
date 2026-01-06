import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsMongoId,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export enum ExpenseType {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export class CreateExpenseDto {
  @IsEnum(ExpenseType)
  @Type(() => String)
  expenseType: ExpenseType;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  amount: number;

  @IsMongoId()
  department: string;

  @IsMongoId()
  @IsOptional()
  subDepartment?: string;

  @IsString()
  @IsOptional()
  paymentMode?: string;

  @IsString()
  @IsOptional()
  vendor?: string;

  // USER EXPENSE ONLY
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isReimbursed?: boolean;
}


export class UpdateExpenseDto extends PartialType(CreateExpenseDto) { }
