/*
  Warnings:

  - Added the required column `time_zone` to the `markers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "markers" ADD COLUMN     "time_zone" VARCHAR NOT NULL;
