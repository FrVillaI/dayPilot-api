import { Controller, Get, Post, Body, Param, Delete, Patch, ParseUUIDPipe } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/note.dto';

@Controller('events/:eventId/notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: CreateNoteDto,
  ) {
    return this.notesService.create(eventId, dto);
  }

  @Get()
  findAll(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.notesService.findByEvent(eventId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('content') content: string,
  ) {
    return this.notesService.update(id, content);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.notesService.remove(id);
  }
}
