/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  UnauthorizedException,
  Session,
  Get,
  Req,
  UseGuards,
  Res,
  Param,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import type { Request, Response } from 'express';
import { CsrfGuard } from 'src/guards/csrf/csrf.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from 'src/models/user.model';
import { UpdateProfileDto } from './dto/profile.dto';

@Controller('auth')
export class AuthController {
  private logger = new Logger('auth_controller');
  constructor(private readonly authService: AuthService) { }

  // 🔐 Login user
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async authUser(@Body() data: AuthDto, @Req() req: Request) {
    this.logger.log('Received login request');
    return await this.authService.auth(data, req);
  }

  // 🔢 2FA Verification
  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  async verify2FA(@Body() body: { token: string }, @Req() req: Request) {
    if (!body.token || body.token.length !== 6) {
      throw new BadRequestException('Token must be 6 digits');
    }

    return this.authService.verify2fa(body.token, req);
  }

  // 🛡️ Get CSRF token
  @Get('csrf-token')
  getCsrfToken(@Req() req: Request) {
    const token = req.csrfToken();
    console.log('Generated CSRF token:', token);
    return { csrfToken: token };
  }

  // 👤 Get current session info
  @Get('session')
  @UseGuards(CsrfGuard)
  getSession(@Req() req: Request) {
    return this.authService.getSessionData(req);
  }

  // 🚪 Logout current device
  @Post('logout')
  @UseGuards(CsrfGuard)
  async logout(@Req() req: Request, @Res() res: Response) {
    try {
      await this.authService.logout(req);

      res.clearCookie('connect.sid', {
        httpOnly: true,
        sameSite: 'lax',
      });

      return res.json({ message: 'Logged out successfully' });
    } catch (err: any) {
      return res.status(500).json({ message: 'Failed to logout' });
    }
  }


  // 👥 Get list of users (superadmin only)
  @Get('users')
  @UseGuards(CsrfGuard)
  async getTheListOfUsers(@Req() req: Request) {
    if (req?.session?.user?.role !== UserRole.SUPERADMIN) {
      throw new UnauthorizedException('Normal user not allowed to fetch users');
    }
    return this.authService.getAll();
  }

  // ➕ Create user (superadmin only)
  @Post('users/create')
  @UseGuards(CsrfGuard)
  async createUser(
    @Session() session: Record<string, any>,
    @Body() data: CreateUserDto,
  ) {
    if (session?.user?.role !== UserRole.SUPERADMIN) {
      throw new UnauthorizedException('Only superadmin can create users');
    }
    return this.authService.createNewUser(data);
  }

  // 🔑 Reset password (superadmin only)
  @Patch('reset/:id')
  @UseGuards(CsrfGuard)
  async resetPassword(
    @Session() session: Record<string, any>,
    @Param('id') id: string,
    @Body() body: { password: string },
  ) {
    if (session?.user?.role !== UserRole.SUPERADMIN) {
      throw new UnauthorizedException(
        'Only superadmin can reset user passwords',
      );
    }

    if (!body.password || body.password.trim().length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    return this.authService.resetUserPassword(id, body.password);
  }

  // ✏️ Update own profile
  @Patch('profile/:id')
  @UseGuards(CsrfGuard)
  async updateProfile(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    // Users can only update their own profile
    return this.authService.updateProfile(updateProfileDto, id);
  }
}
