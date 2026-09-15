-- DropIndex
DROP INDEX "personal_notes_userId_updatedAt_idx";

-- AlterTable
ALTER TABLE "personal_notes" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "personal_notes_userId_sortOrder_idx" ON "personal_notes"("userId", "sortOrder" DESC);
