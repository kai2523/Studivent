import { Module } from '@nestjs/common';
import { EventModule } from './event/event.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }),
  EventModule,
  PrismaModule],
})
export class AppModule {}
