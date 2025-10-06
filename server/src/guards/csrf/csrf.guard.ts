import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import Tokens from 'csrf';

@Injectable()
export class CsrfGuard implements CanActivate {
  private tokens = new Tokens();

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const headerToken = req.headers['x-csrf-token'] as string;

    console.log('=== CSRF GUARD DEBUG ===');
    console.log('Header token:', headerToken);
    console.log('Session ID:', req.session?.id);
    console.log('CSRF Secret exists:', !!req.session?.twoFactorSecret);
    console.log('TwoFactor Secret exists:', !!req.session?.twoFactorSecret);

    if (!headerToken) {
      console.log('❌ Missing CSRF token');
      throw new ForbiddenException('Missing CSRF token');
    }

    if (!req.session?.twoFactorSecret) {
      console.log('❌ CSRF not initialized for this session');
      throw new ForbiddenException('CSRF not initialized for this session');
    }

    const isValid = this.tokens.verify(req.session.twoFactorSecret, headerToken);
    console.log('✅ CSRF validation result:', isValid);

    if (!isValid) {
      console.log('❌ Invalid CSRF token');
      throw new ForbiddenException('Invalid CSRF token');
    }

    console.log('=== CSRF GUARD PASSED ===');
    return true;
  }
}