import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateEventDto, UpdateEventDto, EventQueryDto } from './dto/event.dto';
import { Event, Priority, EventStatus } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEventDto): Promise<Event> {
    return this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        location: dto.location,
        priority: dto.priority || 'medium',
        status: 'pending',
      },
    });
  }

  async findAll(query: EventQueryDto): Promise<Event[]> {
    const where: any = {};

    if (query.date) {
      const date = new Date(query.date);
      where.startDate = {
        gte: date,
        lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
      };
    }

    if (query.from && query.to) {
      where.startDate = {
        gte: new Date(query.from),
        lte: new Date(query.to),
      };
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    return this.prisma.event.findMany({
      where,
      orderBy: { startDate: 'asc' },
    });
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }
    return event;
  }

  async update(id: string, dto: UpdateEventDto): Promise<Event> {
    const data: any = { ...dto };
    
    if (dto.startDate) {
      data.startDate = new Date(dto.startDate);
    }
    if (dto.endDate) {
      data.endDate = new Date(dto.endDate);
    }

    return this.prisma.event.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.event.delete({
      where: { id },
    });
  }

  async findToday(): Promise<Event[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    return this.prisma.event.findMany({
      where: {
        startDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { startDate: 'asc' },
    });
  }

  async findImportant(): Promise<Event[]> {
    return this.prisma.event.findMany({
      where: {
        OR: [
          { priority: 'high' },
          {
            startDate: {
              gte: new Date(),
            },
            status: 'pending',
          },
        ],
      },
      orderBy: [{ priority: 'desc' }, { startDate: 'asc' }],
      take: 10,
    });
  }

  async complete(id: string): Promise<Event> {
    return this.prisma.event.update({
      where: { id },
      data: { status: 'completed' },
    });
  }

  async reschedule(id: string, startDate: string): Promise<Event> {
    return this.prisma.event.update({
      where: { id },
      data: {
        startDate: new Date(startDate),
      },
    });
  }
}
