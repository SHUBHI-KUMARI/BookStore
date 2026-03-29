import React, { useState } from 'react';
import { Minus, Plus, Trash2, ArrowRight, Tag, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

// --- MOCK DATA ---
const INITIAL_CART = [
  {
    id: 'c1',
    bookId: 'b1',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    price: 18.99,
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
    condition: 'NEW' as const,
    quantity: 1,
  },
  {
    id: 'c2',
    bookId: 'u2',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    price: 11.20,
    coverUrl: 'https://images.unsplash.com/photo-1614544048536-0d28caf77f41?auto=format&fit=crop&q=80&w=600',
    condition: 'USED' as const,
    conditionDetail: 'Mint',
    quantity: 1,
  }
];

export const Cart = () => {
  const [cartItems, setCartItems] = useState(INITIAL_CART);
  const [couponCode, setCouponCode] = useState('');
  const navigate = useNavigate();

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(items =>
      items.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const delivery = subtotal > 50 ? 0 : 5.99; // Free delivery over $50
  const isCartEmpty = cartItems.length === 0;

  return (
    <div className="bg-[var(--color-brand-cream)]/30 min-h-screen pb-24">
      {/* HEADER */}
      <div className="bg-white border-b border-black/5 pt-10 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-serif font-black text-[var(--color-brand-dark-blue)] tracking-tight">Your Cart</h1>
          <p className="text-[var(--color-brand-brown)] mt-2">
            {!isCartEmpty ? `You have ${cartItems.length} items in your cart.` : 'Your cart is currently empty.'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isCartEmpty ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-black/5 flex flex-col items-center">
            <div className="w-24 h-24 bg-[var(--color-brand-cream)] rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-10 h-10 text-[var(--color-brand-muted-orange)]" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-brand-dark-blue)] mb-3">Your cart is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Looks like you haven't added any books yet. Discover your next great read in our marketplace.
            </p>
            <Link to="/books">
              <Button size="lg">Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10">
            {/* LEFT: CART ITEMS */}
            <div className="flex-1 space-y-6">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-black/5 flex flex-col sm:flex-row items-center sm:items-start gap-6 transition-all hover:shadow-md">
                  {/* Image */}
                  <Link to={`/books/${item.bookId}`} className="shrink-0 relative w-32 h-40 bg-gray-50 flex items-center justify-center rounded-xl overflow-hidden group">
                    <img 
                      src={item.coverUrl} 
                      alt={item.title} 
                      className="h-full w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform" 
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left w-full">
                    <div className="flex flex-col sm:flex-row sm:justify-between w-full gap-2 mb-2">
                       <div>
                         <Link to={`/books/${item.bookId}`} className="hover:text-[var(--color-brand-muted-orange)] transition-colors">
                           <h3 className="text-xl font-bold text-[var(--color-brand-dark-blue)]">{item.title}</h3>
                         </Link>
                         <p className="text-[var(--color-brand-brown)] text-sm">{item.author}</p>
                       </div>
                       <span className="text-xl font-bold text-[var(--color-brand-dark-blue)]">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>

                    <div className="mb-6 flex justify-center sm:justify-start">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                        item.condition === 'NEW' 
                          ? 'bg-[var(--color-brand-muted-orange)]/10 text-[var(--color-brand-muted-orange)]' 
                          : 'bg-[var(--color-brand-dark-blue)]/10 text-[var(--color-brand-dark-blue)]'
                      }`}>
                        {item.condition} {item.conditionDetail ? `• ${item.conditionDetail}` : ''}
                      </span>
                    </div>

                    {/* Actions: Qty & Remove */}
                    <div className="flex items-center justify-between w-full mt-auto pt-4 border-t border-gray-50">
                      <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-2 text-gray-500 hover:text-[var(--color-brand-dark-blue)] hover:bg-gray-100 rounded-l-lg transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-bold text-[var(--color-brand-dark-blue)] select-none">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-2 text-gray-500 hover:text-[var(--color-brand-dark-blue)] hover:bg-gray-100 rounded-r-lg transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 flex items-center gap-1.5 text-sm font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT: ORDER SUMMARY */}
            <div className="w-full lg:w-96 shrink-0">
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-black/5 sticky top-24">
                <h2 className="text-xl font-bold text-[var(--color-brand-dark-blue)] mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItems.reduce((a, b) => a + b.quantity, 0)} items)</span>
                    <span className="font-medium text-[var(--color-brand-dark-blue)]">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="font-medium text-[var(--color-brand-dark-blue)]">
                      {delivery === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `$${delivery.toFixed(2)}`}
                    </span>
                  </div>
                  
                  <hr className="border-gray-100 my-4" />
                  
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-bold text-[var(--color-brand-dark-blue)]">Total</span>
                    <span className="font-black text-2xl text-[var(--color-brand-dark-blue)]">
                      ${(subtotal + delivery).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Coupon Code */}
                <div className="mb-8">
                  <label className="text-xs font-bold text-[var(--color-brand-dark-blue)] mb-2 block uppercase tracking-wider">Gift Card or Promo Code</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-muted-orange)]"
                        placeholder="Enter code"
                      />
                    </div>
                    <Button variant="outline" size="sm" className="px-4">Apply</Button>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full group" 
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <div className="mt-6 text-center text-xs text-gray-500">
                  <p>Secure checkout powered by ReBook. 30-day money-back guarantee.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
