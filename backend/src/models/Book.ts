export class Book {
  protected id: string;
  protected title: string;
  protected author: string;
  protected price: number;
  protected category: string;
  protected stock: number;

  constructor(
    id: string,
    title: string,
    author: string,
    price: number,
    category: string,
    stock: number,
  ) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.price = price;
    this.category = category;
    this.stock = stock;
  }

  public updateStock(quantity: number): void {
    this.stock += quantity;
    console.log(`Stock updated for ${this.title}. New stock: ${this.stock}`);
  }

  public getDetails(): Record<string, string | number> {
    return {
      id: this.id,
      title: this.title,
      author: this.author,
      price: this.price,
      category: this.category,
      stock: this.stock,
    };
  }
}

export class UsedBook extends Book {
  private condition: string;
  private sellerId: string;
  private approvalStatus: string;

  constructor(
    id: string,
    title: string,
    author: string,
    price: number,
    category: string,
    stock: number,
    condition: string,
    sellerId: string,
    approvalStatus: string,
  ) {
    super(id, title, author, price, category, stock);
    this.condition = condition;
    this.sellerId = sellerId;
    this.approvalStatus = approvalStatus;
  }

  public submitForApproval(): void {
    this.approvalStatus = 'Pending';
    console.log(`Used book ${this.title} submitted for approval by seller ${this.sellerId}.`);
  }
}
