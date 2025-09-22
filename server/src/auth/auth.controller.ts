
/* eslint-disable no-useless-catch */
import { Body, Controller, HttpCode, HttpStatus, Logger, Post, UnauthorizedException, Session, Get, Req, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import type { Request, Response } from 'express';
import { CsrfGuard } from 'src/guards/csrf/csrf.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private logger = new Logger("auth_controller");
  constructor(private readonly authService: AuthService) { }

  @Post("login")
  @ApiOperation({ summary: 'Authenticate user and generate 2FA secret + QR code' })
  @ApiBody({ type: AuthDto })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200, description: 'User authenticated successfully with QR code',
    schema: {
      example: {
        status: "ok",
        user: {
          _id: "userId",
          name: "username",
          password: "hashedpassword",
          twoFactorSecret: "BASE32SECRET"
        },
        qr: "data:image/png;base64,iVBORw0KGgo..."
      }
    }
  })


  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async authUser(@Body() data: AuthDto, @Session() session: Record<string, any>) {
    try {
      this.logger.log("received login request from the user");
      return this.authService.auth(data, session);
    } catch (error: any) {
      throw error;
    }
  }

  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify 2FA token for user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', example: '123456' }
      },
      required: ['token']
    }
  })
  @ApiResponse({
    status: 200, description: '2FA token verified successfully',
    schema: {
      example: {
        verified: true,
        message: "Verified successfully",
        sessionData: {
          userId: "userId123",
          username: "testuser",
          twoFactorVerified: true,
          authenticated: true
        }
      }
    }
  })


  @ApiResponse({ status: 401, description: 'Invalid 2FA token' })
  async verify2FA(
    @Body() body: { token: string, userId: string },
    @Session() session: Record<string, any>,

  ) {
    const result = await this.authService.verifyTwoFactorCode(body.token, body.userId, session);
    if (!result.verified) {
      throw new UnauthorizedException('Invalid 2FA token');
    }
    return result;
  }

  @Get('csrf-token')
  @ApiOperation({ summary: "Get CSRF token for the session" })
  @ApiResponse({
    schema: {
      example: {
        csrfToken: "csrf_token"
      }
    }
  })


  getCsrfToken(@Req() req: Request) {
    console.log("Generated CSRF token:", req.csrfToken());
    return { csrfToken: req.csrfToken() };
  }

  @Get('session')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Get current session data' })
  @ApiResponse({ status: 200, description: 'Session data retrieved successfully' })
  getSession(@Session() session: Record<string, any>) {
    return this.authService.getSessionData(session);
  }

  @Post('logout')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Logout user and clear session' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  async logout(@Session() session: Record<string, any>, @Res() res: Response) {
    try {
      await this.authService.clearSession(session);

      // Clear the cookie in the browser
      res.clearCookie('connect.sid', {
        httpOnly: true,
        sameSite: 'lax', // same as your session cookie config
      });

      return res.json({ message: 'Session destroyed, logged out' });
    } catch (err) {
      return res.status(500).json({ message: 'Failed to logout' });
    }
  }
}