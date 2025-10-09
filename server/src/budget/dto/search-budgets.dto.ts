import { Type } from "class-transformer";
import { IsOptional, IsString, IsNumber, Min, IsEnum } from "class-validator";

export enum Location {
    OVERALL = 'OVERALL',
    MUMBAI = 'MUMBAI',
    BENGALURU = 'BENGALURU'
}


export class SearchBudgetAllocationsDto {
    @IsOptional()
    @IsString()
    userName?: string;


    @IsOptional()
    @IsString()
    company?: string;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    month?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    year?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    minAllocated?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    maxAllocated?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    minSpent?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    maxSpent?: number;


    @IsOptional()
    @IsEnum(Location)
    location?: Location;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 10;
}
