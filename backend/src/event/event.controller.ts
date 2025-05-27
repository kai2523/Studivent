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
//import { SessionGuard } from '../auth/auth.guard';
import { ApiKeyGuard } from 'src/auth/api-key.guard';

@UseGuards(ApiKeyGuard)
@Controller('events')
export class EventController {
  constructor(private eventService: EventService) {}

  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
  }

  @Get()
  findAll(@Req() req: Request) {
    const userId = req.session?.user?.userId;
    if (!userId) {
      throw new ForbiddenException('User not logged in');
    }

    return this.eventService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const event = await this.eventService.findOne(id);
    if (!event) {
      throw new NotFoundException(`Event #${id} not found`);
    }
    return event;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() editEventDto: EditEventDto,
  ) {
    const updated = await this.eventService.update(id, editEventDto);
    if (!updated) {
      throw new NotFoundException(`Event #${id} not found`);
    }
    return updated;
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.eventService.remove(id);
    if (!deleted) {
      throw new NotFoundException(`Event #${id} not found`);
    }
    return { message: 'Event deleted successfully' };
  }

  @Get(':id/tickets')
  async listTickets(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page = 1,
    @Query('size') size = 25,
  ) {
    return this.eventService.findTicketsForEvent(id, { page, size });
  }
}
