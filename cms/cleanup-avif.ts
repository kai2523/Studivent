import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

// Read from .env
const BUCKET = process.env.STORAGE_S3_BUCKET!;
const REGION = process.env.STORAGE_S3_REGION!;
const ACCESS_KEY = process.env.STORAGE_S3_KEY!;
const SECRET_KEY = process.env.STORAGE_S3_SECRET!;
const PREFIX = 'events/banner/';

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
});

async function deleteAvifFiles() {
  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: PREFIX,
    });

    const listed = await s3.send(listCommand);
    const contents = listed.Contents ?? [];

    const avifFiles = contents.filter(obj => obj.Key?.endsWith('.avif'));

    if (avifFiles.length === 0) {
      console.log('✅ No .avif files found.');
      return;
    }

    for (const file of avifFiles) {
      if (!file.Key) continue;
      await s3.send(
        new DeleteObjectCommand({
          Bucket: BUCKET,
          Key: file.Key,
        })
      );
      console.log(`🗑️ Deleted: ${file.Key}`);
    }

    console.log(`✅ Cleanup complete. Deleted ${avifFiles.length} .avif files.`);
  } catch (err) {
    console.error('❌ Error during cleanup:', err);
  }
}

deleteAvifFiles();
