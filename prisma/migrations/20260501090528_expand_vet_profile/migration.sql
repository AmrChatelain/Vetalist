-- AlterTable
ALTER TABLE "VetProfile" ADD COLUMN     "careTypes" TEXT[],
ADD COLUMN     "clinicName" TEXT,
ADD COLUMN     "clinicPhone" TEXT,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentMethods" TEXT[];
