import { Module } from '@nestjs/common';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';
import { QrModule } from '../infra/qr/qr.module';
import { PdfModule } from '../infra/pdf/pdf.module';
import { StorageModule } from '../infra/storage/storage.module';

@Module({
  imports: [QrModule, PdfModule, StorageModule],
  controllers: [TicketController],
  providers: [TicketService],
  exports: [TicketService],
})
export class TicketModule {}
