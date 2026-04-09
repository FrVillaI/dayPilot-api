import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateReminderDto } from './dto/reminder.dto';
import { Reminder, Prisma } from '@prisma/client';

@Injectable()
export class RemindersService {
  constructor(private prisma: PrismaService) {}

  async create(eventId: string, dto: CreateReminderDto): Promise<Reminder> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with id ${eventId} not found`);
    }

    return this.prisma.reminder.create({
      data: {
        eventId,
        minutesBefore: dto.minutesBefore,
      },
    });
  }

  async findByEvent(eventId: string): Promise<Reminder[]> {
    return this.prisma.reminder.findMany({
      where: { eventId },
      orderBy: { minutesBefore: 'asc' },
    });
  }

  async findOne(id: string): Promise<Reminder> {
    const reminder = await this.prisma.reminder.findUnique({
      where: { id },
    });
    if (!reminder) {
      throw new NotFoundException(`Reminder with id ${id} not found`);
    }
    return reminder;
  }

  async remove(id: string): Promise<void> {
    await this.prisma.reminder.delete({
      where: { id },
    });
  }

  async markAsSent(id: string): Promise<Reminder> {
    return this.prisma.reminder.update({
      where: { id },
      data: { sent: true },
    });
  }
}
