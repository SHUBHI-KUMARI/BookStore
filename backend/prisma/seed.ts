import 'dotenv/config';

import {
  ApprovalStatus,
  BookCondition,
  OrderStatus,
  PaymentStatus,
  PrismaClient,
  Role,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;
const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'rebook/books';

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} in backend/.env`);
  }

  return value;
}

cloudinary.config({
  cloud_name: requireEnv('CLOUDINARY_CLOUD_NAME'),
  api_key: requireEnv('CLOUDINARY_KEY'),
  api_secret: requireEnv('CLOUDINARY_SECRET'),
});

type UserSeed = {
  name: string;
  email: string;
  password: string;
  role: Role;
  phone: string;
  address: string;
  age: number;
};

type CategorySeed = {
  name: string;
  description: string;
  keywords: string[];
};

const categorySeeds: CategorySeed[] = [
  {
    name: 'Fiction & Literature',
    description: 'Classic, literary, and contemporary fiction.',
    keywords: ['fiction', 'literature', 'novel', 'classic', 'literary', 'short stories'],
  },
  {
    name: 'Science & Technology',
    description: 'Programming, engineering, mathematics, and science.',
    keywords: [
      'science',
      'technology',
      'computer',
      'programming',
      'software',
      'engineering',
      'physics',
      'chemistry',
      'mathematics',
      'algorithms',
      'data',
    ],
  },
  {
    name: 'Business & Economy',
    description: 'Business, investing, leadership, and economics.',
    keywords: [
      'business',
      'economics',
      'finance',
      'investing',
      'leadership',
      'management',
      'marketing',
      'entrepreneurship',
    ],
  },
  {
    name: 'History & Biography',
    description: 'Memoirs, biographies, and historical nonfiction.',
    keywords: [
      'history',
      'biography',
      'memoir',
      'autobiography',
      'historical',
      'war',
      'civilization',
      'president',
    ],
  },
  {
    name: 'Textbooks',
    description: 'Academic and higher-education course material.',
    keywords: [
      'textbook',
      'education',
      'study',
      'college',
      'university',
      'reference',
      'curriculum',
      'exam',
    ],
  },
  {
    name: 'Arts & Photography',
    description: 'Art, design, creativity, visual culture, and photography.',
    keywords: ['art', 'photography', 'design', 'drawing', 'illustration', 'comics', 'creative'],
  },
  {
    name: 'Health & Wellness',
    description: 'Health, nutrition, wellness, medicine, and wellbeing.',
    keywords: [
      'health',
      'wellness',
      'medicine',
      'nutrition',
      'fitness',
      'healing',
      'sleep',
      'trauma',
      'psychology',
    ],
  },
  {
    name: 'Children & Young Adult',
    description: 'Kids, middle-grade, and young adult books.',
    keywords: ['children', 'juvenile', 'young adult', 'teen', 'middle grade', 'kids'],
  },
  {
    name: 'Mystery & Thriller',
    description: 'Crime, suspense, mystery, and thriller titles.',
    keywords: ['mystery', 'thriller', 'crime', 'detective', 'suspense', 'murder'],
  },
  {
    name: 'Fantasy & Sci-Fi',
    description: 'Fantasy, science fiction, and speculative fiction.',
    keywords: [
      'fantasy',
      'science fiction',
      'sci-fi',
      'speculative',
      'dragon',
      'magic',
      'space',
      'dystopian',
    ],
  },
  {
    name: 'Self-Help & Productivity',
    description: 'Mindset, habits, productivity, and self-improvement.',
    keywords: [
      'self-help',
      'productivity',
      'success',
      'habit',
      'mindset',
      'personal development',
      'motivation',
      'career',
    ],
  },
  {
    name: 'Poetry & Drama',
    description: 'Poetry, plays, and dramatic literature.',
    keywords: ['poetry', 'poems', 'drama', 'play', 'theater', 'theatre', 'shakespeare'],
  },
];

const adminSeeds: UserSeed[] = [
  {
    name: 'Admin User',
    email: 'admin@rebook.com',
    password: 'admin123',
    role: Role.ADMIN,
    phone: '+1-555-100-0001',
    address: '12 Market Street, Seattle, WA',
    age: 34,
  },
  {
    name: 'Priya Sharma',
    email: 'priya.admin@rebook.com',
    password: 'admin123',
    role: Role.ADMIN,
    phone: '+1-555-100-0002',
    address: '88 Westlake Ave, Seattle, WA',
    age: 31,
  },
];

const sellerSeeds: UserSeed[] = [
  {
    name: 'Jane Seller',
    email: 'jane@example.com',
    password: 'seller123',
    role: Role.CUSTOMER,
    phone: '+1-555-200-0001',
    address: '31 Pine Street, Portland, OR',
    age: 29,
  },
  {
    name: 'Marcus Reed',
    email: 'marcus@example.com',
    password: 'seller123',
    role: Role.CUSTOMER,
    phone: '+1-555-200-0002',
    address: '74 Lakeshore Dr, Chicago, IL',
    age: 37,
  },
  {
    name: 'Elena Alvarez',
    email: 'elena@example.com',
    password: 'seller123',
    role: Role.CUSTOMER,
    phone: '+1-555-200-0003',
    address: '19 Olive Grove, Austin, TX',
    age: 33,
  },
  {
    name: 'Noah Kim',
    email: 'noah@example.com',
    password: 'seller123',
    role: Role.CUSTOMER,
    phone: '+1-555-200-0004',
    address: '201 Cedar Lane, Denver, CO',
    age: 27,
  },
  {
    name: 'Fatima Hassan',
    email: 'fatima@example.com',
    password: 'seller123',
    role: Role.CUSTOMER,
    phone: '+1-555-200-0005',
    address: '6 Maple Avenue, Boston, MA',
    age: 35,
  },
  {
    name: 'Victor Chen',
    email: 'victor@example.com',
    password: 'seller123',
    role: Role.CUSTOMER,
    phone: '+1-555-200-0006',
    address: '55 Harbor Blvd, San Diego, CA',
    age: 32,
  },
];

const customerSeeds: UserSeed[] = [
  {
    name: 'John Customer',
    email: 'john@example.com',
    password: 'customer123',
    role: Role.CUSTOMER,
    phone: '+1-555-300-0001',
    address: '421 River Road, Columbus, OH',
    age: 26,
  },
  {
    name: 'Test User',
    email: 'test@example.com',
    password: 'test123',
    role: Role.CUSTOMER,
    phone: '+1-555-300-0002',
    address: '18 Ash Court, Phoenix, AZ',
    age: 24,
  },
  {
    name: 'Sophia Bennett',
    email: 'sophia@example.com',
    password: 'customer123',
    role: Role.CUSTOMER,
    phone: '+1-555-300-0003',
    address: '91 Willow Drive, Charlotte, NC',
    age: 30,
  },
  {
    name: 'Liam Patel',
    email: 'liam@example.com',
    password: 'customer123',
    role: Role.CUSTOMER,
    phone: '+1-555-300-0004',
    address: '67 Orchard Street, Jersey City, NJ',
    age: 28,
  },
  {
    name: 'Ava Thompson',
    email: 'ava@example.com',
    password: 'customer123',
    role: Role.CUSTOMER,
    phone: '+1-555-300-0005',
    address: '203 Sunset Blvd, Los Angeles, CA',
    age: 22,
  },
  {
    name: 'Ethan Brooks',
    email: 'ethan@example.com',
    password: 'customer123',
    role: Role.CUSTOMER,
    phone: '+1-555-300-0006',
    address: '47 Meadow Lane, Nashville, TN',
    age: 39,
  },
  {
    name: 'Mia Robinson',
    email: 'mia@example.com',
    password: 'customer123',
    role: Role.CUSTOMER,
    phone: '+1-555-300-0007',
    address: '5 Briarwood Ave, Atlanta, GA',
    age: 27,
  },
  {
    name: 'Lucas Martin',
    email: 'lucas@example.com',
    password: 'customer123',
    role: Role.CUSTOMER,
    phone: '+1-555-300-0008',
    address: '820 Greenway Rd, Minneapolis, MN',
    age: 36,
  },
  {
    name: 'Zara Ali',
    email: 'zara@example.com',
    password: 'customer123',
    role: Role.CUSTOMER,
    phone: '+1-555-300-0009',
    address: '260 Bay Street, Miami, FL',
    age: 25,
  },
  {
    name: 'Daniel Hughes',
    email: 'daniel@example.com',
    password: 'customer123',
    role: Role.CUSTOMER,
    phone: '+1-555-300-0010',
    address: '12 Elm Street, Philadelphia, PA',
    age: 41,
  },
];

const reviewComments = [
  'Excellent copy with a beautiful cover and very fair pricing.',
  'This edition arrived in better condition than expected.',
  'A strong read and a great addition to the marketplace.',
  'Really happy to find this title with the original cover image intact.',
  'Worth buying if you want a clean and reliable copy.',
  'Fast shipping, accurate listing, and the book was exactly as described.',
  'The condition notes matched the actual book perfectly.',
  'One of the better used listings I have purchased online.',
  'The cover art looked great and the pages were in solid condition.',
  'A genuinely useful book and a good marketplace pickup.',
];

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function cleanText(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

const imageUrlCache = new Map<string, string>();

function sanitizePublicId(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
}

function buildCoverPublicId(book: { id: string; isbn13: string | null; isbn10: string | null }) {
  const base = book.isbn13 || book.isbn10 || book.id;
  return sanitizePublicId(`catalog-${base}`);
}

async function uploadCoverImage(imageUrl: string, book: { id: string; isbn13: string | null; isbn10: string | null }) {
  const cached = imageUrlCache.get(imageUrl);
  if (cached) {
    return cached;
  }

  const result = await cloudinary.uploader.upload(imageUrl, {
    folder: CLOUDINARY_FOLDER,
    public_id: buildCoverPublicId(book),
    overwrite: true,
    resource_type: 'image',
  });

  const cloudinaryUrl = result.secure_url || result.url;
  if (!cloudinaryUrl) {
    throw new Error(`Cloudinary upload failed for ${imageUrl}`);
  }

  imageUrlCache.set(imageUrl, cloudinaryUrl);
  return cloudinaryUrl;
}

function deriveBasePrice(msrp: number | null, pages: number | null, isTextbook: boolean) {
  if (msrp && Number.isFinite(msrp) && msrp > 0) {
    return Number(msrp.toFixed(2));
  }

  const computed = isTextbook
    ? 38 + Math.min((pages ?? 320) / 10, 55)
    : 8 + Math.min((pages ?? 320) / 22, 28);
  return Number(computed.toFixed(2));
}

function joinAuthors(
  authors: Array<{ sortOrder: number; author: { name: string } }>,
  fallbackTitle: string,
) {
  const names = authors
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((entry) => entry.author.name.trim())
    .filter(Boolean);

  return names.length > 0 ? names.join(', ') : `Unknown Author for ${fallbackTitle}`;
}

function resolveCategoryName(book: {
  title: string;
  publisher: string | null;
  synopsis: string | null;
  subjects: Array<{ subject: { name: string } }>;
}) {
  const subjectText = book.subjects.map((entry) => entry.subject.name).join(' ');
  const haystack = normalize(
    [book.title, book.publisher, book.synopsis, subjectText].filter(Boolean).join(' '),
  );

  let bestCategory = categorySeeds[0];
  let bestScore = -1;

  for (const category of categorySeeds) {
    const score = category.keywords.reduce((total, keyword) => {
      return total + (haystack.includes(normalize(keyword)) ? 1 : 0);
    }, 0);

    if (score > bestScore) {
      bestCategory = category;
      bestScore = score;
    }
  }

  return bestCategory.name;
}

async function createUsers(seeds: UserSeed[]) {
  const users = [];

  for (const seed of seeds) {
    const user = await prisma.user.create({
      data: {
        name: seed.name,
        email: seed.email,
        password: await bcrypt.hash(seed.password, SALT_ROUNDS),
        role: seed.role,
        phone: seed.phone,
        address: seed.address,
        age: seed.age,
      },
    });
    users.push(user);
  }

  return users;
}

async function main() {
  console.log('Rebuilding marketplace data from imported ISBNdb catalog...');

  const catalogBooks = await prisma.catalogBook.findMany({
    where: {
      OR: [{ imageOriginal: { not: null } }, { image: { not: null } }],
    },
    include: {
      authors: {
        include: { author: true },
        orderBy: { sortOrder: 'asc' },
      },
      subjects: {
        include: { subject: true },
      },
    },
    orderBy: [{ title: 'asc' }, { createdAt: 'asc' }],
  });

  if (catalogBooks.length === 0) {
    throw new Error(
      'No catalog books with images were found. Run the ISBNdb sync first before seeding marketplace data.',
    );
  }

  console.log(`Found ${catalogBooks.length} catalog books with usable cover images.`);

  console.log('Removing old marketplace data...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.review.deleteMany();
  await prisma.book.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  console.log('Old marketplace data removed.');

  console.log('Creating categories...');
  const createdCategories = await Promise.all(
    categorySeeds.map((category) =>
      prisma.category.create({
        data: {
          name: category.name,
          description: category.description,
        },
      }),
    ),
  );
  const categoryMap = new Map(createdCategories.map((category) => [category.name, category.id]));
  console.log(`Created ${createdCategories.length} categories.`);

  console.log('Creating users...');
  const admins = await createUsers(adminSeeds);
  const sellers = await createUsers(sellerSeeds);
  const customers = await createUsers(customerSeeds);
  const reviewUsers = [...customers, ...sellers];
  console.log(`Created ${admins.length} admins, ${sellers.length} sellers, and ${customers.length} customers.`);

  console.log('Creating books from catalog...');
  const createdBooks: Array<{
    id: string;
    price: number;
    isUsed: boolean;
  }> = [];

  let newBookCount = 0;
  let usedBookCount = 0;

  for (const [index, catalogBook] of catalogBooks.entries()) {
    const categoryName = resolveCategoryName({
      title: catalogBook.title,
      publisher: catalogBook.publisher,
      synopsis: catalogBook.synopsis ?? catalogBook.excerpt,
      subjects: catalogBook.subjects,
    });
    const categoryId = categoryMap.get(categoryName);
    if (!categoryId) {
      continue;
    }

    const imageUrl = catalogBook.imageOriginal ?? catalogBook.image;
    if (!imageUrl) {
      continue;
    }

    let cloudinaryUrl: string;
    try {
      cloudinaryUrl = await uploadCoverImage(imageUrl, catalogBook);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Skipping catalog book ${catalogBook.id} due to image upload failure: ${message}`);
      continue;
    }

    const isTextbook = categoryName === 'Textbooks';
    const basePrice = deriveBasePrice(catalogBook.msrp, catalogBook.pages, isTextbook);
    const author = joinAuthors(catalogBook.authors, catalogBook.title);
    const description = cleanText(catalogBook.synopsis) ?? cleanText(catalogBook.excerpt);

    const newBook = await prisma.book.create({
      data: {
        title: catalogBook.title,
        author,
        price: basePrice,
        stock: 5 + (index % 12),
        isbn13: catalogBook.isbn13,
        isbn10: catalogBook.isbn10,
        publisher: cleanText(catalogBook.publisher),
        language: cleanText(catalogBook.language) ?? 'en',
        publishedAt: cleanText(catalogBook.datePublished),
        description,
        image: cloudinaryUrl,
        isUsed: false,
        condition: BookCondition.NEW,
        approvalStatus: null,
        categoryId,
        catalogBookId: catalogBook.id,
      },
      select: { id: true, price: true, isUsed: true },
    });

    createdBooks.push(newBook);
    newBookCount++;

    const createUsedListing = index % 3 !== 1;
    if (!createUsedListing) {
      continue;
    }

    const conditionCycle = [BookCondition.GOOD, BookCondition.FAIR, BookCondition.GOOD, BookCondition.POOR];
    const condition = conditionCycle[index % conditionCycle.length];
    const seller = sellers[index % sellers.length];
    const discount =
      condition === BookCondition.GOOD ? 0.68 : condition === BookCondition.FAIR ? 0.54 : 0.39;

    const usedBook = await prisma.book.create({
      data: {
        title: catalogBook.title,
        author,
        price: Number((basePrice * discount).toFixed(2)),
        stock: 1 + (index % 2),
        isbn13: catalogBook.isbn13,
        isbn10: catalogBook.isbn10,
        publisher: cleanText(catalogBook.publisher),
        language: cleanText(catalogBook.language) ?? 'en',
        publishedAt: cleanText(catalogBook.datePublished),
        description,
        image: cloudinaryUrl,
        isUsed: true,
        condition,
        approvalStatus: ApprovalStatus.APPROVED,
        categoryId,
        sellerId: seller.id,
        catalogBookId: catalogBook.id,
      },
      select: { id: true, price: true, isUsed: true },
    });

    createdBooks.push(usedBook);
    usedBookCount++;
  }

  console.log(`Created ${createdBooks.length} marketplace books (${newBookCount} new, ${usedBookCount} used).`);

  console.log('Creating reviews...');
  const reviewableBooks = await prisma.book.findMany({
    where: { isUsed: false },
    orderBy: { createdAt: 'asc' },
    take: Math.min(120, createdBooks.length),
    select: { id: true },
  });

  let reviewCount = 0;

  for (const [bookIndex, book] of reviewableBooks.entries()) {
    const numberOfReviews = 2 + (bookIndex % 3);
    const usedReviewerIds = new Set<string>();

    for (let i = 0; i < numberOfReviews; i++) {
      const reviewer = reviewUsers[(bookIndex + i) % reviewUsers.length];
      if (usedReviewerIds.has(reviewer.id)) {
        continue;
      }

      await prisma.review.create({
        data: {
          userId: reviewer.id,
          bookId: book.id,
          rating: 3 + ((bookIndex + i) % 3),
          comment: reviewComments[(bookIndex + i) % reviewComments.length],
        },
      });

      usedReviewerIds.add(reviewer.id);
      reviewCount++;
    }
  }
  console.log(`Created ${reviewCount} reviews.`);

  console.log('Creating carts...');
  const shoppableBooks = await prisma.book.findMany({
    where: { isUsed: false, stock: { gt: 0 } },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });

  let cartCount = 0;
  for (const [customerIndex, customer] of customers.slice(0, 6).entries()) {
    const cartSelections = [
      shoppableBooks[(customerIndex * 4) % shoppableBooks.length],
      shoppableBooks[(customerIndex * 4 + 1) % shoppableBooks.length],
      shoppableBooks[(customerIndex * 4 + 2) % shoppableBooks.length],
    ];

    await prisma.cart.create({
      data: {
        userId: customer.id,
        items: {
          create: cartSelections.map((book, itemIndex) => ({
            bookId: book.id,
            quantity: 1 + ((customerIndex + itemIndex) % 2),
          })),
        },
      },
    });

    cartCount++;
  }
  console.log(`Created ${cartCount} carts.`);

  console.log('Creating orders...');
  const orderBooks = await prisma.book.findMany({
    where: { stock: { gt: 0 } },
    orderBy: [{ isUsed: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, price: true },
  });

  let orderCount = 0;
  for (const [customerIndex, customer] of customers.slice(0, 8).entries()) {
    for (let orderOffset = 0; orderOffset < 2; orderOffset++) {
      const statusCycle = [
        OrderStatus.DELIVERED,
        OrderStatus.SHIPPED,
        OrderStatus.PENDING,
        OrderStatus.CANCELLED,
      ];
      const status = statusCycle[(customerIndex + orderOffset) % statusCycle.length];
      const items = [
        orderBooks[(customerIndex * 5 + orderOffset) % orderBooks.length],
        orderBooks[(customerIndex * 5 + orderOffset + 1) % orderBooks.length],
        orderBooks[(customerIndex * 5 + orderOffset + 3) % orderBooks.length],
      ];

      const uniqueItems = Array.from(new Map(items.map((item) => [item.id, item])).values());
      const lineItems = uniqueItems.map((item, itemIndex) => ({
        bookId: item.id,
        quantity: 1 + ((customerIndex + itemIndex + orderOffset) % 2),
        price: item.price,
      }));

      const totalAmount = Number(
        lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2),
      );

      await prisma.order.create({
        data: {
          userId: customer.id,
          status,
          paymentStatus:
            status === OrderStatus.PENDING
              ? PaymentStatus.PENDING
              : status === OrderStatus.CANCELLED
                ? PaymentStatus.REFUNDED
                : PaymentStatus.COMPLETED,
          totalAmount,
          items: {
            create: lineItems,
          },
        },
      });

      orderCount++;
    }
  }
  console.log(`Created ${orderCount} orders.`);

  const [userCount, categoryCount, bookCount, cartTotal, orderTotal, reviewTotal] =
    await Promise.all([
      prisma.user.count(),
      prisma.category.count(),
      prisma.book.count(),
      prisma.cart.count(),
      prisma.order.count(),
      prisma.review.count(),
    ]);

  console.log('Marketplace seeding complete.');
  console.log('Credentials:');
  console.log('  Admin: admin@rebook.com / admin123');
  console.log('  Seller: jane@example.com / seller123');
  console.log('  Customer: john@example.com / customer123');
  console.log('  Test: test@example.com / test123');
  console.log('Summary:');
  console.log(`  Users: ${userCount}`);
  console.log(`  Categories: ${categoryCount}`);
  console.log(`  Books: ${bookCount}`);
  console.log(`  Carts: ${cartTotal}`);
  console.log(`  Orders: ${orderTotal}`);
  console.log(`  Reviews: ${reviewTotal}`);
}

main()
  .catch((error) => {
    console.error('Error seeding marketplace data:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
