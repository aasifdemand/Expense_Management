


import { IsNumber, IsOptional, IsMongoId, Min, IsBoolean } from "class-validator";
import { Type } from "class-transformer";
import { PartialType } from "@nestjs/mapped-types";

export class CreateReimbursementDto {

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isReimbursed?: boolean

    @IsOptional()
    @IsMongoId()
    expense?: string;

    @IsOptional()
    @IsMongoId()
    requestedBy?: string

    @IsNumber()
    @Type(() => Number)
    @Min(1)
    amount: number;
}


export class UpdateReimbursementDto extends PartialType(CreateReimbursementDto) { }