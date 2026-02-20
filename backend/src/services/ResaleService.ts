import { UsedBook } from '../models/Book';

export class ResaleService {
  public approveListing(bookId: string): void {
    console.log(`Approving resale listing for book ${bookId}`);
  }

  public publishListing(_usedBook: UsedBook): void {
    console.log(`Publishing approved listing for used book`);
  }
}
