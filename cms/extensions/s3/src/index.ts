import { defineHook } from '@directus/extensions-sdk';

export default defineHook(({ filter }) => {
  filter(
    'items.create',
    /**
     * @param payload  The incoming Event data (before INSERT)
     * @param meta     { collection } tells us which collection (events/directus_files/etc.)
     * @param services An object containing the Knex `database` client
     */
    async (payload: any, meta: any, { database }) => {
      // Only act on Event creates
      if (meta.collection === 'events') {
        const fileId = payload.banner;
        if (fileId) {
          // 1) Look up the file record to get its disk filename (the S3 key)
          const file = await database('directus_files')
            .select('filename_disk')
            .where({ id: fileId })
            .first();

          if (file && file.filename_disk) {
            // 2) Build your S3 URL
            const s3Url = `events/banner/${file.filename_disk}`;

            // 3) Inject into your payload so it gets saved in image_url
            payload.image_url = s3Url;
          }
        }
      }

      return payload;
    }
  );
});
