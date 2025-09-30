import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";


@Schema({ timestamps: true })
export class Budget extends Document {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  allocatedAmount: number;

  @Prop({ required: true, default: 0 })
  spentAmount: number;

  @Prop({ required: true })
  month: number

  @Prop({ required: true })
  year: number



  @Prop({ type: [{ type: Types.ObjectId, ref: "Expense" }] })
  expenses: Types.ObjectId[];

}

export const BudgetSchema =
  SchemaFactory.createForClass(Budget);
