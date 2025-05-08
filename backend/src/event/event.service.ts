import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, EditEventDto } from './dto';
import { StorageService } from '../infra/storage/storage.interface';

import axios from 'axios';
import { fileTypeFromBuffer } from 'file-type';
import { Prisma } from '@prisma/client';

@Injectable()
export class EventService {
    constructor(
      private readonly prisma: PrismaService,
      private readonly storage: StorageService,
    ) {}

    private async uploadBanner(eventId: number, externalUrl: string): Promise<string> {
      // Download image
      const { data } = await axios.get<ArrayBuffer>(externalUrl, {
        responseType  : 'arraybuffer',
        timeout       : 20_000,
        validateStatus: s => s < 400,
      });
      const buffer = Buffer.from(new Uint8Array(data));
    
      // Sniff mime/ext
      const ft = await fileTypeFromBuffer(buffer);
      if (!ft || !ft.mime.startsWith('image/')) {
        throw new BadRequestException('imageUrl must point to a valid image');
      }
    
      // Upload to S3
      const key = `events/${eventId}/banner.${ft.ext}`;
      await this.storage.put(key, buffer, ft.mime);
    
      return key;
    }
    
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
    
      const key = await this.uploadBanner(event.id, dto.imageUrl);
    
      return this.prisma.event.update({
        where  : { id: event.id },
        data   : { imageUrl: key },
        include: { location: true },
      });
    }
    
    async findAll() {
      const events = await this.prisma.event.findMany({
        include: { location: true, tickets: true },
      });

      await Promise.all(
        events.map(async (e) => {
          if (e.imageUrl) {
            e.imageUrl = await this.storage.getSignedUrl(e.imageUrl, 60 * 15);
          }
        }),
      );
    
      return events;
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
      const exists = await this.prisma.event.findUnique({ where: { id } });
      if (!exists) throw new NotFoundException(`Event #${id} not found`);
    
      // Upload a new banner only if caller sent imageUrl
      let bannerKey: string | undefined;
      if (dto.imageUrl) {
        bannerKey = await this.uploadBanner(id, dto.imageUrl);
      }
    
      const data: Prisma.EventUpdateInput = {
        title       : dto.title,
        description : dto.description,
        date        : dto.date,
        contact     : dto.contact,
        totalTickets: dto.totalTickets,
        ...(bannerKey && { imageUrl: bannerKey }),
        ...(dto.location && { location: { update: dto.location } }),
      };
    
      return this.prisma.event.update({
        where  : { id },
        data,
        include: { location: true },
      });
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
