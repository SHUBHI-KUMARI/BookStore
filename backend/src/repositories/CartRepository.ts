import database from '../config/database';

export class CartRepository {
  public async findOrCreateCart(userId: string) {
    let cart = await database.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { book: true } } },
    });

    if (!cart) {
      cart = await database.prisma.cart.create({
        data: { userId },
        include: { items: { include: { book: true } } },
      });
    }

    return cart;
  }

  public async addItem(cartId: string, bookId: string, quantity: number) {
    // Upsert logic for adding items
    return database.prisma.cartItem.upsert({
      where: { cartId_bookId: { cartId, bookId } },
      update: { quantity: { increment: quantity } },
      create: { cartId, bookId, quantity },
    });
  }

  public async clearCart(cartId: string) {
    return database.prisma.cartItem.deleteMany({
      where: { cartId },
    });
  }
}
