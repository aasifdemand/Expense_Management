import { Module } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';
import { Department, DepartmentSchema } from 'src/models/department.model';
import { SubDepartment, SubDepartmentSchema } from 'src/models/sub-department.model';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Department.name,
        schema: DepartmentSchema
      },
      {
        name: SubDepartment.name,
        schema: SubDepartmentSchema
      }
    ])
  ],
  controllers: [DepartmentController],
  providers: [DepartmentService],
})
export class DepartmentModule { }
