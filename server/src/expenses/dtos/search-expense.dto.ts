import {
    IsString,
    IsNumber,
    IsEnum,
    IsBoolean,
    IsOptional,
    Min,
} from "class-validator";
import { Type } from "class-transformer";
import { Department } from "src/enums/department.enum";

export class SearchExpensesDto {
    @IsOptional()
    @IsString()
    userName?: string;

    @IsOptional()
    @IsString()
    paidTo?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    minAmount?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    maxAmount?: number;

    @IsOptional()
    @IsEnum(Department)
    department?: Department;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isReimbursed?: boolean;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isApproved?: boolean;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    month?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    year?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 20;
}
