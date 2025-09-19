import 'express-session';
import { User } from 'src/models/user.model';

declare module 'express-session' {
  interface Session {
    user? : User
  }
}
