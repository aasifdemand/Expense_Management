import 'express-session';
import { User } from 'src/models/user.model';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    deviceId?: string;
    role?: string;
    user?: User;
    twoFactorSecret?: string;
    twoFactorPending?: boolean;
    twoFactorVerified?: boolean;
    authenticated?: boolean;
  }
}
