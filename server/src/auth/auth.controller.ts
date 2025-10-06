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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import type { Request, Response } from 'express';
import { CsrfGuard } from 'src/guards/csrf/csrf.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from 'src/models/user.model';

@Controller('auth')
export class AuthController {
  private logger = new Logger('auth_controller');
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async authUser(@Body() data: AuthDto, @Req() req: Request) {
    this.logger.log('Received login request');

    return await this.authService.auth(data, req);
  }

  // 2FA verification route
  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  async verify2FA(
    @Body() body: { token: string; userId: string },
    @Req() req: Request,
  ) {
    return this.authService.verifyTwoFactorCode(body.token, req);
  }

  // In your AuthController
  @Get('csrf-token')
  getCsrfToken(@Req() req: Request) {
    // This will use the csrfSecret from the session
    const token = req.csrfToken();
    console.log('Generated CSRF token:', token);
    console.log('Session CSRF secret:', req.session.twoFactorSecret);
    return { csrfToken: token };
  }

  // Get current session info
  @Get('session')
  @UseGuards(CsrfGuard)
  getSession(@Req() req: Request) {
    return this.authService.getSessionData(req);
  }

  // Logout and clear session & cookie
  @Post('logout')
  @UseGuards(CsrfGuard)
  async logout(@Req() req: Request, @Res() res: Response) {
    try {
      await this.authService.clearSession(req);

      res.clearCookie('connect.sid', {
        httpOnly: true,
        sameSite: 'lax',
      });

      return res.json({ message: 'Session destroyed, logged out' });
    } catch (err: any) {
      return res.status(500).json({ message: 'Failed to logout' });
    }
  }

  // Get list of users (superadmin only)
  @Get('users')
  @UseGuards(CsrfGuard)
  async getTheListOfUsers(@Req() req: Request) {
    console.log('Session: ', req.session);

    if (req?.session?.user?.role !== UserRole.SUPERADMIN) {
      throw new UnauthorizedException(
        'Normal User is not allowed to get other db users',
      );
    }
    return this.authService.getAll();
  }

  // Create user (superadmin only)
  @Post('users/create')
  @UseGuards(CsrfGuard)
  async createUser(
    @Session() session: Record<string, any>,
    @Body() data: CreateUserDto,
  ) {
    if (session?.user?.role !== 'superadmin') {
      throw new UnauthorizedException(
        'Normal User is not allowed to create users',
      );
    }
    return this.authService.createNewUser(data);
  }

  // Reset password (superadmin only)
  @Patch('reset/:id')
  @UseGuards(CsrfGuard)
  async resetPass(
    @Session() session: Record<string, any>,
    @Body() newPass: any,
    @Param('id') id: string,
  ) {
    if (session?.user?.role !== 'superadmin') {
      throw new UnauthorizedException(
        'Normal User is not allowed to do this operation',
      );
    }
    return this.authService.resetUserPassword(id, newPass);
  }
}
