/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { createClient } from 'redis';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { swaggerConfig } from './config/swagger.config';
import { csrfProtection } from './middlewares/csrf.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const prefix = 'api/v1';
  app.setGlobalPrefix(prefix);

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://192.168.0.125:5173',
    ],
    credentials: true,
    methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
  });

  // Swagger
  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, documentFactory);

  // Redis
  const redisClient = createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    },
  });

  redisClient.on('connect', () => console.log('✅ Redis connected'));
  redisClient.on('error', (err) =>
    console.error('❌ Redis connection error:', err),
  );

  await redisClient.connect().catch((err) => {
    console.error('Redis connection failed:', err);
    process.exit(1);
  });

  // --- SESSION SETUP ---
  app.use(
    session({
      store: new RedisStore({
        client: redisClient,
        prefix: 'sess:',
        ttl: 60 * 60 * 24, // 1 day
      }),
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // set true in production (https)
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        sameSite: 'lax',
      },
    }),
  );

  // --- CSRF SETUP ---
  const skipCsrfPaths = [
    '/api/v1/api-docs',
    '/api/v1/api-docs/json',
    '/api/v1/auth/login',
    '/api/v1/auth/2fa/verify',
    '/api/v1/auth/2fa/show-qr',
  ];

  app.use((req, res, next) => {
    // Skip preflight requests
    if (req.method === 'OPTIONS') return next();

    // Skip CSRF for specific routes
    if (skipCsrfPaths.some((path) => req.originalUrl.startsWith(path))) {
      return next();
    }

    csrfProtection(req, res, next);
  });

  // --- CSRF ERROR HANDLER ---
  app.use((err, req, res, next) => {
    if (err.code !== 'EBADCSRFTOKEN') return next(err);
    res.status(403).json({ message: 'Invalid or missing CSRF token' });
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `🚀 Server running at http://localhost:${process.env.PORT ?? 3000}/${prefix}`,
  );
}

void bootstrap();
