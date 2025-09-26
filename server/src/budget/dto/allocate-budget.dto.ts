

import { PartialType } from "@nestjs/mapped-types";
import { IsNumber, Min, Max, IsMongoId } from "class-validator";


export class AllocateBudgetDto {


    @IsMongoId()
    userId: string

    @IsNumber()
    @Min(1)
    amount: number;

    @IsNumber()
    @Min(1)
    @Max(12)
    month: number;

    @IsNumber()
    @Min(2000)
    year: number;
}


export class UpdateAllocatedBudgetDto extends PartialType(AllocateBudgetDto) { }
