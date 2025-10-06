import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import Tokens from 'csrf';

@Injectable()
export class CsrfGuard implements CanActivate {
  private tokens = new Tokens();

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const headerToken = req.headers['x-csrf-token'] as string;



    if (!headerToken) {

      throw new ForbiddenException('Missing CSRF token');
    }

    if (!req.session?.twoFactorSecret) {

      throw new ForbiddenException('CSRF not initialized for this session');
    }

    const isValid = this.tokens.verify(req.session.twoFactorSecret, headerToken);


    if (!isValid) {

      throw new ForbiddenException('Invalid CSRF token');
    }


    return true;
  }
}