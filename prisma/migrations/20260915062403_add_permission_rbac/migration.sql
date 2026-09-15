-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('MANAGE_USERS', 'VIEW_USERS', 'MANAGE_SETTINGS', 'SIGN_OFF');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "extraPermissions" "Permission"[] DEFAULT ARRAY[]::"Permission"[];
