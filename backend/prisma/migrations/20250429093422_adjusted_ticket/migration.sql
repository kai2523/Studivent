/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `tickets` will be added. If there are existing duplicate values, this will fail.
  - The required column `code` was added to the `tickets` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "validatedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "tickets_code_key" ON "tickets"("code");
