import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './database/prisma.service';
import { EventsModule } from './modules/events/events.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { NotesModule } from './modules/notes/notes.module';
import { AuthModule } from './modules/auth/auth.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventsModule,
    RemindersModule,
    NotesModule,
    AuthModule,
    AiModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
