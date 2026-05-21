import 'dotenv/config';

import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SOURCE = 'ISBNDB';
const DEFAULT_BASE_URL = process.env.ISBNDB_BASE_URL || 'https://api2.isbndb.com';
const DEFAULT_MODE = 'bootstrap-subjects';
const DEFAULT_PAGE_SIZE = Number(process.env.ISBNDB_PAGE_SIZE || 250);
const DEFAULT_DAILY_LIMIT = Number(process.env.ISBNDB_DAILY_LIMIT || 5000);
const DEFAULT_REQUEST_INTERVAL_MS = Number(process.env.ISBNDB_REQUEST_INTERVAL_MS || 1100);
const DEFAULT_BULK_LOOKUP_SIZE = Number(process.env.ISBNDB_BULK_LOOKUP_SIZE || 100);

const SUBJECT_BOOTSTRAP_QUERIES = [
  'fiction',
  'literature',
  'science',
  'technology',
  'business',
  'economics',
  'history',
  'biography',
  'textbooks',
  'photography',
  'art',
  'health',
  'wellness',
  'children',
  'young adult',
  'mystery',
  'thriller',
  'fantasy',
  'science fiction',
  'self-help',
  'productivity',
  'poetry',
  'drama',
  'philosophy',
  'psychology',
  'education',
  'engineering',
  'medicine',
  'travel',
  'romance',
];

type SyncMode =
  | 'bootstrap-subjects'
  | 'sync-updates'
  | 'enrich-books'
  | 'enrich-authors'
  | 'status'
  | 'reset-state';

type Args = {
  mode: SyncMode;
  maxRequests: number;
  pageSize: number;
  requestIntervalMs: number;
  bulkLookupSize: number;
  updateFrom: string;
  reset: boolean;
};

type IsbnDbBook = {
  title?: string;
  isbn13?: string;
  isbn10?: string;
  dewey_decimal?: string[] | string;
  binding?: string;
  publisher?: string;
  language?: string;
  date_published?: string;
  edition?: string;
  pages?: number | string;
  dimensions_structured?: string[] | string;
  image?: string;
  image_original?: string;
  msrp?: number | string;
  excerpt?: string;
  synopsis?: string;
  authors?: string[];
  subjects?: string[];
  [key: string]: unknown;
};

type SearchBooksResponse = {
  books?: IsbnDbBook[];
  total?: number;
};

type SingleBookResponse = {
  book?: IsbnDbBook;
};

type UpdatedBooksResponse = {
  data?: Array<string | { isbn?: string; isbn13?: string; isbn10?: string }>;
};

type SyncCursor = Record<string, unknown>;

type StateRecord = {
  key: string;
  source: string;
  mode: string;
  cursor: Prisma.JsonValue;
  config: Prisma.JsonValue | null;
  stats: Prisma.JsonValue | null;
  dailyRequestCount: number;
  dailyRequestDate: string | null;
  totalRequestCount: number;
  isActive: boolean;
};

type RunMetrics = {
  requestCount: number;
  processedCount: number;
  insertedCount: number;
  updatedCount: number;
  skippedCount: number;
  errorCount: number;
};

class DailyLimitReachedError extends Error {}

class ApiError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function parseArgs(): Args {
  const values = new Map<string, string>();

  for (const rawArg of process.argv.slice(2)) {
    if (!rawArg.startsWith('--')) {
      continue;
    }

    const [flag, value] = rawArg.slice(2).split('=');
    values.set(flag, value ?? 'true');
  }

  const mode = (values.get('mode') || DEFAULT_MODE) as SyncMode;

  return {
    mode,
    maxRequests: Number(values.get('max-requests') || DEFAULT_DAILY_LIMIT),
    pageSize: Number(values.get('page-size') || DEFAULT_PAGE_SIZE),
    requestIntervalMs: Number(values.get('request-interval-ms') || DEFAULT_REQUEST_INTERVAL_MS),
    bulkLookupSize: Number(values.get('bulk-lookup-size') || DEFAULT_BULK_LOOKUP_SIZE),
    updateFrom:
      values.get('update-from') || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    reset: values.get('reset') === 'true',
  };
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function cleanString(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => cleanString(entry))
      .filter((entry): entry is string => Boolean(entry));
  }

  const cleaned = cleanString(value);
  return cleaned ? [cleaned] : [];
}

function toNullableNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.replace(/[^0-9.-]/g, '');
    if (!normalized) {
      return null;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stateKeyForMode(mode: Exclude<SyncMode, 'status' | 'reset-state'>) {
  return `isbndb:${mode}`;
}

function jsonObject(value: Prisma.JsonValue | null | undefined) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

async function getState(
  key: string,
  mode: string,
  defaultCursor: SyncCursor,
  config: Record<string, unknown>,
  reset: boolean,
) {
  const existing = await prisma.catalogSyncState.findUnique({ where: { key } });

  if (reset && existing) {
    await prisma.catalogSyncState.delete({ where: { key } });
  }

  const state = await prisma.catalogSyncState.upsert({
    where: { key },
    update: {
      source: SOURCE,
      mode,
      config: config as Prisma.InputJsonValue,
    },
    create: {
      key,
      source: SOURCE,
      mode,
      cursor: defaultCursor as Prisma.InputJsonValue,
      config: config as Prisma.InputJsonValue,
      stats: {},
      dailyRequestDate: todayIsoDate(),
    },
  });

  if (state.dailyRequestDate !== todayIsoDate()) {
    return prisma.catalogSyncState.update({
      where: { key },
      data: {
        dailyRequestDate: todayIsoDate(),
        dailyRequestCount: 0,
      },
    });
  }

  return state;
}

async function updateState(
  key: string,
  data: Partial<{
    cursor: Prisma.InputJsonValue;
    config: Prisma.InputJsonValue;
    stats: Prisma.InputJsonValue;
    dailyRequestCount: number;
    dailyRequestDate: string;
    totalRequestCount: number;
    isActive: boolean;
    lastRunStartedAt: Date;
    lastRunCompletedAt: Date;
    lastError: string | null;
  }>,
) {
  return prisma.catalogSyncState.update({
    where: { key },
    data,
  });
}

async function createRun(stateKey: string, mode: string, config: Record<string, unknown>) {
  return prisma.catalogSyncRun.create({
    data: {
      stateKey,
      source: SOURCE,
      mode,
      status: 'RUNNING',
      notes: config as Prisma.InputJsonValue,
    },
  });
}

async function finishRun(
  runId: string,
  status: 'COMPLETED' | 'STOPPED' | 'FAILED',
  metrics: RunMetrics,
  notes?: Record<string, unknown>,
) {
  await prisma.catalogSyncRun.update({
    where: { id: runId },
    data: {
      status,
      requestCount: metrics.requestCount,
      processedCount: metrics.processedCount,
      insertedCount: metrics.insertedCount,
      updatedCount: metrics.updatedCount,
      skippedCount: metrics.skippedCount,
      errorCount: metrics.errorCount,
      notes: notes ? (notes as Prisma.InputJsonValue) : undefined,
      finishedAt: new Date(),
    },
  });
}

class IsbnDbClient {
  private apiKey: string;
  private baseUrl: string;
  private intervalMs: number;
  private lastRequestAt = 0;
  private stateKey: string;
  private remainingBudgetCap: number;
  private currentState: StateRecord;
  private metrics: RunMetrics;

  constructor(stateKey: string, currentState: StateRecord, metrics: RunMetrics, intervalMs: number, maxRequests: number) {
    const apiKey = process.env.ISBN_KEY || process.env.ISBNDB_API_KEY;
    if (!apiKey) {
      throw new Error('Missing ISBN_KEY in backend/.env');
    }

    this.apiKey = apiKey;
    this.baseUrl = DEFAULT_BASE_URL;
    this.intervalMs = intervalMs;
    this.stateKey = stateKey;
    this.currentState = currentState;
    this.metrics = metrics;
    this.remainingBudgetCap = maxRequests;
  }

  public getState() {
    return this.currentState;
  }

  private async waitForRateLimit() {
    const elapsed = Date.now() - this.lastRequestAt;
    if (elapsed < this.intervalMs) {
      await sleep(this.intervalMs - elapsed);
    }
    this.lastRequestAt = Date.now();
  }

  private async consumeQuota(cost: number) {
    const today = todayIsoDate();
    const currentDailyCount = this.currentState.dailyRequestDate === today ? this.currentState.dailyRequestCount : 0;

    if (currentDailyCount + cost > DEFAULT_DAILY_LIMIT || this.metrics.requestCount + cost > this.remainingBudgetCap) {
      throw new DailyLimitReachedError('Daily ISBNdb request budget reached for this run.');
    }

    const nextDailyCount = currentDailyCount + cost;
    const nextTotalCount = this.currentState.totalRequestCount + cost;

    this.currentState = await updateState(this.stateKey, {
      dailyRequestDate: today,
      dailyRequestCount: nextDailyCount,
      totalRequestCount: nextTotalCount,
    }) as StateRecord;
    this.metrics.requestCount += cost;
  }

  public async get<T>(path: string, cost = 1) {
    await this.waitForRateLimit();
    await this.consumeQuota(cost);

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers: {
        Authorization: this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      throw new ApiError(404, `Resource not found for ${path}`);
    }

    if (response.status === 429) {
      throw new ApiError(429, 'ISBNdb rate limit reached. Stop the job and resume later.');
    }

    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }

    return response.json() as Promise<T>;
  }

  public async post<T>(path: string, body: unknown, cost: number) {
    await this.waitForRateLimit();
    await this.consumeQuota(cost);

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        Authorization: this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (response.status === 429) {
      throw new ApiError(429, 'ISBNdb rate limit reached. Stop the job and resume later.');
    }

    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }

    return response.json() as Promise<T>;
  }
}

const authorIdCache = new Map<string, string>();
const subjectIdCache = new Map<string, string>();

async function ensureAuthorId(tx: Prisma.TransactionClient, name: string) {
  const normalizedName = normalizeName(name);
  const cached = authorIdCache.get(normalizedName);
  if (cached) {
    return cached;
  }

  const author = await tx.catalogAuthor.upsert({
    where: { normalizedName },
    update: {
      name,
      lastSyncedAt: new Date(),
    },
    create: {
      name,
      normalizedName,
    },
    select: { id: true },
  });

  authorIdCache.set(normalizedName, author.id);
  return author.id;
}

async function ensureSubjectId(tx: Prisma.TransactionClient, name: string) {
  const normalizedName = normalizeName(name);
  const cached = subjectIdCache.get(normalizedName);
  if (cached) {
    return cached;
  }

  const subject = await tx.catalogSubject.upsert({
    where: { normalizedName },
    update: {
      name,
      lastSyncedAt: new Date(),
    },
    create: {
      name,
      normalizedName,
    },
    select: { id: true },
  });

  subjectIdCache.set(normalizedName, subject.id);
  return subject.id;
}

async function upsertCatalogBook(book: IsbnDbBook, detailStatus: 'search' | 'detail', metrics: RunMetrics) {
  const isbn13 = cleanString(book.isbn13);
  const isbn10 = cleanString(book.isbn10);
  const title = cleanString(book.title);

  if (!title || (!isbn13 && !isbn10)) {
    metrics.skippedCount++;
    return;
  }

  const authors = toStringArray(book.authors);
  const subjects = toStringArray(book.subjects);

  const existing = await prisma.catalogBook.findFirst({
    where: {
      OR: [
        ...(isbn13 ? [{ isbn13 }] : []),
        ...(isbn10 ? [{ isbn10 }] : []),
      ],
    },
    select: { id: true },
  });

  const payload = {
    source: SOURCE,
    isbn13,
    isbn10,
    title,
    publisher: cleanString(book.publisher),
    language: cleanString(book.language),
    datePublished: cleanString(book.date_published),
    edition: cleanString(book.edition),
    pages: toNullableNumber(book.pages),
    binding: cleanString(book.binding),
    image: cleanString(book.image),
    imageOriginal: cleanString(book.image_original),
    msrp: toNullableNumber(book.msrp),
    excerpt: cleanString(book.excerpt),
    synopsis: cleanString(book.synopsis),
    detailStatus,
    detailSyncedAt: detailStatus === 'detail' ? new Date() : undefined,
    deweyDecimal: toStringArray(book.dewey_decimal),
    dimensionsStructured: toStringArray(book.dimensions_structured),
    rawPayload: book as Prisma.InputJsonValue,
    lastSyncedAt: new Date(),
  };

  const bookId = await prisma.$transaction(async (tx) => {
    const savedBook = existing
      ? await tx.catalogBook.update({
          where: { id: existing.id },
          data: payload,
          select: { id: true },
        })
      : await tx.catalogBook.create({
          data: payload,
          select: { id: true },
        });

    await tx.catalogBookAuthor.deleteMany({ where: { bookId: savedBook.id } });
    if (authors.length > 0) {
      const authorIds = [];
      for (const [index, authorName] of authors.entries()) {
        const authorId = await ensureAuthorId(tx, authorName);
        authorIds.push({
          authorId,
          bookId: savedBook.id,
          sortOrder: index,
        });
      }

      await tx.catalogBookAuthor.createMany({
        data: authorIds,
        skipDuplicates: true,
      });
    }

    await tx.catalogBookSubject.deleteMany({ where: { bookId: savedBook.id } });
    if (subjects.length > 0) {
      const subjectIds = [];
      for (const subjectName of subjects) {
        const subjectId = await ensureSubjectId(tx, subjectName);
        subjectIds.push({
          subjectId,
          bookId: savedBook.id,
        });
      }

      await tx.catalogBookSubject.createMany({
        data: subjectIds,
        skipDuplicates: true,
      });
    }

    return savedBook.id;
  });

  metrics.processedCount++;
  if (existing) {
    metrics.updatedCount++;
  } else {
    metrics.insertedCount++;
  }

  return bookId;
}

async function syncBootstrapSubjects(client: IsbnDbClient, args: Args, stateKey: string, metrics: RunMetrics) {
  const defaultCursor = {
    queryIndex: 0,
    page: 1,
    completedQueries: [] as string[],
  };
  let state = await getState(stateKey, args.mode, defaultCursor, {
    pageSize: args.pageSize,
    queries: SUBJECT_BOOTSTRAP_QUERIES,
  }, args.reset) as StateRecord;

  const cursor = {
    ...defaultCursor,
    ...jsonObject(state.cursor),
  } as {
    queryIndex: number;
    page: number;
    completedQueries: string[];
  };

  while (cursor.queryIndex < SUBJECT_BOOTSTRAP_QUERIES.length) {
    const query = SUBJECT_BOOTSTRAP_QUERIES[cursor.queryIndex];
    const path = `/books/${encodeURIComponent(query)}?column=subjects&language=eng&page=${cursor.page}&pageSize=${args.pageSize}`;
    const response = await client.get<SearchBooksResponse>(path, 1);
    const books = response.books || [];

    if (books.length === 0) {
      cursor.completedQueries.push(query);
      cursor.queryIndex += 1;
      cursor.page = 1;

      state = await updateState(stateKey, {
        cursor: cursor as Prisma.InputJsonValue,
        stats: {
          completedQueries: cursor.completedQueries,
        } as Prisma.InputJsonValue,
        isActive: true,
      }) as StateRecord;
      continue;
    }

    for (const book of books) {
      await upsertCatalogBook(book, 'search', metrics);
    }

    cursor.page += 1;
    state = await updateState(stateKey, {
      cursor: cursor as Prisma.InputJsonValue,
      stats: {
        currentQuery: query,
        currentPage: cursor.page,
        completedQueries: cursor.completedQueries,
      } as Prisma.InputJsonValue,
      isActive: true,
    }) as StateRecord;
  }

  await updateState(stateKey, {
    cursor: cursor as Prisma.InputJsonValue,
    stats: {
      completedQueries: cursor.completedQueries,
      status: 'bootstrap-complete',
    } as Prisma.InputJsonValue,
  });
}

function extractUpdateIsbns(data: UpdatedBooksResponse['data']) {
  if (!data) {
    return [];
  }

  return data
    .map((entry) => {
      if (typeof entry === 'string') {
        return cleanString(entry);
      }

      return cleanString(entry.isbn13) || cleanString(entry.isbn10) || cleanString(entry.isbn);
    })
    .filter((isbn): isbn is string => Boolean(isbn));
}

async function syncUpdates(client: IsbnDbClient, args: Args, stateKey: string, metrics: RunMetrics) {
  const defaultCursor = {
    lastUpdated: args.updateFrom,
    page: 1,
    pendingIsbns: [] as string[],
  };
  let state = await getState(stateKey, args.mode, defaultCursor, {
    pageSize: args.pageSize,
    updateFrom: args.updateFrom,
    bulkLookupSize: args.bulkLookupSize,
  }, args.reset) as StateRecord;

  const cursor = {
    ...defaultCursor,
    ...jsonObject(state.cursor),
  } as {
    lastUpdated: string;
    page: number;
    pendingIsbns: string[];
  };

  while (true) {
    if (cursor.pendingIsbns.length === 0) {
      const feedPath = `/feeds/books/updates?page=${cursor.page}&pageSize=${args.pageSize}&lastUpdated=${encodeURIComponent(cursor.lastUpdated)}`;
      const feedResponse = await client.get<UpdatedBooksResponse>(feedPath, 0);
      cursor.pendingIsbns = extractUpdateIsbns(feedResponse.data);

      if (cursor.pendingIsbns.length === 0) {
        break;
      }
    }

    const isbnChunk = cursor.pendingIsbns.slice(0, args.bulkLookupSize);
    const response = await client.post<SearchBooksResponse>(
      '/books',
      { isbns: isbnChunk },
      isbnChunk.length,
    );

    for (const book of response.books || []) {
      await upsertCatalogBook(book, 'detail', metrics);
    }

    cursor.pendingIsbns = cursor.pendingIsbns.slice(isbnChunk.length);
    if (cursor.pendingIsbns.length === 0) {
      cursor.page += 1;
    }

    state = await updateState(stateKey, {
      cursor: cursor as Prisma.InputJsonValue,
      stats: {
        lastUpdated: cursor.lastUpdated,
        currentPage: cursor.page,
        pendingCount: cursor.pendingIsbns.length,
      } as Prisma.InputJsonValue,
      isActive: true,
    }) as StateRecord;
  }

  await updateState(stateKey, {
    cursor: {
      lastUpdated: todayIsoDate(),
      page: 1,
      pendingIsbns: [],
    } as Prisma.InputJsonValue,
    stats: {
      status: 'updates-complete',
      completedAt: new Date().toISOString(),
    } as Prisma.InputJsonValue,
  });
}

async function enrichBooks(client: IsbnDbClient, _args: Args, stateKey: string, metrics: RunMetrics) {
  const defaultCursor = { lastBookId: null as string | null };
  await getState(stateKey, 'enrich-books', defaultCursor, {}, false);

  while (true) {
    const book = await prisma.catalogBook.findFirst({
      where: {
        OR: [
          { detailStatus: null },
          { detailStatus: 'search' },
          { imageOriginal: null },
          { synopsis: null },
        ],
      },
      orderBy: [
        { lastSyncedAt: 'asc' },
        { createdAt: 'asc' },
      ],
      select: {
        id: true,
        isbn13: true,
        isbn10: true,
      },
    });

    if (!book) {
      break;
    }

    const isbn = book.isbn13 || book.isbn10;
    if (!isbn) {
      metrics.skippedCount++;
      await prisma.catalogBook.update({
        where: { id: book.id },
        data: {
          detailStatus: 'missing-isbn',
          detailSyncedAt: new Date(),
        },
      });
      continue;
    }

    try {
      const response = await client.get<SingleBookResponse>(`/book/${encodeURIComponent(isbn)}`, 1);
      if (response.book) {
        await upsertCatalogBook(response.book, 'detail', metrics);
      } else {
        metrics.skippedCount++;
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        metrics.skippedCount++;
        await prisma.catalogBook.update({
          where: { id: book.id },
          data: {
            detailStatus: 'not-found',
            detailSyncedAt: new Date(),
            lastSyncedAt: new Date(),
          },
        });
        continue;
      }

      throw error;
    }

    await updateState(stateKey, {
      cursor: { lastBookId: book.id } as Prisma.InputJsonValue,
      stats: {
        lastProcessedBookId: book.id,
      } as Prisma.InputJsonValue,
      isActive: true,
    });
  }
}

async function enrichAuthors(client: IsbnDbClient, _args: Args, stateKey: string, metrics: RunMetrics) {
  const defaultCursor = { lastAuthorId: null as string | null };
  await getState(stateKey, 'enrich-authors', defaultCursor, {}, false);

  while (true) {
    const author = await prisma.catalogAuthor.findFirst({
      where: {
        OR: [
          { rawPayload: { equals: Prisma.JsonNull } },
          {
            lastSyncedAt: {
              lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        ],
      },
      orderBy: [
        { lastSyncedAt: 'asc' },
        { createdAt: 'asc' },
      ],
      select: {
        id: true,
        name: true,
      },
    });

    if (!author) {
      break;
    }

    const response = await client.get<Record<string, unknown>>(`/author/${encodeURIComponent(author.name)}`, 1);
    await prisma.catalogAuthor.update({
      where: { id: author.id },
      data: {
        rawPayload: response as Prisma.InputJsonValue,
        lastSyncedAt: new Date(),
      },
    });

    metrics.processedCount++;
    metrics.updatedCount++;

    await updateState(stateKey, {
      cursor: { lastAuthorId: author.id } as Prisma.InputJsonValue,
      stats: {
        lastProcessedAuthorId: author.id,
        lastProcessedAuthorName: author.name,
      } as Prisma.InputJsonValue,
      isActive: true,
    });
  }
}

async function printStatus() {
  const [states, counts] = await Promise.all([
    prisma.catalogSyncState.findMany({
      orderBy: { updatedAt: 'desc' },
    }),
    Promise.all([
      prisma.catalogBook.count(),
      prisma.catalogAuthor.count(),
      prisma.catalogSubject.count(),
      prisma.catalogSyncRun.count(),
    ]),
  ]);

  console.log('Catalog status');
  console.log(`  Books: ${counts[0]}`);
  console.log(`  Authors: ${counts[1]}`);
  console.log(`  Subjects: ${counts[2]}`);
  console.log(`  Sync runs: ${counts[3]}`);

  if (states.length === 0) {
    console.log('  No sync state has been created yet.');
    return;
  }

  for (const state of states) {
    console.log(`\nState: ${state.key}`);
    console.log(`  Mode: ${state.mode}`);
    console.log(`  Daily requests: ${state.dailyRequestCount} on ${state.dailyRequestDate || 'n/a'}`);
    console.log(`  Total requests: ${state.totalRequestCount}`);
    console.log(`  Active: ${state.isActive}`);
    console.log(`  Last error: ${state.lastError || 'none'}`);
    console.log(`  Cursor: ${JSON.stringify(state.cursor)}`);
  }
}

async function resetStates() {
  await prisma.catalogSyncRun.deleteMany();
  await prisma.catalogSyncState.deleteMany();
  console.log('Deleted all catalog sync runs and state records.');
}

async function main() {
  const args = parseArgs();

  if (args.mode === 'status') {
    await printStatus();
    return;
  }

  if (args.mode === 'reset-state') {
    await resetStates();
    return;
  }

  const stateKey = stateKeyForMode(args.mode);
  const state = await getState(stateKey, args.mode, {}, {
    maxRequests: args.maxRequests,
    pageSize: args.pageSize,
    requestIntervalMs: args.requestIntervalMs,
    bulkLookupSize: args.bulkLookupSize,
  }, args.reset) as StateRecord;

  const metrics: RunMetrics = {
    requestCount: 0,
    processedCount: 0,
    insertedCount: 0,
    updatedCount: 0,
    skippedCount: 0,
    errorCount: 0,
  };

  await updateState(stateKey, {
    isActive: true,
    lastRunStartedAt: new Date(),
    lastError: null,
  });

  const run = await createRun(stateKey, args.mode, {
    maxRequests: args.maxRequests,
    pageSize: args.pageSize,
    requestIntervalMs: args.requestIntervalMs,
    bulkLookupSize: args.bulkLookupSize,
    updateFrom: args.updateFrom,
  });

  try {
    const client = new IsbnDbClient(stateKey, state, metrics, args.requestIntervalMs, args.maxRequests);

    if (args.mode === 'bootstrap-subjects') {
      await syncBootstrapSubjects(client, args, stateKey, metrics);
    } else if (args.mode === 'sync-updates') {
      await syncUpdates(client, args, stateKey, metrics);
    } else if (args.mode === 'enrich-books') {
      await enrichBooks(client, args, stateKey, metrics);
    } else if (args.mode === 'enrich-authors') {
      await enrichAuthors(client, args, stateKey, metrics);
    }

    await updateState(stateKey, {
      isActive: false,
      lastRunCompletedAt: new Date(),
      stats: {
        requestCount: metrics.requestCount,
        processedCount: metrics.processedCount,
        insertedCount: metrics.insertedCount,
        updatedCount: metrics.updatedCount,
        skippedCount: metrics.skippedCount,
      } as Prisma.InputJsonValue,
    });
    await finishRun(run.id, 'COMPLETED', metrics);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown sync failure';
    const status = error instanceof DailyLimitReachedError ? 'STOPPED' : 'FAILED';

    if (!(error instanceof DailyLimitReachedError)) {
      metrics.errorCount++;
    }

    await updateState(stateKey, {
      isActive: false,
      lastRunCompletedAt: new Date(),
      lastError: message,
    });
    await finishRun(run.id, status, metrics, { error: message });

    if (error instanceof DailyLimitReachedError) {
      console.log(message);
      return;
    }

    throw error;
  }

  console.log(`Mode ${args.mode} finished.`);
  console.log(`  Requests used this run: ${metrics.requestCount}`);
  console.log(`  Books/authors processed: ${metrics.processedCount}`);
  console.log(`  Inserted: ${metrics.insertedCount}`);
  console.log(`  Updated: ${metrics.updatedCount}`);
  console.log(`  Skipped: ${metrics.skippedCount}`);
}

main()
  .catch((error) => {
    console.error('ISBNdb sync failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
