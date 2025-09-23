/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */


import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { createClient } from "redis";
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { swaggerConfig } from './config/swagger.config';
import { csrfProtection } from './middlewares/csrf.middleware';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  const prefix = "api/v1"

  app.setGlobalPrefix(prefix)

  app.enableCors({
    methods: "POST,GET,PUT,PATCH,DELETE",
    credentials: true,
    origin: "http://localhost:5173"
  })


  const documentFactory = () => SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, documentFactory);


  const redisClient = createClient({
    socket: {
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
    },
  });
  redisClient.connect().catch(console.error);

  app.use(
    session({
      store: new RedisStore({
        client: redisClient, prefix: "sess:",
        ttl: 60 * 60 * 24,
      }),
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // for https set it to true
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        sameSite: "strict",
      },
    }),
  );

  


  const skipCsrfPaths = [
  '/api-docs',
  '/api-docs/json',
  '/auth/login',
  '/auth/2fa/verify',
];

app.use((req, res, next) => {
  const originalPath = req.originalUrl; // includes /api/v1 prefix
  if (skipCsrfPaths.some(path => originalPath.startsWith(path) || originalPath.includes(path))) {
    return next();
  }
  csrfProtection(req, res, next);
});


  app.use((err, req, res, next) => {

    if (err.code !== 'EBADCSRFTOKEN') return next(err);


    res.status(403).json({ message: 'Invalid CSRF token' });
  });

  await app.listen(process.env.PORT ?? 3000);


  console.log(`Server is listening to the connections at http://localhost:${process.env.PORT}/${prefix}✔✔`);



}
void bootstrap();
