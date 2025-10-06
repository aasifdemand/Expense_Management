// csrf.middleware.ts
import Tokens from 'csrf';
import type { NextFunction, Request, Response } from 'express';

const tokens = new Tokens();

export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Generate CSRF secret if not exists
  if (!req.session.twoFactorSecret) {
    req.session.twoFactorSecret = tokens.secretSync();
    console.log('Generated new CSRF secret for session');
  }

  // Generate token using CSRF secret (NOT twoFactorSecret)
  req.csrfToken = () => tokens.create(req?.session?.twoFactorSecret as string);

  // Make token available in response locals for templates if needed
  res.locals.csrfToken = req.csrfToken();

  next();
};