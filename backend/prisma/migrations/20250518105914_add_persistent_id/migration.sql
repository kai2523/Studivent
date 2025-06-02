/*
  Warnings:

  - A unique constraint covering the columns `[persistent_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `persistent_id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "users_email_key";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "persistent_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_persistent_id_key" ON "users"("persistent_id");
