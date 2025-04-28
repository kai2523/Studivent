import { Injectable, InternalServerErrorException, StreamableFile } from '@nestjs/common';
import { promises as fs } from 'node:fs';
import { join, dirname } from 'node:path';
import { StorageService } from './storage.interface';

@Injectable()
export class LocalStorageService implements StorageService {
  private base = join(process.cwd(), 'storage');

  async put(path: string, data: Uint8Array | Buffer) {
    const full = join(this.base, path);
    await fs.mkdir(dirname(full), { recursive: true });
    await fs.writeFile(full, data);
  }

  async getSignedUrl(path: string) {
    // dev only – just return a relative URL the controller will serve
    return `/assets/${path}`;
  }
  
  async get(path: string) {
    try {
      const bytes = await fs.readFile(join(this.base, path));
      return new StreamableFile(bytes);
    } catch {
      throw new InternalServerErrorException('File not found on disk');
    }
  }
}
