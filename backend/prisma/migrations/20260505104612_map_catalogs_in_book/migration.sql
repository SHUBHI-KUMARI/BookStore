/*
  Warnings:

  - You are about to drop the column `catalogBookId` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `isbn10` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `isbn13` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `publishedAt` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `publisher` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the `CatalogAuthor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CatalogBook` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CatalogBookAuthor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CatalogBookSubject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CatalogSubject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CatalogSyncRun` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CatalogSyncState` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Book" DROP CONSTRAINT "Book_catalogBookId_fkey";

-- DropForeignKey
ALTER TABLE "CatalogBookAuthor" DROP CONSTRAINT "CatalogBookAuthor_authorId_fkey";

-- DropForeignKey
ALTER TABLE "CatalogBookAuthor" DROP CONSTRAINT "CatalogBookAuthor_bookId_fkey";

-- DropForeignKey
ALTER TABLE "CatalogBookSubject" DROP CONSTRAINT "CatalogBookSubject_bookId_fkey";

-- DropForeignKey
ALTER TABLE "CatalogBookSubject" DROP CONSTRAINT "CatalogBookSubject_subjectId_fkey";

-- DropIndex
DROP INDEX "Book_catalogBookId_idx";

-- DropIndex
DROP INDEX "Book_isbn10_idx";

-- DropIndex
DROP INDEX "Book_isbn13_idx";

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "catalogBookId",
DROP COLUMN "description",
DROP COLUMN "image",
DROP COLUMN "isbn10",
DROP COLUMN "isbn13",
DROP COLUMN "language",
DROP COLUMN "publishedAt",
DROP COLUMN "publisher";

-- DropTable
DROP TABLE "CatalogAuthor";

-- DropTable
DROP TABLE "CatalogBook";

-- DropTable
DROP TABLE "CatalogBookAuthor";

-- DropTable
DROP TABLE "CatalogBookSubject";

-- DropTable
DROP TABLE "CatalogSubject";

-- DropTable
DROP TABLE "CatalogSyncRun";

-- DropTable
DROP TABLE "CatalogSyncState";
