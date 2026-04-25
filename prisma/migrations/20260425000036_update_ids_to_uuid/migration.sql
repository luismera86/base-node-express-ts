/*
  Warnings:

  - The primary key for the `Test` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `deleteAt` on the `Test` table. All the data in the column will be lost.
  - The primary key for the `Test2` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `deleteAt` on the `Test2` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Test" DROP CONSTRAINT "Test_pkey",
DROP COLUMN "deleteAt",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Test_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Test_id_seq";

-- AlterTable
ALTER TABLE "Test2" DROP CONSTRAINT "Test2_pkey",
DROP COLUMN "deleteAt",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Test2_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Test2_id_seq";
