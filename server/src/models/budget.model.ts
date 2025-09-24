import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Department } from "src/enums/department.enum";

@Schema({ timestamps: true })
export class BudgetAllocation extends Document {
  @Prop({ required: true, enum: Department })
  department: Department;

  @Prop({ required: true })
  allocatedAmount: number;

  @Prop({ required: true, default: 0 })
  spentAmount: number;

  @Prop({ required: true })
  startDate: string;

  @Prop({ required: true })
  endDate: string;

  @Prop({ default: "" })
  notes?: string;
}

export const BudgetAllocationSchema =
  SchemaFactory.createForClass(BudgetAllocation);
