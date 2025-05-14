import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const redisClient = createClient({
    socket: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
  });
  await redisClient.connect();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    throw new Error('SESSION_SECRET is not defined!');
  }

  app.use(
    session({
      store: new RedisStore({client: redisClient}),
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: true,            
        sameSite: 'strict',      
        maxAge: 1000 * 60 * 30,
      },
    }),
  );

  app.enableCors({
    origin: ['http://localhost:4200', 'https://studivent-dhbw.de'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'x-api-key',
    ],
  });  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
