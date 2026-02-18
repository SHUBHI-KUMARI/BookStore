import { PrismaClient } from '@prisma/client';

class Database {
  private static instance: Database;
  public prisma: PrismaClient;

  // Private constructor ensures singleton pattern
  private constructor() {
    this.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  // Method to gain access to the DB instance globally
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  // OOP method to specifically connect to the database explicitly
  public async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      console.log('📦 Successfully connected to the database (Supabase via Prisma).');
    } catch (error) {
      console.error('❌ Failed to connect to the database:', error);
      process.exit(1);
    }
  }

  // Method to safely disconnect
  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      console.log('📦 Safely disconnected from the database.');
    } catch (error) {
      console.error('❌ Error disconnecting from the database:', error);
    }
  }
}

export default Database.getInstance();
