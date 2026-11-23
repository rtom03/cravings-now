/*
  Warnings:

  - You are about to drop the column `description` on the `customer_addresses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "customer_addresses" DROP COLUMN "description",
ADD COLUMN     "type" TEXT;
