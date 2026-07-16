/*
  Warnings:

  - You are about to drop the column `refresh_token` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token_expires_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `reset_token` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "refresh_token",
DROP COLUMN "refresh_token_expires_at",
DROP COLUMN "reset_token",
ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "refresh_token_hash" TEXT,
ADD COLUMN     "reset_token_hash" TEXT,
ADD COLUMN     "verification_token_expires_at" TIMESTAMP(3),
ADD COLUMN     "verification_token_hash" TEXT;

-- Los usuarios existentes se consideran verificados (predatan la verificación de email).
UPDATE "users" SET "email_verified" = true;
