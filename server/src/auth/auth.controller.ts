
/* eslint-disable no-useless-catch */
import { Body, Controller, HttpCode, HttpStatus, Logger, Post, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private logger = new Logger("auth_controller");
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @ApiOperation({ summary: 'Authenticate user and generate 2FA secret + QR code' })
  @ApiBody({ type: AuthDto })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 201, description: 'User authenticated successfully with QR code', 
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
  @ApiResponse({ status: 409, description: 'User already exists' })
   
  async authUser(@Body() data: AuthDto) {
    try {
      this.logger.log("received login request from the user");
      return this.authService.auth(data);
    } catch (error: any) {
      throw error;
    }
  }

  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify 2FA token for user' })
  @ApiBody({ schema: {
    type: 'object',
    properties: {
      userId: { type: 'string', example: 'userId123' },
      token: { type: 'string', example: '123456' }
    },
    required: ['userId', 'token']
  }})
  @ApiResponse({ status: 200, description: '2FA token verified successfully', schema: { example: { status: '2FA verified' } } })
  @ApiResponse({ status: 401, description: 'Invalid 2FA token' })
  async verify2FA(@Body() body: { userId: string; token: string }) {
    const isValid = await this.authService.verifyTwoFactorCode(body.userId, body.token);
    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA token');
    }
    return { status: '2FA verified' };
  }



  
}
