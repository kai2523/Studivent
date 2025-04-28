import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto';

@Injectable()
export class TicketService {
    constructor(private readonly prisma: PrismaService) {}

    async create({ ownerEmail, eventId, quantity }: CreateTicketDto) {
        
        return this.prisma.$transaction(async (tx) => {

          const { count } = await tx.event.updateMany({
            where: { id: eventId, totalTickets: { gte: quantity } },   
            data : { totalTickets: { decrement: quantity } },
          });
    
          if (!count) {
            const exists = await tx.event.findUnique({ where: { id: eventId } });
            if (!exists) throw new NotFoundException('Event not found');
            throw new BadRequestException('Not enough tickets left');
          }
    
          const tickets = await Promise.all(
            Array.from({ length: quantity }).map(() =>
              tx.ticket.create({ data: { ownerEmail, eventId } }),
            ),
          );
    
          return { quantity, tickets };
        });
    }

    async findOne(id: number) {
        const ticket = await this.prisma.ticket.findUnique({
          where: { id },
          include: { event: true },
        });
        if (!ticket) throw new NotFoundException('Ticket not found');
        
        return ticket;
    }
}
