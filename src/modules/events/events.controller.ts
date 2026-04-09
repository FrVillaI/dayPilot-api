import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto, EventQueryDto } from './dto/event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  @Get()
  findAll(@Query() query: EventQueryDto) {
    return this.eventsService.findAll(query);
  }

  @Get('today')
  findToday() {
    return this.eventsService.findToday();
  }

  @Get('important')
  findImportant() {
    return this.eventsService.findImportant();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, dto);
  }

  @Patch(':id/complete')
  complete(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.complete(id);
  }

  @Patch(':id/reschedule')
  reschedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('startDate') startDate: string,
  ) {
    return this.eventsService.reschedule(id, startDate);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.remove(id);
  }
}
