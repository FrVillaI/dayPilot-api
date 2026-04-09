import { Module, OnModuleInit } from '@nestjs/common';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';
import { PrismaService } from '../../database/prisma.service';
import { ReminderProcessor } from '../../jobs/reminder.processor';

@Module({
  controllers: [RemindersController],
  providers: [RemindersService, PrismaService, ReminderProcessor],
  exports: [RemindersService, ReminderProcessor],
})
export class RemindersModule implements OnModuleInit {
  constructor() {}

  onModuleInit() {}
}
