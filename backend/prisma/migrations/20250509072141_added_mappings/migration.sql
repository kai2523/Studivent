/*
  Warnings:

  - You are about to drop the column `createdAt` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `locationId` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `totalTickets` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `bookedAt` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `eventId` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `ownerEmail` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `validatedAt` on the `tickets` table. All the data in the column will be lost.
  - Added the required column `location_id` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_tickets` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `event_id` to the `tickets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner_email` to the `tickets` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_locationId_fkey";

-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_eventId_fkey";

-- DropIndex
DROP INDEX "tickets_eventId_idx";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "createdAt",
DROP COLUMN "imageUrl",
DROP COLUMN "locationId",
DROP COLUMN "totalTickets",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "location_id" INTEGER NOT NULL,
ADD COLUMN     "total_tickets" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "bookedAt",
DROP COLUMN "createdAt",
DROP COLUMN "eventId",
DROP COLUMN "ownerEmail",
DROP COLUMN "validatedAt",
ADD COLUMN     "booked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "event_id" INTEGER NOT NULL,
ADD COLUMN     "owner_email" TEXT NOT NULL,
ADD COLUMN     "validated_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "tickets_event_id_idx" ON "tickets"("event_id");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
