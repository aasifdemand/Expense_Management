
import  csurf from 'csurf';

export const csrfProtection = csurf({
  cookie: false,
  value: (req) => req.headers['x-csrf-token'] as string,
});
