import { defineHook } from '@directus/extensions-sdk';
import { ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3, bucketName } from './s3-config';

export default defineHook(({ filter }) => {
  // Create hook
  filter('items.create', async (payload: any, meta: any, { database }) => {
    if (meta.collection === 'events') {
      const fileId = payload.banner;
      if (fileId) {
        const file = await database('directus_files')
          .select('filename_disk')
          .where({ id: fileId })
          .first();

        if (file?.filename_disk) {
          const s3Url = `events/banner/${file.filename_disk}`;
          payload.image_url = s3Url;
        }
      }
    }
    return payload;
  });

  // Update hook
  filter('items.update', async (payload: any, meta: any, { database }) => {
    if (meta.collection === 'events') {
      const rawBanner = payload.banner;
      const fileId = typeof rawBanner === 'object' && rawBanner?.id
        ? rawBanner.id
        : rawBanner;

      if (fileId) {
        const file = await database('directus_files')
          .select('filename_disk')
          .where({ id: fileId })
          .first();

        if (file?.filename_disk) {
          const s3Url = `events/banner/${file.filename_disk}`;
          payload.image_url = s3Url;
        }
      }
    }
    return payload;
  });

  // Delete hook
  filter('items.delete', async (payload: any, meta: any, { database }) => {
    if (meta.collection !== 'events') return payload;

    for (const id of payload) {
      const event = await database('events').select('banner').where({ id }).first();

      if (event?.banner) {
        const bannerId = event.banner;

        // Delete all S3 files starting with banner ID
        const listed = await s3.send(
          new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: 'events/banner/',
          })
        );

        const toDelete = (listed.Contents ?? []).filter(
          (obj) => obj.Key?.includes(bannerId)
        );

        for (const file of toDelete) {
          if (!file.Key) continue;
          await s3.send(
            new DeleteObjectCommand({
              Bucket: bucketName,
              Key: file.Key,
            })
          );
          console.log(`🗑️ Deleted from S3: ${file.Key}`);
        }

        // Delete from Directus file library
        await database('directus_files').where({ id: bannerId }).del();
        console.log(`🗑️ Deleted directus_files row: ${bannerId}`);
      }
    }

    return payload;
  });
});
