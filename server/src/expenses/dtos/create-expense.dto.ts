import {
    IsString,
    IsNumber,
    IsEnum,
    IsBoolean,
    IsOptional,
    IsMongoId,
} from "class-validator";
import { Department } from "src/enums/department.enum";
import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateExpenseDto {
    @ApiProperty({
        description: "ID of the user who owns this expense",
        example: "6512bd43d9caa6e02c990b0a",
    })
    @IsMongoId()
    paidTo: string;

    @ApiProperty({
        description: "Amount spent",
        example: 250.75,
    })
    @Type(() => Number)
    @IsNumber()
    amount: number;

    @ApiProperty({
        description: "Date of the expense in ISO format",
        example: "2025-09-23T10:00:00Z",
    })
    @IsString()
    @IsOptional()
    date?: string;

    @ApiProperty({
        description: "Department under which the expense falls",
        enum: Department,
        example: Department.IT,
    })
    @IsEnum(Department)
    department: Department;

    @ApiPropertyOptional({
        description: "Whether the expense has been reimbursed",
        example: false,
        default: false,
    })
    @IsBoolean()
    @Type(() => Boolean)
    @IsOptional()
    isReimbursed?: boolean;

    @ApiPropertyOptional({
        description: "Whether the expense has been approved",
        example: false,
        default: false,
    })
    @IsBoolean()
    @Type(() => Boolean)
    @IsOptional()
    isApproved?: boolean;


}

export class UpdateExpenseDto extends PartialType(CreateExpenseDto) { }
