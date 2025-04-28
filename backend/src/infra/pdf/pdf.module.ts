import { Module } from '@nestjs/common';
import { PdfTicketService } from './pdf-ticket.service';

@Module({
  providers: [PdfTicketService],
  exports:   [PdfTicketService],
})
export class PdfModule {}
