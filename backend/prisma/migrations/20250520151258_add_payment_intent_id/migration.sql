/*
  Warnings:

  - A unique constraint covering the columns `[paymentIntentId]` on the table `tickets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `paymentIntentId` to the `tickets` table without a default value. This is not possible if the table is not empty.
  - Made the column `user_id` on table `tickets` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_user_id_fkey";

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "paymentIntentId" TEXT NOT NULL,
ALTER COLUMN "user_id" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tickets_paymentIntentId_key" ON "tickets"("paymentIntentId");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
