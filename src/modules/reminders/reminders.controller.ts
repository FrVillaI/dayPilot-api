import { Controller, Get, Post, Body, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { CreateReminderDto } from './dto/reminder.dto';

@Controller('events/:eventId/reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  create(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: CreateReminderDto,
  ) {
    return this.remindersService.create(eventId, dto);
  }

  @Get()
  findAll(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.remindersService.findByEvent(eventId);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.remindersService.remove(id);
  }
}
