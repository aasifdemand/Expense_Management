import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class Reimbursement extends Document {
    @Prop({ type: Types.ObjectId, ref: "Expense", required: false })
    expense?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true })
    requestedBy: Types.ObjectId;

    @Prop({ required: true })
    amount: number;

    @Prop({ type: Boolean, default: false })
    isReimbursed?: boolean;

    @Prop({ type: Date })
    reimbursedAt?: Date;
}

export const ReimbursementSchema = SchemaFactory.createForClass(Reimbursement);
