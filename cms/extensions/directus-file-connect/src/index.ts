import { defineHook } from '@directus/extensions-sdk';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import probe from 'probe-image-size';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

// Setup __dirname for ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config({
  path: path.resolve(__dirname, '../../../.env'),
});

const region = process.env.STORAGE_S3_REGION;
const accessKeyId = process.env.STORAGE_S3_KEY;
const secretAccessKey = process.env.STORAGE_S3_SECRET;
const bucketName = process.env.STORAGE_S3_BUCKET;

if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
  throw new Error('Missing required S3 environment variables');
}

// Configure S3
const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export default defineHook(({ filter }, { services: ServiceClasses, database, getSchema }) => {
  filter('events.items.read', async (itemsPayload: any[], _meta: any, contextApi: any) => {
    if (!itemsPayload?.[0]) {
      return itemsPayload;
    }

    const currentItem = itemsPayload[0];
    const fileId = currentItem.banner;

    if (!fileId) return itemsPayload;

    try {
      const existingFile = await database('directus_files')
        .select('id', 'filename_disk')
        .where({ id: fileId })
        .first();

      if (!existingFile) {
        const filenameDisk = `${fileId}.jpg`;
        const key = `events/banner/${filenameDisk}`;

        // Fetch from S3
        const command = new GetObjectCommand({
          Bucket: bucketName,
          Key: key,
        });

        const s3Response = await s3.send(command);

        // Extract image metadata
        const result = await probe(s3Response.Body as NodeJS.ReadableStream);

        const filesize = s3Response.ContentLength ?? null;
        const width = result.width;
        const height = result.height;
        const type = result.mime;

        const schema = await getSchema();
        const accountability = contextApi.accountability || null;

        const filesServiceInstance = new ServiceClasses.FilesService({
          knex: database,
          schema,
          accountability,
        });

        await filesServiceInstance.createOne({
          id: fileId,
          filename_disk: filenameDisk,
          filename_download: `event_banner_${fileId}.jpg`,
          title: `Event Banner ${fileId}`,
          type,
          storage: 's3',
          width,
          height,
          filesize,
          uploaded_by: accountability?.user,
        });

        console.log(`Created file ${fileId} with dimensions: ${width}x${height}, size: ${filesize}`);
      }
    } catch (err) {
      console.error('Error creating file:', err);
    }

    return itemsPayload;
  });
});

