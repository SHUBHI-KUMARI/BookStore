-- CreateTable
CREATE TABLE "CatalogBook" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'ISBNDB',
    "isbn13" TEXT,
    "isbn10" TEXT,
    "title" TEXT NOT NULL,
    "publisher" TEXT,
    "language" TEXT,
    "datePublished" TEXT,
    "edition" TEXT,
    "pages" INTEGER,
    "binding" TEXT,
    "image" TEXT,
    "imageOriginal" TEXT,
    "msrp" DOUBLE PRECISION,
    "excerpt" TEXT,
    "synopsis" TEXT,
    "detailStatus" TEXT,
    "detailSyncedAt" TIMESTAMP(3),
    "deweyDecimal" TEXT[],
    "dimensionsStructured" TEXT[],
    "rawPayload" JSONB NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogAuthor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "rawPayload" JSONB,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogAuthor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogSubject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogBookAuthor" (
    "bookId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatalogBookAuthor_pkey" PRIMARY KEY ("bookId","authorId")
);

-- CreateTable
CREATE TABLE "CatalogBookSubject" (
    "bookId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatalogBookSubject_pkey" PRIMARY KEY ("bookId","subjectId")
);

-- CreateTable
CREATE TABLE "CatalogSyncState" (
    "key" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "cursor" JSONB NOT NULL,
    "config" JSONB,
    "stats" JSONB,
    "dailyRequestCount" INTEGER NOT NULL DEFAULT 0,
    "dailyRequestDate" TEXT,
    "totalRequestCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "lastRunStartedAt" TIMESTAMP(3),
    "lastRunCompletedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogSyncState_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "CatalogSyncRun" (
    "id" TEXT NOT NULL,
    "stateKey" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "processedCount" INTEGER NOT NULL DEFAULT 0,
    "insertedCount" INTEGER NOT NULL DEFAULT 0,
    "updatedCount" INTEGER NOT NULL DEFAULT 0,
    "skippedCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "notes" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "CatalogSyncRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CatalogBook_isbn13_key" ON "CatalogBook"("isbn13");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogBook_isbn10_key" ON "CatalogBook"("isbn10");

-- CreateIndex
CREATE INDEX "CatalogBook_title_idx" ON "CatalogBook"("title");

-- CreateIndex
CREATE INDEX "CatalogBook_publisher_idx" ON "CatalogBook"("publisher");

-- CreateIndex
CREATE INDEX "CatalogBook_language_idx" ON "CatalogBook"("language");

-- CreateIndex
CREATE INDEX "CatalogBook_lastSyncedAt_idx" ON "CatalogBook"("lastSyncedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogAuthor_normalizedName_key" ON "CatalogAuthor"("normalizedName");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogSubject_normalizedName_key" ON "CatalogSubject"("normalizedName");

-- CreateIndex
CREATE INDEX "CatalogBookAuthor_authorId_idx" ON "CatalogBookAuthor"("authorId");

-- CreateIndex
CREATE INDEX "CatalogBookSubject_subjectId_idx" ON "CatalogBookSubject"("subjectId");

-- CreateIndex
CREATE INDEX "CatalogSyncRun_stateKey_startedAt_idx" ON "CatalogSyncRun"("stateKey", "startedAt");

-- AddForeignKey
ALTER TABLE "CatalogBookAuthor" ADD CONSTRAINT "CatalogBookAuthor_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "CatalogBook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogBookAuthor" ADD CONSTRAINT "CatalogBookAuthor_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "CatalogAuthor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogBookSubject" ADD CONSTRAINT "CatalogBookSubject_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "CatalogBook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogBookSubject" ADD CONSTRAINT "CatalogBookSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "CatalogSubject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
