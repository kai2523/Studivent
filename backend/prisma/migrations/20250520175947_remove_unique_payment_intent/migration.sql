/*
  Warnings:

  - You are about to drop the column `paymentIntentId` on the `tickets` table. All the data in the column will be lost.
  - Added the required column `payment_intent_id` to the `tickets` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "tickets_paymentIntentId_key";

-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "paymentIntentId",
ADD COLUMN     "payment_intent_id" TEXT NOT NULL;
