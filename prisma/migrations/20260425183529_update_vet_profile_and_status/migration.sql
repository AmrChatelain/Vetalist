/*
  Warnings:

  - You are about to drop the column `address` on the `VetProfile` table. All the data in the column will be lost.
  - You are about to drop the column `isApproved` on the `VetProfile` table. All the data in the column will be lost.
  - Added the required column `city` to the `VetProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street` to the `VetProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipCode` to the `VetProfile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VetStatus" AS ENUM ('PENDING_ONBOARDING', 'PENDING_APPROVAL', 'ACTIVE', 'REJECTED');

-- AlterTable
ALTER TABLE "VetProfile" DROP COLUMN "address",
DROP COLUMN "isApproved",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "status" "VetStatus" NOT NULL DEFAULT 'PENDING_ONBOARDING',
ADD COLUMN     "street" TEXT NOT NULL,
ADD COLUMN     "zipCode" TEXT NOT NULL;
