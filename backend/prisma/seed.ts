import { PrismaClient, Role, BookCondition, ApprovalStatus, OrderStatus, PaymentStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

// Categories data
const categories = [
  { name: 'Fiction & Literature', description: 'Novels, stories, and literary works' },
  { name: 'Science & Technology', description: 'Science, technology, and engineering books' },
  { name: 'Business & Economy', description: 'Business, finance, and economics' },
  { name: 'History & Biography', description: 'Historical accounts and life stories' },
  { name: 'Textbooks', description: 'Educational and academic books' },
  { name: 'Arts & Photography', description: 'Art, design, and photography books' },
  { name: 'Health & Wellness', description: 'Health, fitness, and medical books' },
  { name: 'Children & Young Adult', description: 'Books for children and teens' },
];

// Books data - 60 books with various genres, prices, and conditions
const booksData = [
  // Fiction & Literature
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', price: 12.99, category: 'Fiction & Literature', isUsed: false },
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', price: 14.50, category: 'Fiction & Literature', isUsed: false },
  { title: '1984', author: 'George Orwell', price: 11.99, category: 'Fiction & Literature', isUsed: false },
  { title: 'Pride and Prejudice', author: 'Jane Austen', price: 10.99, category: 'Fiction & Literature', isUsed: false },
  { title: 'The Catcher in the Rye', author: 'J.D. Salinger', price: 13.99, category: 'Fiction & Literature', isUsed: false },
  { title: 'The Alchemist', author: 'Paulo Coelho', price: 15.99, category: 'Fiction & Literature', isUsed: false },
  { title: 'Brave New World', author: 'Aldous Huxley', price: 12.50, category: 'Fiction & Literature', isUsed: false },
  { title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', price: 24.99, category: 'Fiction & Literature', isUsed: false },

  // Used Fiction Books
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', price: 6.50, category: 'Fiction & Literature', isUsed: true, condition: BookCondition.GOOD },
  { title: '1984', author: 'George Orwell', price: 5.99, category: 'Fiction & Literature', isUsed: true, condition: BookCondition.FAIR },
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', price: 7.50, category: 'Fiction & Literature', isUsed: true, condition: BookCondition.GOOD },
  { title: 'Pride and Prejudice', author: 'Jane Austen', price: 4.99, category: 'Fiction & Literature', isUsed: true, condition: BookCondition.POOR },

  // Science & Technology
  { title: 'A Brief History of Time', author: 'Stephen Hawking', price: 18.99, category: 'Science & Technology', isUsed: false },
  { title: 'The Selfish Gene', author: 'Richard Dawkins', price: 16.99, category: 'Science & Technology', isUsed: false },
  { title: 'Sapiens', author: 'Yuval Noah Harari', price: 22.99, category: 'Science & Technology', isUsed: false },
  { title: 'Clean Code', author: 'Robert C. Martin', price: 42.99, category: 'Science & Technology', isUsed: false },
  { title: 'The Pragmatic Programmer', author: 'Andrew Hunt', price: 49.99, category: 'Science & Technology', isUsed: false },
  { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', price: 85.00, category: 'Science & Technology', isUsed: false },
  { title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', price: 29.99, category: 'Science & Technology', isUsed: false },
  { title: 'Design Patterns', author: 'Gang of Four', price: 54.99, category: 'Science & Technology', isUsed: false },

  // Used Tech Books
  { title: 'Clean Code', author: 'Robert C. Martin', price: 25.00, category: 'Science & Technology', isUsed: true, condition: BookCondition.GOOD },
  { title: 'Sapiens', author: 'Yuval Noah Harari', price: 12.99, category: 'Science & Technology', isUsed: true, condition: BookCondition.FAIR },
  { title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', price: 15.99, category: 'Science & Technology', isUsed: true, condition: BookCondition.GOOD },
  { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', price: 45.00, category: 'Science & Technology', isUsed: true, condition: BookCondition.GOOD },

  // Business & Economy
  { title: 'The Intelligent Investor', author: 'Benjamin Graham', price: 21.99, category: 'Business & Economy', isUsed: false },
  { title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', price: 14.99, category: 'Business & Economy', isUsed: false },
  { title: 'Zero to One', author: 'Peter Thiel', price: 18.99, category: 'Business & Economy', isUsed: false },
  { title: 'The Lean Startup', author: 'Eric Ries', price: 16.99, category: 'Business & Economy', isUsed: false },
  { title: 'Think and Grow Rich', author: 'Napoleon Hill', price: 12.99, category: 'Business & Economy', isUsed: false },
  { title: 'Good to Great', author: 'Jim Collins', price: 19.99, category: 'Business & Economy', isUsed: false },
  { title: 'The Psychology of Money', author: 'Morgan Housel', price: 15.99, category: 'Business & Economy', isUsed: false },
  { title: 'Atomic Habits', author: 'James Clear', price: 17.99, category: 'Business & Economy', isUsed: false },

  // Used Business Books
  { title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', price: 8.99, category: 'Business & Economy', isUsed: true, condition: BookCondition.GOOD },
  { title: 'The Lean Startup', author: 'Eric Ries', price: 9.99, category: 'Business & Economy', isUsed: true, condition: BookCondition.FAIR },
  { title: 'Atomic Habits', author: 'James Clear', price: 10.99, category: 'Business & Economy', isUsed: true, condition: BookCondition.GOOD },
  { title: 'The Psychology of Money', author: 'Morgan Housel', price: 8.50, category: 'Business & Economy', isUsed: true, condition: BookCondition.GOOD },
  { title: 'Think and Grow Rich', author: 'Napoleon Hill', price: 6.99, category: 'Business & Economy', isUsed: true, condition: BookCondition.POOR },

  // History & Biography
  { title: 'Becoming', author: 'Michelle Obama', price: 24.99, category: 'History & Biography', isUsed: false },
  { title: 'Steve Jobs', author: 'Walter Isaacson', price: 19.99, category: 'History & Biography', isUsed: false },
  { title: 'The Diary of Anne Frank', author: 'Anne Frank', price: 11.99, category: 'History & Biography', isUsed: false },
  { title: 'Team of Rivals', author: 'Doris Kearns Goodwin', price: 22.99, category: 'History & Biography', isUsed: false },
  { title: 'Unbroken', author: 'Laura Hillenbrand', price: 16.99, category: 'History & Biography', isUsed: false },
  { title: 'The Wright Brothers', author: 'David McCullough', price: 18.99, category: 'History & Biography', isUsed: false },
  { title: 'Hidden Figures', author: 'Margot Lee Shetterly', price: 15.99, category: 'History & Biography', isUsed: false },
  { title: 'Leonardo da Vinci', author: 'Walter Isaacson', price: 21.99, category: 'History & Biography', isUsed: false },

  // Used History Books
  { title: 'Becoming', author: 'Michelle Obama', price: 14.99, category: 'History & Biography', isUsed: true, condition: BookCondition.GOOD },
  { title: 'Steve Jobs', author: 'Walter Isaacson', price: 12.99, category: 'History & Biography', isUsed: true, condition: BookCondition.FAIR },
  { title: 'Unbroken', author: 'Laura Hillenbrand', price: 9.99, category: 'History & Biography', isUsed: true, condition: BookCondition.GOOD },

  // Textbooks
  { title: 'Calculus: Early Transcendentals', author: 'James Stewart', price: 89.99, category: 'Textbooks', isUsed: false },
  { title: 'Campbell Biology', author: 'Jane B. Reece', price: 109.99, category: 'Textbooks', isUsed: false },
  { title: 'Organic Chemistry', author: 'Paula Yurkanis', price: 95.00, category: 'Textbooks', isUsed: false },
  { title: 'Principles of Economics', author: 'N. Gregory Mankiw', price: 79.99, category: 'Textbooks', isUsed: false },
  { title: 'Physics for Scientists and Engineers', author: 'Serway & Jewett', price: 99.99, category: 'Textbooks', isUsed: false },

  // Used Textbooks
  { title: 'Calculus: Early Transcendentals', author: 'James Stewart', price: 45.00, category: 'Textbooks', isUsed: true, condition: BookCondition.FAIR },
  { title: 'Campbell Biology', author: 'Jane B. Reece', price: 55.00, category: 'Textbooks', isUsed: true, condition: BookCondition.GOOD },
  { title: 'Organic Chemistry', author: 'Paula Yurkanis', price: 48.00, category: 'Textbooks', isUsed: true, condition: BookCondition.GOOD },
  { title: 'Principles of Economics', author: 'N. Gregory Mankiw', price: 40.00, category: 'Textbooks', isUsed: true, condition: BookCondition.FAIR },

  // Arts & Photography
  { title: 'The Story of Art', author: 'E.H. Gombrich', price: 35.99, category: 'Arts & Photography', isUsed: false },
  { title: 'Understanding Comics', author: 'Scott McCloud', price: 18.99, category: 'Arts & Photography', isUsed: false },
  { title: 'Color and Light', author: 'James Gurney', price: 24.99, category: 'Arts & Photography', isUsed: false },
  { title: 'The Artist\'s Way', author: 'Julia Cameron', price: 19.99, category: 'Arts & Photography', isUsed: false },

  // Used Arts Books
  { title: 'The Story of Art', author: 'E.H. Gombrich', price: 22.00, category: 'Arts & Photography', isUsed: true, condition: BookCondition.GOOD },
  { title: 'The Artist\'s Way', author: 'Julia Cameron', price: 12.99, category: 'Arts & Photography', isUsed: true, condition: BookCondition.FAIR },

  // Health & Wellness
  { title: 'The Body Keeps the Score', author: 'Bessel van der Kolk', price: 18.99, category: 'Health & Wellness', isUsed: false },
  { title: 'Why We Sleep', author: 'Matthew Walker', price: 16.99, category: 'Health & Wellness', isUsed: false },
  { title: 'The Blue Zones', author: 'Dan Buettner', price: 15.99, category: 'Health & Wellness', isUsed: false },
  { title: 'How Not to Die', author: 'Michael Greger', price: 19.99, category: 'Health & Wellness', isUsed: false },

  // Used Health Books
  { title: 'The Body Keeps the Score', author: 'Bessel van der Kolk', price: 10.99, category: 'Health & Wellness', isUsed: true, condition: BookCondition.GOOD },
  { title: 'Why We Sleep', author: 'Matthew Walker', price: 9.99, category: 'Health & Wellness', isUsed: true, condition: BookCondition.GOOD },

  // Children & Young Adult
  { title: 'Harry Potter and the Sorcerer\'s Stone', author: 'J.K. Rowling', price: 14.99, category: 'Children & Young Adult', isUsed: false },
  { title: 'The Hunger Games', author: 'Suzanne Collins', price: 12.99, category: 'Children & Young Adult', isUsed: false },
  { title: 'The Fault in Our Stars', author: 'John Green', price: 11.99, category: 'Children & Young Adult', isUsed: false },
  { title: 'Charlotte\'s Web', author: 'E.B. White', price: 9.99, category: 'Children & Young Adult', isUsed: false },
  { title: 'Percy Jackson: The Lightning Thief', author: 'Rick Riordan', price: 10.99, category: 'Children & Young Adult', isUsed: false },

  // Used Children Books
  { title: 'Harry Potter and the Sorcerer\'s Stone', author: 'J.K. Rowling', price: 7.99, category: 'Children & Young Adult', isUsed: true, condition: BookCondition.GOOD },
  { title: 'The Hunger Games', author: 'Suzanne Collins', price: 6.99, category: 'Children & Young Adult', isUsed: true, condition: BookCondition.FAIR },
  { title: 'Percy Jackson: The Lightning Thief', author: 'Rick Riordan', price: 5.99, category: 'Children & Young Adult', isUsed: true, condition: BookCondition.GOOD },
];

// Sample reviews data
const reviewComments = [
  'Excellent book! Highly recommended.',
  'A masterpiece. Could not put it down.',
  'Great read, very informative.',
  'Changed my perspective on life.',
  'Good content but could be shorter.',
  'Well written and engaging throughout.',
  'Not what I expected, but still good.',
  'A must-read for everyone.',
  'Okay book, nothing special.',
  'Absolutely loved it!',
  'Very insightful and practical.',
  'Classic for a reason.',
];

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // Clean existing data
  console.log('Cleaning existing data...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.review.deleteMany();
  await prisma.book.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  console.log('✓ Cleaned existing data\n');

  // Create users
  console.log('Creating users...');
  const adminPassword = await bcrypt.hash('admin123', SALT_ROUNDS);
  const customerPassword = await bcrypt.hash('customer123', SALT_ROUNDS);
  const sellerPassword = await bcrypt.hash('seller123', SALT_ROUNDS);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@rebook.com',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log(`✓ Created admin: ${admin.email} / password: admin123`);

  const customer = await prisma.user.create({
    data: {
      name: 'John Customer',
      email: 'john@example.com',
      password: customerPassword,
      role: Role.CUSTOMER,
    },
  });
  console.log(`✓ Created customer: ${customer.email} / password: customer123`);

  const seller = await prisma.user.create({
    data: {
      name: 'Jane Seller',
      email: 'jane@example.com',
      password: sellerPassword,
      role: Role.CUSTOMER,
    },
  });
  console.log(`✓ Created seller: ${seller.email} / password: seller123`);

  const testUser = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@example.com',
      password: await bcrypt.hash('test123', SALT_ROUNDS),
      role: Role.CUSTOMER,
    },
  });
  console.log(`✓ Created test user: ${testUser.email} / password: test123\n`);

  // Create categories
  console.log('Creating categories...');
  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.category.create({
      data: cat,
    });
    categoryMap[cat.name] = created.id;
    console.log(`  ✓ Created category: ${cat.name}`);
  }
  console.log();

  // Create books
  console.log('Creating books...');
  const createdBooks: Array<{ id: string; title: string; isUsed: boolean }> = [];
  let newCount = 0;
  let usedCount = 0;

  for (const book of booksData) {
    const categoryId = categoryMap[book.category];
    if (!categoryId) {
      console.warn(`Skipping book with unknown category: ${book.category}`);
      continue;
    }

    const stock = Math.floor(Math.random() * 20) + 5; // Random stock 5-25

    const created = await prisma.book.create({
      data: {
        title: book.title,
        author: book.author,
        price: book.price,
        stock: stock,
        isUsed: book.isUsed,
        condition: book.condition || BookCondition.NEW,
        approvalStatus: book.isUsed ? ApprovalStatus.APPROVED : null,
        categoryId: categoryId,
        sellerId: book.isUsed ? seller.id : null,
      },
    });

    createdBooks.push({ id: created.id, title: created.title, isUsed: created.isUsed });

    if (book.isUsed) {
      usedCount++;
    } else {
      newCount++;
    }
  }

  console.log(`✓ Created ${newCount} new books`);
  console.log(`✓ Created ${usedCount} used books`);
  console.log(`✓ Total: ${createdBooks.length} books\n`);

  // Create reviews
  console.log('Creating reviews...');
  let reviewCount = 0;
  const users = [customer, seller, testUser];

  for (const book of createdBooks.slice(0, 40)) { // Add reviews to first 40 books
    const numReviews = Math.floor(Math.random() * 4) + 1; // 1-4 reviews per book

    for (let i = 0; i < numReviews; i++) {
      const reviewer = users[Math.floor(Math.random() * users.length)];
      const rating = Math.floor(Math.random() * 3) + 3; // Rating 3-5
      const comment = reviewComments[Math.floor(Math.random() * reviewComments.length)];

      try {
        await prisma.review.create({
          data: {
            rating,
            comment,
            userId: reviewer.id,
            bookId: book.id,
          },
        });
        reviewCount++;
      } catch {
        // Skip if duplicate review (user already reviewed this book)
      }
    }
  }
  console.log(`✓ Created ${reviewCount} reviews\n`);

  // Create carts
  console.log('Creating carts...');
  const newBooks = createdBooks.filter(b => !b.isUsed);

  // Customer cart with some items
  const customerCart = await prisma.cart.create({
    data: {
      userId: customer.id,
      items: {
        create: [
          { bookId: newBooks[0].id, quantity: 2 },
          { bookId: newBooks[1].id, quantity: 1 },
          { bookId: newBooks[2].id, quantity: 1 },
        ],
      },
    },
  });
  console.log(`✓ Created cart for customer with 3 items\n`);

  // Create orders
  console.log('Creating orders...');

  // Order 1: Completed order
  const order1Books = [newBooks[3], newBooks[4], newBooks[5]];
  const order1Total = order1Books.reduce((sum, b) => {
    const book = booksData.find(book => book.title === b.title && !book.isUsed);
    return sum + (book?.price || 0) * (Math.floor(Math.random() * 2) + 1);
  }, 0);

  const order1 = await prisma.order.create({
    data: {
      userId: customer.id,
      status: OrderStatus.DELIVERED,
      totalAmount: order1Total,
      paymentStatus: PaymentStatus.COMPLETED,
      items: {
        create: order1Books.map(b => ({
          bookId: b.id,
          quantity: Math.floor(Math.random() * 2) + 1,
          price: booksData.find(book => book.title === b.title && !book.isUsed)?.price || 0,
        })),
      },
    },
  });
  console.log(`✓ Created completed order #${order1.id.slice(0, 8)} for customer`);

  // Order 2: Pending order
  const order2Books = [newBooks[6], newBooks[7]];
  const order2Total = order2Books.reduce((sum, b) => {
    const book = booksData.find(book => book.title === b.title && !book.isUsed);
    return sum + (book?.price || 0);
  }, 0);

  const order2 = await prisma.order.create({
    data: {
      userId: customer.id,
      status: OrderStatus.PENDING,
      totalAmount: order2Total,
      paymentStatus: PaymentStatus.PENDING,
      items: {
        create: order2Books.map(b => ({
          bookId: b.id,
          quantity: 1,
          price: booksData.find(book => book.title === b.title && !book.isUsed)?.price || 0,
        })),
      },
    },
  });
  console.log(`✓ Created pending order #${order2.id.slice(0, 8)} for customer`);

  // Order 3: Shipped order for test user
  const order3Books = [newBooks[8], newBooks[9], newBooks[10], newBooks[11]];
  const order3Total = order3Books.reduce((sum, b) => {
    const book = booksData.find(book => book.title === b.title && !book.isUsed);
    return sum + (book?.price || 0) * 2;
  }, 0);

  const order3 = await prisma.order.create({
    data: {
      userId: testUser.id,
      status: OrderStatus.SHIPPED,
      totalAmount: order3Total,
      paymentStatus: PaymentStatus.COMPLETED,
      items: {
        create: order3Books.map(b => ({
          bookId: b.id,
          quantity: 2,
          price: booksData.find(book => book.title === b.title && !book.isUsed)?.price || 0,
        })),
      },
    },
  });
  console.log(`✓ Created shipped order #${order3.id.slice(0, 8)} for test user\n`);

  // Summary
  console.log('=================================');
  console.log('🎉 Database seeding completed!');
  console.log('=================================');
  console.log('\nCredentials:');
  console.log('  Admin:    admin@rebook.com / admin123');
  console.log('  Customer: john@example.com / customer123');
  console.log('  Seller:   jane@example.com / seller123');
  console.log('  Test:     test@example.com / test123');
  console.log('\nSummary:');
  console.log(`  • ${categories.length} categories`);
  console.log(`  • ${createdBooks.length} books (${newCount} new, ${usedCount} used)`);
  console.log(`  • ${reviewCount} reviews`);
  console.log(`  • ${4} users`);
  console.log(`  • ${3} orders`);
  console.log(`  • ${1} cart with items`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
