import React, { useState } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Star, SlidersHorizontal, X } from 'lucide-react';
import { BookCard } from '../components/books/BookCard';
import { Button } from '../components/ui/Button';

// --- MOCK DATA ---
const MOCK_BOOKS = [
  { id: 'b1', title: 'The Midnight Library', author: 'Matt Haig', price: 18.99, coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600', condition: 'NEW' as const, rating: 5 },
  { id: 'b2', title: 'Atomic Habits', author: 'James Clear', price: 16.50, coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600', condition: 'NEW' as const, rating: 5 },
  { id: 'b3', title: 'Dune', author: 'Frank Herbert', price: 14.99, coverUrl: 'https://images.unsplash.com/photo-1614544048536-0d28caf77f41?auto=format&fit=crop&q=80&w=600', condition: 'NEW' as const, rating: 4 },
  { id: 'b4', title: 'The Psychology of Money', author: 'Morgan Housel', price: 15.00, coverUrl: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=600', condition: 'NEW' as const, rating: 5 },
  { id: 'u1', title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', price: 9.50, coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600', condition: 'USED' as const, conditionDetail: 'Good' as const, rating: 4 },
  { id: 'u2', title: 'Project Hail Mary', author: 'Andy Weir', price: 11.20, coverUrl: 'https://images.unsplash.com/photo-1614544048536-0d28caf77f41?auto=format&fit=crop&q=80&w=600', condition: 'USED' as const, conditionDetail: 'Mint' as const, rating: 5 },
  { id: 'u3', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', price: 8.00, coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600', condition: 'USED' as const, conditionDetail: 'Fair' as const, rating: 4 },
  { id: 'u4', title: '1984', author: 'George Orwell', price: 5.50, coverUrl: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=600', condition: 'USED' as const, conditionDetail: 'Good' as const, rating: 4 },
  { id: 'b5', title: 'Educated', author: 'Tara Westover', price: 12.99, coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600', condition: 'NEW' as const, rating: 5 },
  { id: 'u5', title: 'The Alchemist', author: 'Paulo Coelho', price: 6.50, coverUrl: 'https://images.unsplash.com/photo-1614544048536-0d28caf77f41?auto=format&fit=crop&q=80&w=600', condition: 'USED' as const, conditionDetail: 'Poor' as const, rating: 3 },
];

const CATEGORIES = ['All Categories', 'Fiction & Literature', 'Science & Tech', 'Business & Economy', 'History & Bio', 'Textbooks'];
const CONDITIONS = ['Any', 'New', 'Used - Mint', 'Used - Good', 'Used - Fair', 'Used - Poor'];

export const Books = () => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState('All Categories');
  
  return (
    <div className="bg-[var(--color-brand-cream)]/30 min-h-screen pb-20">
      {/* PAGE HEADER */}
      <div className="bg-white border-b border-black/5 pt-10 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-sm text-gray-500 mb-4">
            <span>Home</span> <span className="mx-2">/</span> <span className="text-[var(--color-brand-dark-blue)] font-medium">Browse Books</span>
          </div>
          <h1 className="text-4xl font-serif font-black text-[var(--color-brand-dark-blue)] tracking-tight">All Books</h1>
          <p className="text-[var(--color-brand-brown)] mt-2">Explore our collection of new and pre-loved books.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* MOBILE FILTER OVERLAY */}
        <div className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${isMobileFilterOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileFilterOpen(false)} />
        
        {/* SIDEBAR FILTERS */}
        <aside className={`fixed lg:static top-0 left-0 h-full lg:h-auto w-3/4 max-w-sm lg:w-64 bg-white lg:bg-transparent shadow-2xl lg:shadow-none z-50 lg:z-0 transform transition-transform duration-300 overflow-y-auto lg:overflow-visible ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="p-6 lg:p-0">
            <div className="flex items-center justify-between lg:hidden mb-6">
              <h2 className="text-xl font-bold text-[var(--color-brand-dark-blue)]">Filters</h2>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 -mr-2 text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Category Filter */}
            <div className="mb-8">
              <h3 className="font-bold text-[var(--color-brand-dark-blue)] mb-4 uppercase text-sm tracking-wider">Categories</h3>
              <ul className="space-y-3">
                {CATEGORIES.map(category => (
                  <li key={category}>
                    <button 
                      onClick={() => setActiveCategory(category)}
                      className={`text-sm w-full text-left transition-colors ${activeCategory === category ? 'text-[var(--color-brand-muted-orange)] font-bold' : 'text-gray-600 hover:text-[var(--color-brand-dark-blue)]'}`}
                    >
                      {category}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <hr className="border-black/5 my-6" />

            {/* Price Filter */}
            <div className="mb-8">
              <h3 className="font-bold text-[var(--color-brand-dark-blue)] mb-4 uppercase text-sm tracking-wider">Price Range</h3>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Min" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-muted-orange)]" />
                <span className="text-gray-400">-</span>
                <input type="number" placeholder="Max" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-muted-orange)]" />
              </div>
            </div>

            <hr className="border-black/5 my-6" />

            {/* Condition Filter */}
            <div className="mb-8">
              <h3 className="font-bold text-[var(--color-brand-dark-blue)] mb-4 uppercase text-sm tracking-wider">Condition</h3>
              <div className="space-y-3">
                {CONDITIONS.map((cond, idx) => (
                  <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="condition" className="w-4 h-4 text-[var(--color-brand-muted-orange)] border-gray-300 focus:ring-[var(--color-brand-muted-orange)] cursor-pointer" defaultChecked={idx === 0} />
                    <span className="text-sm text-gray-600 group-hover:text-[var(--color-brand-dark-blue)]">{cond}</span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="border-black/5 my-6" />

            {/* Rating Filter */}
            <div className="mb-8">
              <h3 className="font-bold text-[var(--color-brand-dark-blue)] mb-4 uppercase text-sm tracking-wider">Minimum Rating</h3>
              <div className="space-y-3">
                {[4, 3, 2, 1].map((rating) => (
                  <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="rating" className="w-4 h-4 text-[var(--color-brand-muted-orange)] border-gray-300 focus:ring-[var(--color-brand-muted-orange)] cursor-pointer" />
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                      ))}
                      <span className="text-sm text-gray-500 ml-1">& Up</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <Button className="w-full lg:hidden mb-6" onClick={() => setIsMobileFilterOpen(false)}>Apply Filters</Button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0">
          
          {/* Toolbar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-black/5 flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
            
            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
              <Button variant="outline" size="sm" className="lg:hidden shrink-0" onClick={() => setIsMobileFilterOpen(true)}>
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <div className="text-sm text-[var(--color-brand-brown)] font-medium">
                Showing <span className="text-[var(--color-brand-dark-blue)]">1–10</span> of 145 results
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search books..." 
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-muted-orange)] focus:bg-white transition-colors"
                />
              </div>
              
              {/* Sort */}
              <div className="relative w-full sm:w-48">
                <select className="w-full appearance-none pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[var(--color-brand-dark-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-muted-orange)] focus:bg-white transition-colors cursor-pointer">
                  <option value="relevance">Sort by: Relevance</option>
                  <option value="newest">Sort by: Newest Arrivals</option>
                  <option value="price_low">Sort by: Price (Low to High)</option>
                  <option value="price_high">Sort by: Price (High to Low)</option>
                  <option value="rating">Sort by: Average Rating</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Book Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {MOCK_BOOKS.map((book) => (
              <BookCard key={book.id} {...book} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-12 flex items-center justify-center gap-2">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-200 rounded-lg bg-white text-gray-500 hover:bg-gray-50 hover:text-[var(--color-brand-dark-blue)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {[1, 2, 3, '...', 15].map((page, idx) => (
              <button 
                key={idx}
                className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                  currentPage === page 
                    ? 'bg-[var(--color-brand-dark-blue)] text-white' 
                    : page === '...'
                      ? 'text-gray-400 cursor-default'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-[var(--color-brand-dark-blue)]'
                }`}
                onClick={() => typeof page === 'number' && setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button 
              onClick={() => setCurrentPage(currentPage + 1)}
              className="p-2 border border-gray-200 rounded-lg bg-white text-gray-500 hover:bg-gray-50 hover:text-[var(--color-brand-dark-blue)] transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        </main>
      </div>
    </div>
  );
};

export default Books;
