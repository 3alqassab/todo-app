/*
  Warnings:

  - The values [INCOMPLETED] on the enum `TodoStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TodoStatus_new" AS ENUM ('COMPLETED', 'NOT_COMPLETED');
ALTER TABLE "Todo" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Todo" ALTER COLUMN "status" TYPE "TodoStatus_new" USING ("status"::text::"TodoStatus_new");
ALTER TYPE "TodoStatus" RENAME TO "TodoStatus_old";
ALTER TYPE "TodoStatus_new" RENAME TO "TodoStatus";
DROP TYPE "TodoStatus_old";
ALTER TABLE "Todo" ALTER COLUMN "status" SET DEFAULT 'NOT_COMPLETED';
COMMIT;

-- DropForeignKey
ALTER TABLE "Todo" DROP CONSTRAINT "Todo_userId_fkey";

-- AlterTable
ALTER TABLE "Todo" ALTER COLUMN "status" SET DEFAULT 'NOT_COMPLETED';

-- AddForeignKey
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
