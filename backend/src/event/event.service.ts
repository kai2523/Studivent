import { Injectable } from '@nestjs/common';
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
}
