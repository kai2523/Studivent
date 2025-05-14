import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const bucketName = process.env.STORAGE_S3_BUCKET!;
export const s3 = new S3Client({
  region: process.env.STORAGE_S3_REGION!,
  credentials: {
    accessKeyId: process.env.STORAGE_S3_KEY!,
    secretAccessKey: process.env.STORAGE_S3_SECRET!,
  },
});
