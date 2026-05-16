/*
  Warnings:

  - A unique constraint covering the columns `[vetId,startTime]` on the table `Appointment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Appointment_vetId_startTime_key" ON "Appointment"("vetId", "startTime");
