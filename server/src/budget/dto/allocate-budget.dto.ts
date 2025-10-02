

import { PartialType } from "@nestjs/mapped-types";
import { IsNumber, IsMongoId } from "class-validator";


export class AllocateBudgetDto {


    @IsMongoId()
    userId: string

    @IsNumber()
    amount: number;


}


export class UpdateAllocatedBudgetDto extends PartialType(AllocateBudgetDto) { }
