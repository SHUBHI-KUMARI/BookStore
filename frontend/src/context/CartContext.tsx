import {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { cartService, type Cart } from "../services/cartService";
import { useAuth } from "../hooks/useAuth";

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  isLoading: boolean;
  addToCart: (bookId: string, quantity?: number) => Promise<void>;
  removeFromCart: (bookId: string) => Promise<void>;
  updateQuantity: (bookId: string, quantity: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  clearCartLocally: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext<CartContextType | undefined>(
  undefined,
);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const itemCount =
    cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    setIsLoading(true);
    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Load cart whenever authentication state changes
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (bookId: string, quantity = 1) => {
    setIsLoading(true);
    try {
      const updated = await cartService.addToCart(bookId, quantity);
      setCart(updated);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (bookId: string) => {
    setIsLoading(true);
    try {
      const updated = await cartService.removeItem(bookId);
      setCart(updated);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (bookId: string, quantity: number) => {
    setIsLoading(true);
    try {
      const updated = await cartService.updateItem(bookId, quantity);
      setCart(updated);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCartLocally = () => setCart(null);

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        refreshCart,
        clearCartLocally,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
