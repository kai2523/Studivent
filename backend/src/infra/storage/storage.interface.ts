import { StreamableFile } from '@nestjs/common';

export abstract class StorageService {
  /** Store a binary blob. */
  abstract put(
    path: string,
    data: Uint8Array | Buffer,
    mime: string,
  ): Promise<void>;

  /** Return a signed/temporary URL (S3, CloudFront, etc.). */
  abstract getSignedUrl(path: string, expires?: number): Promise<string>;

  /** Return the file bytes wrapped in StreamableFile (used in local dev). */
  abstract get(path: string): Promise<StreamableFile>;
}
