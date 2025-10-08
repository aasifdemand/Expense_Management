

import { PartialType } from "@nestjs/mapped-types";
import { IsNumber, IsMongoId, IsString, IsOptional } from "class-validator";


export class AllocateBudgetDto {


    @IsMongoId()
    userId: string

    @IsNumber()
    amount: number;



    @IsString()
    @IsOptional()
    company?: string
}


export class UpdateAllocatedBudgetDto extends PartialType(AllocateBudgetDto) { }
