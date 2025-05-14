import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { EventModule } from './event/event.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { TicketModule } from './ticket/ticket.module';
import { ApiKeyGuard } from './auth/api-key.guard';
import { AuthModule } from './auth/auth.module';
import { ShibMiddleware } from './auth/shib.middleware';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [join(__dirname, '..', '..', '.env')],
    }),
    EventModule,
    PrismaModule,
    TicketModule,
    AuthModule,
    HealthModule
  ],
  providers: [ApiKeyGuard],
})

export class AppModule {
    configure(consumer: MiddlewareConsumer) {
      consumer
        .apply(ShibMiddleware)
        .forRoutes({ path: 'auth/login', method: RequestMethod.GET });
  }
}
