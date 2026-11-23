/*
  Warnings:

  - The values [Active,Declined,Closed,Returned,Joined,Void,Draft] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `number` on the `orders` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orderNumber]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[trackingCode]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[branch_id,business_date,orderNumber]` on the table `orders` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('Pending', 'Received', 'Preparing', 'Driver_Pending', 'Out_For_Delivery', 'Complete', 'Ready_To_Collect', 'Cancelled', 'Refunded', 'Voided');
ALTER TABLE "public"."orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'Pending';
COMMIT;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "number",
ADD COLUMN     "orderNumber" INTEGER,
ADD COLUMN     "trackingCode" TEXT;

-- CreateTable
CREATE TABLE "OrderCounter" (
    "storeId" TEXT NOT NULL,
    "businessDate" DATE NOT NULL,
    "last" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OrderCounter_pkey" PRIMARY KEY ("storeId","businessDate")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "orders_trackingCode_key" ON "orders"("trackingCode");

-- CreateIndex
CREATE UNIQUE INDEX "orders_branch_id_business_date_orderNumber_key" ON "orders"("branch_id", "business_date", "orderNumber");
