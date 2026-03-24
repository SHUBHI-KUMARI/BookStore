import React from 'react';
import { ShoppingCart, User, Menu, Search, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full bg-[var(--color-brand-cream)] border-b border-black/5 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 transition-transform hover:scale-105">
            <BookOpen className="h-8 w-8 text-[var(--color-brand-muted-orange)]" />
            <span className="font-serif text-2xl font-black text-[var(--color-brand-dark-blue)] tracking-tight">ReBook</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/books" className="text-[var(--color-brand-brown)] font-medium hover:text-[var(--color-brand-dark-blue)] transition-colors">
              New Arrivals
            </Link>
            <Link to="/used-books" className="text-[var(--color-brand-brown)] font-medium hover:text-[var(--color-brand-dark-blue)] transition-colors">
              Used Books
            </Link>
            <Link to="/sell" className="text-[var(--color-brand-muted-orange)] font-bold hover:text-opacity-80 transition-colors">
              Sell Yours
            </Link>
          </div>

          {/* Desktop Action Icons */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="relative group cursor-pointer">
              <Search className="h-5 w-5 text-gray-500 hover:text-[var(--color-brand-dark-blue)] transition-colors" />
            </div>
            
            <Link to="/cart" className="relative group p-2 hover:bg-black/5 rounded-full transition-colors">
              <ShoppingCart className="h-5 w-5 text-[var(--color-brand-dark-blue)]" />
              <span className="absolute top-0 right-0 inline-flex items-center justify-center h-4 w-4 rounded-full bg-[var(--color-brand-muted-orange)] text-xs font-bold text-white shadow">
                2
              </span>
            </Link>

            <Link to="/login">
              <Button size="sm" variant="outline" className="hidden lg:flex items-center gap-2">
                <User className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-4">
             <Link to="/cart" className="relative p-2">
              <ShoppingCart className="h-5 w-5 text-[var(--color-brand-dark-blue)]" />
            </Link>
            <button className="text-gray-500 hover:text-[var(--color-brand-dark-blue)] p-2">
              <Menu className="h-6 w-6" />
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
