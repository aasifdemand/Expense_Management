import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";


@Schema({ timestamps: true })
export class Expense extends Document {
  @Prop({ default: "" })
  description?: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 0 })
  fromAllocation: number;

  @Prop({ default: 0 })
  fromReimbursement: number;

  @Prop({ default: Date.now() })
  date: Date;



  @Prop({ type: Types.ObjectId, ref: "Department", required: true })
  department: Types.ObjectId;


  @Prop({ type: Types.ObjectId, ref: "SubDepartment" })
  subDepartment?: Types.ObjectId;

  @Prop({ default: "" })
  paymentMode?: string;


  @Prop({ default: "" })
  proof?: string;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Budget" })
  budget?: Types.ObjectId;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
