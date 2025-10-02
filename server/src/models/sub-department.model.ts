
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Department } from "./department.model";

@Schema({ timestamps: true })
export class SubDepartment extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ type: Types.ObjectId, ref: Department.name, required: true })
    department: Types.ObjectId;
}

export const SubDepartmentSchema = SchemaFactory.createForClass(SubDepartment);
