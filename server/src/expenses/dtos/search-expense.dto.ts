import {
    IsString,
    IsNumber,
    IsBoolean,
    IsOptional,
    IsMongoId,
    IsEnum,
} from "class-validator";
import { Type } from "class-transformer";

export enum Location {
    OVERALL = 'OVERALL',
    MUMBAI = 'MUMBAI',
    BENGALURU = 'BENGALURU'
}

export class SearchExpensesDto {
    @IsOptional()
    @IsString()
    userName?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    minAmount?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    maxAmount?: number;

    @IsOptional()
    @IsMongoId()
    department?: string;

    @IsOptional()
    @IsMongoId()
    subDepartment?: string;

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
    @IsEnum(Location)
    location?: Location;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    limit?: number = 20;
}