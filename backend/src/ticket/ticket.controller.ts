import { Body, Controller, Get, Param, ParseIntPipe, Post, Res, StreamableFile } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto';
import { Response } from 'express';
import { StorageService } from '../infra/storage/storage.interface';

@Controller('tickets')
export class TicketController {
    constructor(
      private ticketService: TicketService,
      private readonly storage: StorageService,
    ) {}
    
    @Post()
    create(@Body() dto: CreateTicketDto) {
      return this.ticketService.create(dto);
    }

    @Get(':id/pdf')
    async pdf(
      @Param('id', ParseIntPipe) id: number,
      @Res({ passthrough: true }) res: Response,
    ): Promise<StreamableFile> {
      const path = await this.ticketService.getPdfPath(id);
  
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="ticket-${id}.pdf"`,
      });
  
      return this.storage.get(path);    
    }
  

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.ticketService.findOne(id);
    }


}

