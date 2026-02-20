export class CartItem {
  private bookId: string;
  private quantity: number;
  private pricePerUnit: number;

  constructor(bookId: string, quantity: number, pricePerUnit: number) {
    this.bookId = bookId;
    this.quantity = quantity;
    this.pricePerUnit = pricePerUnit;
  }

  public getSubtotal(): number {
    return this.quantity * this.pricePerUnit;
  }
}

export class Cart {
  private id: string;
  private userId: string;
  private items: CartItem[];

  constructor(id: string, userId: string) {
    this.id = id;
    this.userId = userId;
    this.items = [];
  }

  public addItem(item: CartItem): void {
    this.items.push(item);
    console.log(`Item added to cart ${this.id}`);
  }

  public removeItem(bookId: string): void {
    console.log(`Removed item with bookId: ${bookId}`);
  }

  public calculateTotal(): number {
    return this.items.reduce((total, item) => total + item.getSubtotal(), 0);
  }
}
