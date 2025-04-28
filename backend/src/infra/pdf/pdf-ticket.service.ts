import { Injectable } from '@nestjs/common';
import { PDFDocument, StandardFonts } from 'pdf-lib';

@Injectable()
export class PdfTicketService {
  async build(opts: {
    qr: Buffer;
    eventTitle: string;
    eventDate: Date;
    ownerEmail: string;
    ticketId: number;
  }): Promise<Uint8Array> {
    const pdf  = await PDFDocument.create();
    const page = pdf.addPage([420, 600]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    page.drawText(opts.eventTitle, { x: 30, y: 560, size: 18, font });
    page.drawText(opts.eventDate.toLocaleString(), { x: 30, y: 540, size: 12, font });
    page.drawText(`Ticket #${opts.ticketId}`, { x: 30, y: 520, size: 12, font });
    page.drawText(opts.ownerEmail, { x: 30, y: 500, size: 12, font });

    const qr = await pdf.embedPng(opts.qr);
    page.drawImage(qr, { x: 110, y: 270, width: 200, height: 200 });

    page.drawText('Show this QR at the gate', { x: 30, y: 230, size: 10, font });
    return pdf.save();
  }
}
