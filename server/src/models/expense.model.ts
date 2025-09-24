import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Department } from "src/enums/department.enum";

@Schema({ timestamps: true })
export class Expense extends Document {
  @Prop({ type: Types.ObjectId, ref: "User" })
  paidTo: Types.ObjectId

  @Prop({ required: true })
  amount: number;

  @Prop({ default: Date.now() })
  date: Date

  @Prop({ required: true, enum: Department, default: Department.OTHER })
  department?: Department;

  @Prop({ default: false })
  isReimbursed: boolean;


  @Prop({ default: false })
  isApproved: boolean;

  @Prop({ default: "" })
  proof?: string;

}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
