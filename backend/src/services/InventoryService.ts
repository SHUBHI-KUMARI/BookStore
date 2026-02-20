export class InventoryService {
  public checkStock(bookId: string, quantity: number): boolean {
    console.log(`Checking stock for book ${bookId}. Needed: ${quantity}`);
    return true; // Mock return
  }

  public reduceStock(bookId: string, quantity: number): void {
    console.log(`Reducing stock for book ${bookId} by ${quantity}`);
  }
}
