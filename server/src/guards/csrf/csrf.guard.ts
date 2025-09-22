import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import Tokens from 'csrf';

@Injectable()
export class CsrfGuard implements CanActivate {
  private tokens = new Tokens();

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const headerToken = req.headers['x-csrf-token'] as string;
    const session = req?.session

    if (!headerToken) {
      throw new ForbiddenException('Missing CSRF token');
    }

    if (!session?.csrfSecret) {
      throw new ForbiddenException('CSRF not initialized for this session');
    }

    const isValid = this.tokens.verify(session.csrfSecret, headerToken);

    if (!isValid) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }
}
