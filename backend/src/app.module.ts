import { Module } from '@nestjs/common';
import { EventModule } from './event/event.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { TicketModule } from './ticket/ticket.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }),
  EventModule,
  PrismaModule,
  TicketModule,],
})
export class AppModule {}
