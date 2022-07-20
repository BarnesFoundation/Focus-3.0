/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.
  - Made the column `session_id` on table `bookmarks` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "albums" ALTER COLUMN "session_id" SET DATA TYPE VARCHAR;

-- AlterTable
ALTER TABLE "bookmarks" ALTER COLUMN "session_id" SET NOT NULL,
ALTER COLUMN "session_id" SET DATA TYPE VARCHAR;

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_un" ON "subscriptions"("email");
