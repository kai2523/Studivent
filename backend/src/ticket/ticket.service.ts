import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Ticket, Event } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
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

  private async issueTickets(
    tx: Prisma.TransactionClient,
    params: {
      userId: number;
      event: Event;
      ownerEmail: string;
      quantity: number;
      paymentIntentId: string;
    },
  ): Promise<PublicTicket[]> {
    const { userId, event, ownerEmail, quantity, paymentIntentId } = params;

    // Stock check & decrement
    const { count } = await tx.event.updateMany({
      where: { id: event.id, totalTickets: { gte: quantity } },
      data: { totalTickets: { decrement: quantity } },
    });
    if (!count) throw new BadRequestException('Not enough tickets left');

    // Create ticket rows
    const tickets: PublicTicket[] = await Promise.all(
      Array.from({ length: quantity }).map(
        () =>
          tx.ticket.create({
            data: {
              ownerEmail,
              eventId: event.id,
              userId,
              paymentIntentId,
            },
            select: {
              id: true,
              code: true,
              createdAt: true,
              bookedAt: true,
              ownerEmail: true,
              eventId: true,
            },
          }) as unknown as Prisma.PrismaPromise<PublicTicket>,
      ),
    );

    // Artefacts
    await Promise.all(
      tickets.map(async (t) => {
        const qrPng = await this.qr.png(t.code);
        const pdfBytes = await this.pdf.build({
          qr: qrPng,
          eventTitle: event.title,
          eventDate: event.date,
          ownerEmail,
          ticketId: t.id,
        });

        const dir = `tickets/${t.id}`;
        await this.storage.put(`${dir}/qr.png`, qrPng, 'image/png');
        await this.storage.put(`${dir}/ticket.pdf`, pdfBytes, 'application/pdf');

        await tx.ticket.update({
          where: { id: t.id },
          data: { qrCodePath: `${dir}/qr.png`, pdfPath: `${dir}/ticket.pdf` },
        });
      }),
    );

    return tickets;
  }

  async createFromStripe(data: {
    userId: number;
    eventId: number;
    ownerEmail: string;
    paymentIntentId: string;
    quantity: number;
  }) {
    const { userId, eventId, ownerEmail, paymentIntentId, quantity } = data;

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) throw new NotFoundException('Event not found');

    const tickets = await this.prisma.$transaction((tx) =>
      this.issueTickets(tx, {
        userId,
        event,
        ownerEmail,
        quantity,
        paymentIntentId,
      }),
    );

    return { quantity, tickets };
  }

  async findTicketsByPaymentIntent(paymentIntentId: string) {
    return this.prisma.ticket.findMany({ where: { paymentIntentId } });
  }

  async getPdfPath(ticketId: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { pdfPath: true },
    });
    if (!ticket || !ticket.pdfPath) throw new NotFoundException('PDF not available');
    return ticket.pdfPath;
  }

  async findOne(id: number) {
    return this.prisma.ticket.findUnique({
      where: { id },
      include: { event: true },
    });
  }

  async getTicketsForUser(userId: number) {
    return this.prisma.ticket.findMany({
      where: { userId },
      include: { event: true },
    });
  }

  async validate(code: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { code } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (ticket.validatedAt) throw new BadRequestException('Ticket has already been validated');

    await this.prisma.ticket.update({
      where: { id: ticket.id },
      data: { validatedAt: new Date() },
    });

    return { valid: true };
  }
}
