import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl as presign } from '@aws-sdk/s3-request-presigner';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { StorageService } from './storage.interface';
import { Readable } from 'node:stream';

@Injectable()
export class S3StorageService implements StorageService {
  private client = new S3Client({
    region: process.env.AWS_REGION ?? 'eu-central-1',
    credentials: process.env.AWS_ACCESS_KEY_ID
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        }
      : undefined, // Use EC2 role if keys not present
  });

  private bucket = process.env.AWS_S3_BUCKET!;

  async put(path: string, data: Uint8Array | Buffer, mime: string) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: path,
        Body: data,
        ContentType: mime,
        ACL: 'private',
      }),
    );
  }

  async getSignedUrl(path: string, expires = 900) {
    return presign(this.client, new GetObjectCommand({ Bucket: this.bucket, Key: path }), {
      expiresIn: expires,
    });
  }

  async get(path: string) {
    try {
      const { Body } = await this.client.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: path }),
      );

      const chunks: Uint8Array[] = [];
      for await (const chunk of Body as Readable) {
        const safeChunk = typeof chunk === 'string' ? Buffer.from(chunk) : (chunk as Uint8Array);
        chunks.push(safeChunk);
      }
      return Buffer.concat(chunks);
    } catch {
      throw new InternalServerErrorException('File not found in S3');
    }
  }

  async delete(path: string) {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: path,
        }),
      );
    } catch (err) {
      throw new InternalServerErrorException(`Failed to delete S3 object ${path}: ${err}`);
    }
  }
}
