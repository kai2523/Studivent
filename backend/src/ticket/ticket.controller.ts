import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto';

@Controller('tickets')
export class TicketController {
    constructor(private ticketService: TicketService) {}
    
    @Post()
    create(@Body() dto: CreateTicketDto) {
      return this.ticketService.create(dto);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.ticketService.findOne(id);
    }

}

