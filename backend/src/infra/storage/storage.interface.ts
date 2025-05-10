export abstract class StorageService {
  abstract put(
    path: string,
    data: Uint8Array | Buffer,
    mime: string,
  ): Promise<void>;

  abstract getSignedUrl(path: string, expires?: number): Promise<string>;

  abstract get(path: string): Promise<Buffer>;

  abstract delete(path: string): Promise<void>;

}
