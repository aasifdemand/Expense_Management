import { Controller, Get, Param, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CsrfGuard } from 'src/guards/csrf/csrf.guard';
import type { Request } from 'express';

@Controller('department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) { }

  @Get("departments")
  @UseGuards(CsrfGuard)
  async getAllDepartments(@Req() req: Request) {
    const session = req.session

    if (session?.twoFactorPending && !session.twoFactorVerified && !session.authenticated) throw new UnauthorizedException("please verify your identity first")

    return await this.departmentService.fetchAllDepartments()
  }

  @Get("sub-departments")
  @UseGuards(CsrfGuard)
  async getAllSubDepartments(@Req() req: Request) {
    const session = req.session

    if (session?.twoFactorPending && !session.twoFactorVerified && !session.authenticated) throw new UnauthorizedException("please verify your identity first")

    return await this.departmentService.fetchAllSubdepartments()
  }


  @Get(":deptId")
  @UseGuards(CsrfGuard)
  async getSubdepartmentsById(@Req() req: Request, @Param("deptId") id: string) {
    const session = req.session

    if (session?.twoFactorPending && !session.twoFactorVerified && !session.authenticated) throw new UnauthorizedException("please verify your identity first")
    return await this.departmentService.fetchSubdepartmentsById(id)
  }


}
