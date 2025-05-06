import { Module } from '@nestjs/common';
import { EventModule } from './event/event.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { TicketModule } from './ticket/ticket.module';
import { ApiKeyGuard } from './auth/api-key.guard';


@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: ['.env'],
  }),
  EventModule,
  PrismaModule,
  TicketModule,],
  providers: [ApiKeyGuard]
})
export class AppModule {}
