import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, EditEventDto } from './dto';
import { StorageService } from '../infra/storage/storage.interface';

import axios from 'axios';
import { fileTypeFromBuffer } from 'file-type';

@Injectable()
export class EventService {
    constructor(
      private readonly prisma: PrismaService,
      private readonly storage: StorageService,
    ) {}

    async create(dto: CreateEventDto) {
      if (!dto.imageUrl) {
        throw new BadRequestException('imageUrl must be provided');
      }
  
      const event = await this.prisma.event.create({
        data: {
          title       : dto.title,
          description : dto.description,
          date        : dto.date,
          contact     : dto.contact,
          totalTickets: dto.totalTickets,
          location    : { create: dto.location },
        },
        include: { location: true },
      });
  
      let arrayBuffer: ArrayBuffer;
      try {
        const { data } = await axios.get<ArrayBuffer>(dto.imageUrl, {
          responseType  : 'arraybuffer',
          timeout       : 20_000,
          validateStatus: (s) => s < 400,
        });
        arrayBuffer = data;
      } catch {
        throw new BadRequestException('Unable to download the banner image');
      }
  
      const buffer = Buffer.from(new Uint8Array(arrayBuffer));

      const ft = await fileTypeFromBuffer(buffer);
      if (!ft || !ft.mime.startsWith('image/')) {
        throw new BadRequestException('imageUrl must point to a valid image');
      }
  
      const key = `events/${event.id}/banner.${ft.ext}`;
      await this.storage.put(key, buffer, ft.mime);
  
      const updated = await this.prisma.event.update({
        where  : { id: event.id },
        data   : { imageUrl: key },
        include: { location: true },
      });
  
      return updated;
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
