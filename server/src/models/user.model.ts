import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";


export enum UserRole {
  SUPERADMIN = 'superadmin',
  USER = 'user',
}


@Schema({timestamps:true})
export class User extends Document {

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({default:""})
  twoFactorSecret?: string;

}


export const userSchema = SchemaFactory.createForClass(User)