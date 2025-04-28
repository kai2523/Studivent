// src/modules/ticket/ticket.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Ticket } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto';
import { QrCodeService } from '../infra/qr/qr-code.service';
import { PdfTicketService } from '../infra/pdf/pdf-ticket.service';
import { StorageService } from '../infra/storage/storage.interface';

type PublicTicket = Omit<Ticket, 'qrCodePath' | 'pdfPath'>;

@Injectable()
export class TicketService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly qr: QrCodeService,
    private readonly pdf: PdfTicketService,
    private readonly storage: StorageService,
  ) {}

  async create({ ownerEmail, eventId, quantity }: CreateTicketDto) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');

    const freshTickets = await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.event.updateMany({
        where: { id: eventId, totalTickets: { gte: quantity } },
        data:  { totalTickets: { decrement: quantity } },
      });
      if (!count) throw new BadRequestException('Not enough tickets left');

      const promises: Prisma.PrismaPromise<PublicTicket>[] = [];
      for (let i = 0; i < quantity; i++) {
        promises.push(
          tx.ticket.create({
            data: { ownerEmail, eventId },
            select: {
              id: true,
              createdAt: true,
              bookedAt: true,
              ownerEmail: true,
              eventId: true,
            },
          }) as unknown as Prisma.PrismaPromise<PublicTicket>,
        );
      }
      return Promise.all(promises);
    });

    await Promise.all(
      freshTickets.map(async (ticket) => {
        const qrPng = await this.qr.png(`ticket:${ticket.id}`);
        const pdfBytes = await this.pdf.build({
          qr: qrPng,
          eventTitle: event.title,
          eventDate:  event.date,
          ownerEmail,
          ticketId:   ticket.id,
        });

        const dir = `tickets/${ticket.id}`;
        await this.storage.put(`${dir}/qr.png`,     qrPng,  'image/png');
        await this.storage.put(`${dir}/ticket.pdf`, pdfBytes,'application/pdf');

        await this.prisma.ticket.update({
          where: { id: ticket.id },
          data:  { qrCodePath: `${dir}/qr.png`, pdfPath: `${dir}/ticket.pdf` },
        });
      }),
    );

    return { quantity, tickets: freshTickets };
  }

  async findOne(id: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      select: {
        id: true,
        createdAt: true,
        bookedAt: true,
        ownerEmail: true,
        eventId: true,
        event: true,
      },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;                              
  }

  async getPdfPath(id: number, expires = 60 * 60): Promise<string> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      select: { pdfPath: true },
    });

    if (!ticket || ticket.pdfPath === null) {
      throw new NotFoundException('PDF not generated for ticket');
    }

    return ticket.pdfPath;
  }

}
