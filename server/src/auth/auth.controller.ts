/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable no-useless-catch */
import { Body, Controller, HttpCode, HttpStatus, Logger, Post, UnauthorizedException, Session, Get, Req, UseGuards, Res, Param, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import type { Request, Response } from 'express';
import { CsrfGuard } from 'src/guards/csrf/csrf.guard';
import { CreateUserDto } from './dto/create-user.dto';


@Controller('auth')
export class AuthController {
  private logger = new Logger("auth_controller");
  constructor(private readonly authService: AuthService) { }

  @Post("login")
  @HttpCode(HttpStatus.OK)

  async authUser(@Body() data: AuthDto, @Session() session: Record<string, any>, deviceName: string) {
    try {
      this.logger.log("received login request from the user");
      return this.authService.auth(data, session, deviceName);
    } catch (error: any) {
      throw error;
    }
  }

  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  async verify2FA(
    @Body() body: { token: string, userId: string },
    @Session() session: Record<string, any>,

  ) {
    const result = await this.authService.verifyTwoFactorCode(body.token, session);
    return result;
  }



  @Get('csrf-token')
  getCsrfToken(@Req() req: Request) {
    console.log("Generated CSRF token:", req.csrfToken());
    return { csrfToken: req.csrfToken() };
  }







  @Get('session')
  @UseGuards(CsrfGuard)
  getSession(@Session() session: Record<string, any>) {
    return this.authService.getSessionData(session);
  }

  @Post('logout')
  @UseGuards(CsrfGuard)
  async logout(@Session() session: Record<string, any>, @Res() res: Response) {
    try {
      await this.authService.clearSession(session);

      // Clear the cookie in the browser
      res.clearCookie('connect.sid', {
        httpOnly: true,
        sameSite: 'lax', // same as your session cookie config
      });

      return res.json({ message: 'Session destroyed, logged out' });
    } catch (err: any) {
      return res.status(500).json({ message: 'Failed to logout' });
    }
  }

  @Get("users")
  @UseGuards(CsrfGuard)
  async getTheListOfUsers(@Session() session: Record<string, any>) {
    if (session?.user?.role !== "superadmin") {
      throw new UnauthorizedException("Normal User is not allowed to get other db users")
    }

    return await this.authService.getAll()
  }

  @Post("users/create")
  @UseGuards(CsrfGuard)
  async createUser(@Session() session: Record<string, any>, @Body() data: CreateUserDto) {
    if (session?.user?.role !== "superadmin") {
      throw new UnauthorizedException("Normal User is not allowed to Create other users")
    }
    return await this.authService.createNewUser(data)
  }


  @Patch("reset/:id")
  @UseGuards(CsrfGuard)
  async resetPass(@Session() session: Record<string, any>, @Body() newPass: any, @Param("id") id: string) {
    if (session?.user?.role !== "superadmin") {
      throw new UnauthorizedException("Normal User is not allowed to do this operation")
    }
    return await this.authService.resetUserPassword(id, newPass)
  }
}