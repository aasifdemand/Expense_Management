import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum UserRole {
  SUPERADMIN = 'superadmin',
  USER = 'user',
}

export enum UserLocation {
  MUMBAI = 'MUMBAI',
  BENGALURU = 'BENGALURU',
  OVERALL = 'OVERALL',
}


export enum UserDepartment {
  SALES = "SALES",
  DATA = "DATA",
  IT = "IT",
  HR = "HR",
  GENERAL = "GENERAL"
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ default: "" })
  email?: string;


  @Prop({ default: "" })
  phone?: string;



  @Prop({ required: true })
  password: string;

  @Prop({ enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ default: '' })
  twoFactorSecret?: string;

  @Prop({ enum: UserDepartment, default: UserDepartment.GENERAL })
  department: UserDepartment

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Expense' }] })
  expenses?: Types.ObjectId[];

  @Prop({
    enum: UserLocation,
    required: true
  })
  userLoc: UserLocation;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Budget' }] })
  allocatedBudgets: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Reimbursement' }], default: [] })
  reimbursements: Types.ObjectId[];

  @Prop({ default: 0 })
  spentAmount: number;

  @Prop({ default: 0 })
  reimbursedAmount: number;

  @Prop({ default: 0 })
  allocatedAmount: number;

  @Prop({ default: 0 })
  budgetLeft: number;

  @Prop({
    type: [
      {
        deviceId: { type: String, required: true },
        deviceName: { type: String },
        lastLogin: { type: Date, default: Date.now },
        twoFactorVerified: { type: Boolean, default: false },
        twoFactorSecret: { type: String },
      },
    ],
    default: [],
  })
  sessions: {
    deviceId: string;
    deviceName?: string;
    lastLogin: Date;
    twoFactorVerified: boolean;
    twoFactorSecret?: string; // <- new field
  }[];
}

export const userSchema = SchemaFactory.createForClass(User);
