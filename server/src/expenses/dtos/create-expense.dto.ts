import {
    IsString,
    IsNumber,
    IsEnum,
    IsBoolean,
    IsOptional,
} from "class-validator";
import { Department } from "src/enums/department.enum";
import { PartialType } from "@nestjs/mapped-types";
import { Type } from "class-transformer";

export class CreateExpenseDto {
    @IsString()
    paidTo: string


    @Type(() => Number)
    @IsNumber()
    amount: number;


    @Type(() => Number)
    @IsNumber()
    year: number;


    @Type(() => Number)
    @IsNumber()
    month: number;

    @IsEnum(Department)
    department: Department;


    @IsBoolean()
    @Type(() => Boolean)
    @IsOptional()
    isReimbursed?: boolean;


    @IsBoolean()
    @Type(() => Boolean)
    @IsOptional()
    isApproved?: boolean;


}

export class UpdateExpenseDto extends PartialType(CreateExpenseDto) { }
