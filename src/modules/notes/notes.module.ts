import { Module, forwardRef } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [NotesController],
  providers: [NotesService, PrismaService],
  exports: [NotesService],
})
export class NotesModule {}
