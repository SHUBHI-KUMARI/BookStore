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

  public async updateItemQuantity(cartId: string, bookId: string, quantity: number) {
    if (quantity <= 0) {
      return this.removeItem(cartId, bookId);
    }

    return database.prisma.cartItem.update({
      where: {
        cartId_bookId: {
          cartId,
          bookId,
        },
      },
      data: { quantity },
    });
  }

  public async removeItem(cartId: string, bookId: string) {
    return database.prisma.cartItem.delete({
      where: {
        cartId_bookId: {
          cartId,
          bookId,
        },
      },
    });
  }

  public async clearCart(cartId: string) {
    return database.prisma.cartItem.deleteMany({
      where: { cartId },
    });
  }
}
