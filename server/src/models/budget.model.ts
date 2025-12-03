import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";


export enum BudgetType {
  NORMAL = "Normal",
  REIMBURSED = "Reimbursement"
}

@Schema({ timestamps: true })
export class Budget extends Document {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Expense", })
  expense?: Types.ObjectId;

  @Prop({ type: String, default: "" })
  company?: string

  @Prop({
    type: String,
    enum: BudgetType,
    default: BudgetType.NORMAL
  })
  type: BudgetType;


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


// safe pre-save hook — only set month/year on creation and compute remainingAmount
BudgetSchema.pre('save', function (next) {
  // Ensure numeric values
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  this.allocatedAmount = Number(this.allocatedAmount || 0);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  this.spentAmount = Number(this.spentAmount || 0);

  // Recompute remaining amount deterministically
  this.remainingAmount = this.allocatedAmount - this.spentAmount;
  if (this.remainingAmount < 0) this.remainingAmount = 0;

  // Only set month/year once (when document is new or fields missing)
  if (this.isNew || !this.month || !this.year) {
    const now = new Date();
    this.month = now.getMonth() + 1;
    this.year = now.getFullYear();
  }

  // single next() call
  next();
});


