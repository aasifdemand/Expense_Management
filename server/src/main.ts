/* eslint-disable @typescript-eslint/no-unsafe-call */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import Redis from 'ioredis';
import session from 'express-session';
import { RedisStore } from 'connect-redis'; 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  const prefix = "api/v1"

  app.setGlobalPrefix(prefix)

  app.enableCors({
    methods: "POST,GET,PUT,PATCH,DELETE",
    credentials:true,
    origin:"http://localhost:5173"
  })

  const config = new DocumentBuilder()
    .setTitle('Expense Management APIs')
    .setDescription('The In-House Expense Management System is a secure internal platform designed specifically for Demand Curve Marketing to manage company expenses, user reimbursements, and budget allocations. The system ensures financial accountability through mandatory documentation, role-based access control, and comprehensive activity tracking')
    .setVersion('1.0')
    .addTag('Expense Manager')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, documentFactory);


  const redisClient = new Redis();

  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24,
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);


  console.log(`Server is listening to the connections at http://localhost:${process.env.PORT}/${prefix} ♨♨`);



}
void bootstrap();
