import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { ValidateTicketDto } from './dto';
import { Request, Response } from 'express';
import { StorageService } from '../infra/storage/storage.interface';
import { SessionGuard } from '../auth/auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiCookieAuth,
} from '@nestjs/swagger';

@ApiCookieAuth('connect.sid')
@ApiTags('Tickets')
@UseGuards(SessionGuard)
@Controller('tickets')
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
    private readonly storage: StorageService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Direct ticket creation is not allowed (use payment process)',
  })
  @ApiResponse({
    status: 403,
    description: 'Direct ticket creation forbidden',
    schema: {
      example: {
        statusCode: 403,
        message: 'Direct ticket creation is not allowed. Use the payment process.',
        error: 'Forbidden',
      },
    },
  })
  create() {
    throw new ForbiddenException('Direct ticket creation is not allowed. Use the payment process.');
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Download the PDF ticket' })
  @ApiParam({ name: 'id', type: Number, description: 'Ticket ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the PDF ticket file',
    content: { 'application/pdf': {} },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: ID must be a number',
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
    description: 'Not Found: Ticket or PDF does not exist',
    schema: {
      example: {
        statusCode: 404,
        message: 'Ticket or its PDF file not found',
        error: 'Not Found',
      },
    },
  })
  async pdf(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const path = await this.ticketService.getPdfPath(id);
    const fileBuffer = await this.storage.get(path);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="ticket-${id}.pdf"`,
    });

    return new StreamableFile(fileBuffer);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a ticket by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Ticket ID' })
  @ApiResponse({
    status: 200,
    description: 'Ticket details',
    schema: {
      example: {
        id: 1,
        createdAt: '2025-05-20T18:07:12.650Z',
        ownerEmail: 'max.mustermann@example.com',
        bookedAt: '2025-05-20T18:07:12.650Z',
        qrCodePath: 'tickets/3/qr.png',
        pdfPath: 'tickets/3/ticket.pd',
        eventId: 1,
        userId: 1,
        paymentIntentId: 'pi_3RQuZ6GHYQwFXMHi06fAoitr',
        code: 'eabb31f0-ec34-42e2-a9b6-990038905f11',
        validatedAt: null,
        event: {
          id: 1,
          createdAt: '2025-05-20T17:55:26.233Z',
          updatedAt: '2025-05-24T08:48:34.181Z',
          title: 'Semester opening party',
          description: 'Semester opening party.',
          date: '2025-09-15T09:00:00.000Z',
          contact: 'organizer@example.com',
          imageUrl: 'https://cdn.example.com/events/banner.jpg',
          banner: 'bcda5054-9424-4596-bccd-33216cf5a5b5',
          totalTickets: 150,
          priceCents: 1000,
          locationId: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: ID must be a number',
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
    description: 'Not Found: Ticket does not exist',
    schema: {
      example: {
        statusCode: 404,
        message: 'Ticket #123 not found',
        error: 'Not Found',
      },
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketService.findOne(id);
  }

  @Get('/mine')
  @ApiOperation({ summary: 'Get all tickets booked by the logged-in user' })
  @ApiResponse({
    status: 200,
    description: 'List of tickets for the logged-in user, including event information',
    schema: {
      example: [
        {
          id: 1,
          createdAt: '2025-05-20T18:07:12.650Z',
          ownerEmail: 'max.mustermann@example.com',
          bookedAt: '2025-05-20T18:07:12.650Z',
          qrCodePath: 'tickets/3/qr.png',
          pdfPath: 'tickets/3/ticket.pd',
          eventId: 1,
          userId: 1,
          paymentIntentId: 'pi_3RQuZ6GHYQwFXMHi06fAoitr',
          code: 'eabb31f0-ec34-42e2-a9b6-990038905f11',
          validatedAt: null,
          event: {
            id: 1,
            createdAt: '2025-05-20T17:55:26.233Z',
            updatedAt: '2025-05-24T08:48:34.181Z',
            title: 'Semester opening party',
            description: 'Semester opening party description.',
            date: '2025-09-15T09:00:00.000Z',
            contact: 'organizer@example.com',
            imageUrl: 'https://cdn.example.com/events/banner.jpg',
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
          },
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
  getMyTickets(@Req() req: Request) {
    if (!req.session?.user) {
      throw new ForbiddenException('User not logged in');
    }
    const userId = req.session.user.userId;

    return this.ticketService.getTicketsForUser(userId);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate a ticket' })
  @ApiBody({ type: ValidateTicketDto })
  @ApiResponse({
    status: 201,
    description: 'Ticket validated successfully',
    schema: {
      example: {
        valid: true,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: Ticket has already been validated',
    schema: {
      example: {
        valid: false,
        message: 'Already validated',
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
    description: 'Not Found: Ticket does not exist',
    schema: {
      example: {
        statusCode: 404,
        message: 'Ticket not found',
        error: 'Not Found',
      },
    },
  })
  validate(@Body() dto: ValidateTicketDto) {
    return this.ticketService.validate(dto.code);
  }
}
