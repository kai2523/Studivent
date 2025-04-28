import { Module } from '@nestjs/common';
import { StorageService } from './storage.interface';
import { LocalStorageService } from './local-storage.service';

@Module({
  providers: [{ provide: StorageService, useClass: LocalStorageService }],
  exports:   [StorageService],
})
export class StorageModule {}
