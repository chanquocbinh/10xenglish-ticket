-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('DOCUMENT', 'TODO', 'KANBAN');

-- CreateTable
CREATE TABLE "personal_notes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "NoteType" NOT NULL DEFAULT 'DOCUMENT',
    "encryptedContent" TEXT NOT NULL,
    "iv" VARCHAR(64) NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personal_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "personal_notes_userId_updatedAt_idx" ON "personal_notes"("userId", "updatedAt" DESC);

-- AddForeignKey
ALTER TABLE "personal_notes" ADD CONSTRAINT "personal_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
