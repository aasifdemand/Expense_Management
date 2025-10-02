import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";


@Schema({ timestamps: true })
export class Budget extends Document {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  allocatedAmount: number;

  @Prop({ default: 0 })
  spentAmount: number;

  @Prop({ default: 0 })
  remainingAmount: number;

  @Prop({ required: true })
  month: number

  @Prop({ required: true })
  year: number

}


export const BudgetSchema =
  SchemaFactory.createForClass(Budget);


BudgetSchema.pre("save", function (next) {
  this.remainingAmount = this.allocatedAmount - this.spentAmount
  next()
})
