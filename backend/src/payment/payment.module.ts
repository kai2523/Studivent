import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TicketModule } from 'src/ticket/ticket.module';
import { UserModule } from 'src/user/user.module';
import { EventModule } from 'src/event/event.module';

@Module({
  imports: [TicketModule, UserModule, EventModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
