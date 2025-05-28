import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { EventModule } from './event/event.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { TicketModule } from './ticket/ticket.module';
import { AuthModule } from './auth/auth.module';
import { ShibMiddleware } from './auth/shib.middleware';
import { HealthModule } from './health/health.module';
import { UserModule } from './user/user.module';
import { PaymentModule } from './payment/payment.module';
import { SessionGuard } from './auth/auth.guard';

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
    HealthModule,
    UserModule,
    PaymentModule,
  ],
  providers: [SessionGuard],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ShibMiddleware).forRoutes({ path: 'auth/login', method: RequestMethod.GET });
  }
}
