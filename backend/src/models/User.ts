export class User {
  protected id: string;
  protected name: string;
  protected email: string;
  protected role: string;

  constructor(id: string, name: string, email: string, role: string) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;
  }

  public login(): void {
    console.log(`${this.name} logged in.`);
  }

  public logout(): void {
    console.log(`${this.name} logged out.`);
  }
}

export class Customer extends User {
  constructor(id: string, name: string, email: string) {
    super(id, name, email, 'Customer');
  }

  public addToCart(bookId: string): void {
    console.log(`Customer ${this.name} added book to cart: ${bookId}`);
  }

  public placeOrder(): void {
    console.log(`Customer ${this.name} placed an order.`);
  }

  public listUsedBook(): void {
    console.log(`Customer ${this.name} listed a used book.`);
  }

  public writeReview(bookId: string, rating: number, _comment: string): void {
    console.log(`Customer ${this.name} wrote a review for ${bookId}: ${rating}`);
  }
}

export class Admin extends User {
  constructor(id: string, name: string, email: string) {
    super(id, name, email, 'Admin');
  }

  public approveListing(bookId: string): void {
    console.log(`Admin approved listing for book: ${bookId}`);
  }

  public rejectListing(bookId: string): void {
    console.log(`Admin rejected listing for book: ${bookId}`);
  }

  public addBook(_bookDetails: Record<string, unknown>): void {
    console.log(`Admin added a new book.`);
  }

  public manageUsers(): void {
    console.log(`Admin manages users.`);
  }
}
