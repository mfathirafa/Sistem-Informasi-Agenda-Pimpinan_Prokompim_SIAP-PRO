/*
  Warnings:

  - The values [ATASAN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;

ALTER TYPE "Role" 
RENAME VALUE 'ATASAN' TO 'KEPALA_BAGIAN';
COMMIT;
