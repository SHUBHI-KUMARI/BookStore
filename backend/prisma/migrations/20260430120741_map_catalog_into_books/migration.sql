-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "catalogBookId" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "isbn10" TEXT,
ADD COLUMN     "isbn13" TEXT,
ADD COLUMN     "language" TEXT,
ADD COLUMN     "publishedAt" TEXT,
ADD COLUMN     "publisher" TEXT;

-- CreateIndex
CREATE INDEX "Book_isbn13_idx" ON "Book"("isbn13");

-- CreateIndex
CREATE INDEX "Book_isbn10_idx" ON "Book"("isbn10");

-- CreateIndex
CREATE INDEX "Book_catalogBookId_idx" ON "Book"("catalogBookId");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_catalogBookId_fkey" FOREIGN KEY ("catalogBookId") REFERENCES "CatalogBook"("id") ON DELETE SET NULL ON UPDATE CASCADE;
