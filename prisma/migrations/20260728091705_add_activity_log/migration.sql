-- CreateEnum
CREATE TYPE "Entity" AS ENUM ('KEGIATAN', 'DOKUMEN', 'PETUGAS', 'LEADING_SECTOR', 'USER');

-- CreateEnum
CREATE TYPE "ActionLog" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateTable
CREATE TABLE "activity_log" (
    "id" TEXT NOT NULL,
    "entity" "Entity" NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" "ActionLog" NOT NULL,
    "userId" TEXT NOT NULL,
    "changes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_log_entity_idx" ON "activity_log"("entity");

-- CreateIndex
CREATE INDEX "activity_log_entityId_idx" ON "activity_log"("entityId");

-- CreateIndex
CREATE INDEX "activity_log_userId_idx" ON "activity_log"("userId");

-- CreateIndex
CREATE INDEX "activity_log_createdAt_idx" ON "activity_log"("createdAt");

-- AddForeignKey
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
