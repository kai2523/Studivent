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
import { ApiKeyGuard } from 'src/auth/api-key.guard';

@UseGuards(ApiKeyGuard)
@Controller('tickets')
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
    private readonly storage: StorageService,
  ) {}

  @Post()
  create() {
    throw new ForbiddenException('Direct ticket creation is not allowed. Use the payment process.');
  }

  @Get(':id/pdf')
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
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketService.findOne(id);
  }

  @Get('/mine')
  getMyTickets(@Req() req: Request) {
    if (!req.session?.user) {
      throw new ForbiddenException('User not logged in');
    }
    const userId = req.session.user.userId;

    return this.ticketService.getTicketsForUser(userId);
  }

  @Post('validate')
  validate(@Body() dto: ValidateTicketDto) {
    return this.ticketService.validate(dto.code);
  }
}
