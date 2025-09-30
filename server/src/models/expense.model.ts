import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Department } from "src/enums/department.enum";

@Schema({ timestamps: true })
export class Expense extends Document {

  @Prop({ required: true })
  paidTo: string

  @Prop({ required: true })
  amount: number;

  @Prop({ default: Date.now() })
  date: Date

  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  month: number;

  @Prop({ required: true, enum: Department, default: Department.OTHER })
  department?: Department;

  @Prop({ default: "" })
  SubDepartment?: string




  @Prop({ default: "" })
  paymentMode?: string

  @Prop({ default: false })
  isReimbursed: boolean;


  @Prop({ default: false })
  isApproved: boolean;

  @Prop({ default: "" })
  proof?: string;

  @Prop({ type: Types.ObjectId, ref: "User" })
  user: Types.ObjectId


  @Prop({ type: Types.ObjectId, ref: "Budget", required: true })
  budget: Types.ObjectId;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
