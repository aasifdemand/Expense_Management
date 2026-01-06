import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";


@Schema({ timestamps: true })
export class AdminExpense extends Document {
  @Prop({ default: "" })
  description?: string;

  @Prop({ required: true })
  amount: number;

  
  @Prop({ default: () => new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000) })
  date: Date;


  @Prop({ type: Types.ObjectId, ref: "Department", required: true })
  department: Types.ObjectId;


  @Prop({ type: Types.ObjectId, ref: "SubDepartment" })
  subDepartment?: Types.ObjectId;

  @Prop({ default: "" })
  paymentMode?: string;


  @Prop({ default: "", })
  vendor?: string

  @Prop({ default: "" })
  proof?: string;

  
}



export const AdminExpenseSchema = SchemaFactory.createForClass(AdminExpense);



