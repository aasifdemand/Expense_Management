import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";


export enum UserRole {
  SUPERADMIN = 'superadmin',
  USER = 'user',
}




@Schema({ timestamps: true })
export class User extends Document {

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ default: "" })
  twoFactorSecret?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: "Expense" }] })
  expenses?: Types.ObjectId[];


  @Prop({ default: "Bangalore" })
  userLoc?: string

  @Prop({ type: [{ type: Types.ObjectId, ref: "Budget" }] })
  allocatedBudgets: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: "Reimbursement" }], default: [] })
  reimbursements: Types.ObjectId[]

  @Prop({ default: 0 })
  spentAmount: number;

  @Prop({ default: 0 })
  reimbursedAmount: number;

  @Prop({ default: 0 })
  allocatedAmount: number;

  @Prop({ default: 0 })
  budgetLeft: 0
}


export const userSchema = SchemaFactory.createForClass(User)