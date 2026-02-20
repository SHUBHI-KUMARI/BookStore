export class Review {
  private id: string;
  private rating: number;
  private comment: string;
  private userId: string;
  private bookId: string;

  constructor(id: string, rating: number, comment: string, userId: string, bookId: string) {
    this.id = id;
    this.rating = rating;
    this.comment = comment;
    this.userId = userId;
    this.bookId = bookId;
  }

  public submitReview(): void {
    console.log(`Review ${this.id} for book ${this.bookId} by user ${this.userId} submitted.`);
  }
}
