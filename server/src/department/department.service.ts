import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Department } from 'src/models/department.model';
import { SubDepartment } from 'src/models/sub-department.model';

@Injectable()
export class DepartmentService {

    constructor(@InjectModel(Department.name) private readonly departmentModel: Model<Department>,
        @InjectModel(SubDepartment.name) private readonly subDepartmentModel: Model<SubDepartment>,) { }


    async fetchAllDepartments() {
        const departments = await this.departmentModel.find()
        return { departments }
    }

    async fetchAllSubdepartments() {
        const subDepartments = await this.subDepartmentModel.find()
        return { subDepartments }
    }

    async fetchSubdepartmentsById(deptId: string) {
        const subs = await this.subDepartmentModel.find({ department: new Types.ObjectId(deptId) })

        return { subDepartments: subs }
    }

}
