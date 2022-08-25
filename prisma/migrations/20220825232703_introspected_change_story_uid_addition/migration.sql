/*
  Warnings:

  - A unique constraint covering the columns `[story_uid]` on the table `stories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `story_uid` to the `stories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "stories" ADD COLUMN     "story_uid" VARCHAR NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "stories_un" ON "stories"("story_uid");
