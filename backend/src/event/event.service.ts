import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, EditEventDto } from './dto';
import { StorageService } from '../infra/storage/storage.interface';

import axios from 'axios';
import { fileTypeFromBuffer } from 'file-type';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';

@Injectable()
export class EventService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  private async uploadBanner(
    eventId: number,
    externalUrl: string,
  ): Promise<{ uuid: string; key: string }> {
    // Download image
    const { data } = await axios.get<ArrayBuffer>(externalUrl, {
      responseType: 'arraybuffer',
      timeout: 20_000,
      validateStatus: (s) => s < 400,
    });
    const buffer = Buffer.from(new Uint8Array(data));

    // Sniff mime/ext
    const ft = await fileTypeFromBuffer(buffer);
    if (!ft || !ft.mime.startsWith('image/')) {
      throw new BadRequestException('imageUrl must point to a valid image');
    }

    // Generate a UUID for the filename
    const fileId = uuidv4();
    const filename = `${fileId}.${ft.ext}`;

    // Upload to S3
    const key = `events/banner/${filename}`;
    await this.storage.put(key, buffer, ft.mime);

    return { uuid: fileId, key };
  }

  async create(dto: CreateEventDto) {
    if (!dto.imageUrl) {
      throw new BadRequestException('imageUrl must be provided');
    }

    const event = await this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        date: dto.date,
        contact: dto.contact,
        totalTickets: dto.totalTickets,
        priceCents: dto.priceCents,

        location: {
          connectOrCreate: {
            where: {
              name_address_city_country: {
                name: dto.location.name,
                address: dto.location.address,
                city: dto.location.city,
                country: dto.location.country,
              },
            },
            create: dto.location,
          },
        },
      },
      include: { location: true },
    });

    const { uuid: bannerUuid, key: imagePath } = await this.uploadBanner(
      event.id,
      dto.imageUrl,
    );

    return this.prisma.event.update({
      where: { id: event.id },
      data: { imageUrl: imagePath, banner: bannerUuid },
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        contact: true,
        totalTickets: true,
        priceCents: true,
        location: true,
      },
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

    let bannerUuid: string | undefined;
    let imagePath: string | undefined;

    // Upload a new banner only if caller sent imageUrl
    if (dto.imageUrl) {
      const oldPath = exists.imageUrl;

      const result = await this.uploadBanner(id, dto.imageUrl);
      bannerUuid = result.uuid;
      imagePath = result.key;

      if (oldPath) {
        try {
          await this.storage.delete(oldPath);
        } catch (err) {
          // log or ignore—the old file might already be gone
          console.warn(`Failed to delete old banner at ${oldPath}`, err);
        }
      }
    }

    const data: Prisma.EventUpdateInput = {
      title: dto.title,
      description: dto.description,
      date: dto.date,
      contact: dto.contact,
      totalTickets: dto.totalTickets,
    };

    if (bannerUuid) data.banner = bannerUuid;
    if (imagePath) data.imageUrl = imagePath;

    if (
      dto.location?.name &&
      dto.location.address &&
      dto.location.city &&
      dto.location.country
    ) {
      const { name, address, city, country, latitude, longitude } =
        dto.location;

      Object.assign(data, {
        location: {
          connectOrCreate: {
            where: {
              name_address_city_country: { name, address, city, country },
            },
            create: { name, address, city, country, latitude, longitude },
          },
        },
      });
    }

    return this.prisma.event.update({
      where: { id },
      data,
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        contact: true,
        totalTickets: true,
        priceCents: true,
        imageUrl: true,
        location: true,
      },
    });
  }

  async remove(id: number): Promise<boolean> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: {
        imageUrl: true,
        tickets: {
          select: {
            id: true,
            qrCodePath: true,
            pdfPath: true,
          },
        },
      },
    });

    if (!event) return false;

    try {
      // Delete the banner from S3
      if (event.imageUrl) {
        await this.storage.delete(event.imageUrl);
      }

      // Delete all ticket files (if any)
      for (const ticket of event.tickets) {
        const paths = [ticket.qrCodePath, ticket.pdfPath].filter(Boolean);
        for (const path of paths) {
          if (typeof path === 'string') {
            await this.storage.delete(path);
          }
        }
      }

      // Delete the Event
      await this.prisma.event.delete({ where: { id } });

      return true;
    } catch (error) {
        console.warn('Error during event deletion:', error);
      return false;
    }
  }

  async findTicketsForEvent(
    eventId: number,
    { page, size }: { page: number; size: number },
  ) {
    const eventExists = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });
    if (!eventExists)
      throw new NotFoundException(`Event #${eventId} not found`);

    return this.prisma.ticket.findMany({
      where: { eventId },
      skip: (page - 1) * size,
      take: size,
      orderBy: { createdAt: 'asc' },
    });
  }
}
