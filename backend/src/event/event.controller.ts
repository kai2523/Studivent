import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { EventService } from './event.service';
import { CreateEventDto, EditEventDto } from './dto';
import { SessionGuard } from '../auth/auth.guard';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiCookieAuth,
} from '@nestjs/swagger';

@ApiCookieAuth('connect.sid')
@ApiTags('Events')
@UseGuards(SessionGuard)
@Controller('events')
export class EventController {
  constructor(private eventService: EventService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiBody({ type: CreateEventDto })
  @ApiResponse({
    status: 201,
    description: 'Event created successfully',
    schema: {
      example: {
        id: 1,
        title: 'Semester opening party',
        description: 'Semester opening party.',
        date: '2025-09-15T09:00:00.000Z',
        contact: 'organizer@example.com',
        totalTickets: 150,
        priceCents: 1000,
        location: {
          id: 1,
          name: 'Mobilat',
          address: 'Salzstraße 27',
          city: 'Heilbronn',
          country: 'Germany',
          latitude: 49.153017,
          longitude: 9.218763,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error: Some fields are invalid or missing',
    schema: {
      example: {
        message: ['title should not be empty', 'title must be a string'],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: User has to be logged in',
    schema: {
      example: {
        statusCode: 403,
        message: 'User has to be logged in',
        error: 'Forbidden',
      },
    },
  })
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events' })
  @ApiResponse({
    status: 200,
    description: 'List of events',
    schema: {
      example: [
        {
          id: 1,
          createdAt: '2025-05-20T17:55:26.233Z',
          updatedAt: '2025-05-24T08:48:34.181Z',
          title: 'Semester opening party',
          description: 'Semester opening party.',
          date: '2025-09-15T09:00:00.000Z',
          contact: 'organizer@example.com',
          imageUrl: 'https://cdn.example.com/events/banner.jpg',
          totalTickets: 150,
          priceCents: 1000,
          banner: 'bcda5054-9424-4596-bccd-33216cf5a5b5',
          locationId: 1,
          location: {
            id: 1,
            name: 'Mobilat',
            address: 'Salzstraße 27',
            city: 'Heilbronn',
            country: 'Germany',
            latitude: 49.153017,
            longitude: 9.218763,
          },
          tickets: [],
        },
      ],
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: User has to be logged in',
    schema: {
      example: {
        statusCode: 403,
        message: 'User has to be logged in',
        error: 'Forbidden',
      },
    },
  })
  findAll(@Req() req: Request) {
    const userId = req.session?.user?.userId;

    if (!userId) {
      throw new ForbiddenException('User not logged in');
    }

    return this.eventService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single event by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Event ID' })
  @ApiResponse({
    status: 200,
    description: 'Event details',
    schema: {
      example: {
        id: 1,
        createdAt: '2025-05-20T17:55:26.233Z',
        updatedAt: '2025-05-24T08:48:34.181Z',
        title: 'Semester opening party',
        description: 'Semester opening party.',
        date: '2025-09-15T09:00:00.000Z',
        contact: 'organizer@example.com',
        imageUrl: 'https://cdn.example.com/events/banner.jpg',
        totalTickets: 150,
        priceCents: 1000,
        locationId: 1,
        location: {
          id: 1,
          name: 'Mobilat',
          address: 'Salzstraße 27',
          city: 'Heilbronn',
          country: 'Germany',
          latitude: 49.153017,
          longitude: 9.218763,
        },
        tickets: [],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid event ID',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed (numeric string is expected)',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: User has to be logged in',
    schema: {
      example: {
        statusCode: 403,
        message: 'User has to be logged in',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Event #123 not found',
        error: 'Not Found',
      },
    },
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const event = await this.eventService.findOne(id);
    if (!event) {
      throw new NotFoundException(`Event #${id} not found`);
    }
    return event;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an event' })
  @ApiParam({ name: 'id', type: Number, description: 'Event ID' })
  @ApiBody({ type: EditEventDto })
  @ApiResponse({
    status: 200,
    description: 'Event updated successfully',
    schema: {
      example: {
        id: 1,
        title: 'Updated event title',
        description: 'Updated event description',
        date: '2025-09-15T09:00:00.000Z',
        contact: 'organizer@example.com',
        imageUrl: 'https://cdn.example.com/events/banner.jpg',
        totalTickets: 150,
        priceCents: 1000,
        location: {
          id: 1,
          name: 'Updated Location',
          address: 'New address',
          city: 'Heilbronn',
          country: 'Germany',
          latitude: 49.153017,
          longitude: 9.218763,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
    schema: {
      example: {
        statusCode: 400,
        message: ['title must be a string', 'date must be a valid ISO8601 date string'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: User has to be logged in',
    schema: {
      example: {
        statusCode: 403,
        message: 'User has to be logged in',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Event #123 not found',
        error: 'Not Found',
      },
    },
  })
  async update(@Param('id', ParseIntPipe) id: number, @Body() editEventDto: EditEventDto) {
    const updated = await this.eventService.update(id, editEventDto);
    if (!updated) {
      throw new NotFoundException(`Event #${id} not found`);
    }
    return updated;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an event' })
  @ApiParam({ name: 'id', type: Number, description: 'Event ID' })
  @ApiResponse({
    status: 200,
    description: 'Event deleted successfully',
    schema: {
      example: {
        message: 'Event deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed (numeric string is expected)',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: User has to be logged in',
    schema: {
      example: {
        statusCode: 403,
        message: 'User has to be logged in',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Event #123 not found',
        error: 'Not Found',
      },
    },
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.eventService.remove(id);
    if (!deleted) {
      throw new NotFoundException(`Event #${id} not found`);
    }
    return { message: 'Event deleted successfully' };
  }

  @Get(':id/tickets')
  @ApiOperation({ summary: 'Get tickets for an event' })
  @ApiParam({ name: 'id', type: Number, description: 'Event ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'size',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 25)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of tickets for the event',
    schema: {
      example: [
        {
          id: 1,
          createdAt: '2025-05-20T18:07:12.650Z',
          ownerEmail: 'max.mustermann@example.com',
          bookedAt: '2025-05-20T18:07:12.650Z',
          qrCodePath: 'tickets/1/qr.png',
          pdfPath: 'tickets/1/ticket.pdf',
          eventId: 1,
          userId: 1,
          paymentIntentId: 'pi_3RQuZ6GHYQwFXMHi06fAoiah',
          code: 'eabb31f0-ec34-42e2-a9b6-990038905f11',
          validatedAt: null,
        },
        {
          id: 2,
          createdAt: '2025-05-21T18:09:13.450Z',
          ownerEmail: 'max.mustermann@example.com',
          bookedAt: '2025-05-21T18:09:13.450Z',
          qrCodePath: 'tickets/2/qr.png',
          pdfPath: 'tickets/2/ticket.pdf',
          eventId: 1,
          userId: 2,
          paymentIntentId: 'pi_312uZ6GHYQwFXMHi06fAoiah',
          code: 'eabb31f0-ec34-4212-a9b6-990038905f11',
          validatedAt: null,
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid event ID or query parameters',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed (numeric string is expected)',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: User has to be logged in',
    schema: {
      example: {
        statusCode: 403,
        message: 'User has to be logged in',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Event #123 not found',
        error: 'Not Found',
      },
    },
  })
  async listTickets(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page = 1,
    @Query('size') size = 25,
  ) {
    return this.eventService.findTicketsForEvent(id, { page, size });
  }
}
