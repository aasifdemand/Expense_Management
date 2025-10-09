import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common';
import { ReimbursementService } from './reimbursement.service';
import { CsrfGuard } from 'src/guards/csrf/csrf.guard';
import type { Request } from 'express';

@Controller('reimbursement')
export class ReimbursementController {
  constructor(private readonly reimbursementService: ReimbursementService) { }



  @Get()
  @UseGuards(CsrfGuard)
  async getAll(
    @Req() req: Request,
    @Query('location') location?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const session = req.session;

    if (session?.twoFactorPending || !session?.twoFactorVerified || !session?.authenticated) {
      throw new UnauthorizedException("Unauthorized, Please verify Your identity first");
    }

    // If query parameters are provided, use the enhanced version with pagination and location
    if (location || page || limit) {
      return await this.reimbursementService.getAllReimbursements(
        page ? Number(page) : 1,
        limit ? Number(limit) : 20,
        location
      );
    }

    // Otherwise use the simple version
    return await this.reimbursementService.getAllReimbursements();
  }

  @Get(":id")
  @UseGuards(CsrfGuard)
  async getReimbursementsForUser(
    @Req() req: Request,
    @Param("id") id: string,
    @Query('location') location?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const session = req.session;

    if (session?.twoFactorPending || !session?.twoFactorVerified || !session?.authenticated) {
      throw new UnauthorizedException("Unauthorized, Please verify Your identity first");
    }

    // If query parameters are provided, use the enhanced version with pagination and location
    if (location || page || limit) {
      return await this.reimbursementService.getUserReimbursements(
        id,
        page ? Number(page) : 1,
        limit ? Number(limit) : 20,
        location
      );
    }

    // Otherwise use the simple version
    return await this.reimbursementService.getUserReimbursements(id);
  }





  @Patch("admin/:id")
  @UseGuards(CsrfGuard)
  async updateReimbursementStatus(
    @Body("isReimbursed") isReimbursed: boolean,
    @Param("id") id: string,
    @Req() req: Request
  ) {
    const session = req.session;
    if (session?.twoFactorPending || !session?.twoFactorVerified || !session?.authenticated) {
      throw new UnauthorizedException("Unauthorized, Please verify Your identity first");
    }

    return await this.reimbursementService.superadminUpdateReimbursement(id, isReimbursed, session?.user)
  }
}