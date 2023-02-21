/*
  Warnings:

  - Added the required column `deadline` to the `Todo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Todo" ADD COLUMN     "deadline" TIMESTAMP(3) NOT NULL;
