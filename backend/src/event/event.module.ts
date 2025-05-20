import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StorageModule } from 'src/infra/storage/storage.module';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
