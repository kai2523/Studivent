import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, EditEventDto } from './dto';

@Injectable()
export class EventService {
    constructor(private readonly prisma: PrismaService) {}

    async create(dto: CreateEventDto) {
        return this.prisma.event.create({
          data: {
            title: dto.title,
            description: dto.description,
            date: dto.date,
            contact: dto.contact,
            imageUrl: dto.imageUrl,
            totalTickets: dto.totalTickets,
            location: {
              create: dto.location,
            },
          },
          include: {
            location: true,
          },
        });
      }

    findAll() {
        return this.prisma.event.findMany({
            include: {
            location: true,
            tickets: true,
            },
        });
    }
    
    findOne(id: number) {
        return this.prisma.event.findUnique({
            where: { id },
            include: {
            location: true,
            tickets: true,
            },
        });
    }

    async update(id: number, dto: EditEventDto) {
        try {
          return await this.prisma.event.update({
            where: { id },
            data: {
              title: dto.title,
              description: dto.description,
              date: dto.date,
              contact: dto.contact,
              imageUrl: dto.imageUrl,
              totalTickets: dto.totalTickets,
              ...(dto.location && {
                location: {
                  update: dto.location, // 👈 Apply only if `location` is provided
                },
              }),
            },
            include: {
              location: true,
            },
          });
        } catch (err) {
          console.error(err);
          return null;
        }
    } 

    async remove(id: number) {
        try {
            await this.prisma.event.delete({
            where: { id },
            });
            return true;
        } catch {
            return false;
        }
    }

    async findTicketsForEvent(eventId: number, { page, size }: { page: number; size: number }) {

      const eventExists = await this.prisma.event.findUnique({
        where: { id: eventId },
        select: { id: true },
      });
      if (!eventExists) throw new NotFoundException(`Event #${eventId} not found`);

      return this.prisma.ticket.findMany({
        where: { eventId },
        skip: (page - 1) * size,
        take: size,
        orderBy: { createdAt: 'asc' },
      });
    }
}
