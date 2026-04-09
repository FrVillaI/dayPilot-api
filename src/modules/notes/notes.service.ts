import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateNoteDto } from './dto/note.dto';
import { Note } from '@prisma/client';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async create(eventId: string, dto: CreateNoteDto): Promise<Note> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with id ${eventId} not found`);
    }

    return this.prisma.note.create({
      data: {
        eventId,
        content: dto.content,
      },
    });
  }

  async findByEvent(eventId: string): Promise<Note[]> {
    return this.prisma.note.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Note> {
    const note = await this.prisma.note.findUnique({
      where: { id },
    });
    if (!note) {
      throw new NotFoundException(`Note with id ${id} not found`);
    }
    return note;
  }

  async update(id: string, content: string): Promise<Note> {
    return this.prisma.note.update({
      where: { id },
      data: { content },
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.note.delete({
      where: { id },
    });
  }
}
