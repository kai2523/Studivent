/*
  Warnings:

  - Added the required column `price_cents` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "events" ADD COLUMN     "price_cents" INTEGER NOT NULL;
