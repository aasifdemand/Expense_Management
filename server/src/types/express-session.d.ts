import "express-session";

declare module "express-session" {
  interface SessionData {
    user?: {
      id: string;
      name: string;
      role: string;
    };
    userId?: string;
    twoFactorSecret?: string;
    twoFactorPending?: boolean;
    twoFactorVerified?: boolean;
    authenticated?: boolean;
    csrfSecret?:string
  }
}
