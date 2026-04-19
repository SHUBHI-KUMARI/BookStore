import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Star,
  SlidersHorizontal,
  X,
  Loader2,
} from "lucide-react";
import { BookCard } from "../components/books/BookCard";
import { Button } from "../components/ui/Button";
import { bookService, type Book } from "../services/bookService";
import api from "../services/api";

interface Category {
  id: string;
  name: string;
}

const PLACEHOLDER_COVERS = [
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1614544048536-0d28caf77f41?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=600",
];

const CONDITIONS = [
  { value: "", label: "Any" },
  { value: "NEW", label: "New" },
  { value: "GOOD", label: "Used - Good" },
  { value: "FAIR", label: "Used - Fair" },
  { value: "POOR", label: "Used - Poor" },
];

export const Books = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalResults, setTotalResults] = useState(0);

  // Filter states - initialized from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "");
  const [activeCondition, setActiveCondition] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("relevance");

  // Parse isUsed from URL
  const isUsedParam = searchParams.get("isUsed");
  useEffect(() => {
    if (isUsedParam === "true") {
      setActiveCondition("GOOD"); // Default to showing used books
    }
  }, [isUsedParam]);

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (activeCategory) params.set("category", activeCategory);
    if (activeCondition && activeCondition !== "NEW") params.set("condition", activeCondition);
    if (isUsedParam === "true") params.set("isUsed", "true");
    setSearchParams(params, { replace: true });
  }, [searchQuery, activeCategory, activeCondition, isUsedParam]);

  const itemsPerPage = 12;

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch {
        // Keep empty categories
      }
    };
    fetchCategories();
  }, []);

  // Fetch books with filters
  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const filters: {
        q?: string;
        category?: string;
        condition?: string;
        isUsed?: boolean;
      } = {};

      if (searchQuery) filters.q = searchQuery;
      if (activeCategory) filters.category = activeCategory;
      if (activeCondition) {
        filters.condition = activeCondition;
        if (activeCondition !== "NEW") {
          filters.isUsed = true;
        }
      }

      const data = await bookService.getAll(filters);

      // Client-side filtering for price and rating (since backend may not support)
      let filteredData = data;

      if (minPrice) {
        filteredData = filteredData.filter(b => b.price >= parseFloat(minPrice));
      }
      if (maxPrice) {
        filteredData = filteredData.filter(b => b.price <= parseFloat(maxPrice));
      }
      if (minRating > 0) {
        filteredData = filteredData.filter(b => (b.averageRating || 0) >= minRating);
      }

      // Sorting
      if (sortBy === "price_low") {
        filteredData.sort((a, b) => a.price - b.price);
      } else if (sortBy === "price_high") {
        filteredData.sort((a, b) => b.price - a.price);
      } else if (sortBy === "rating") {
        filteredData.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
      } else if (sortBy === "newest") {
        filteredData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      setBooks(filteredData);
      setTotalResults(filteredData.length);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Failed to load books. Please try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, activeCategory, activeCondition, minPrice, maxPrice, minRating, sortBy]);

  // Fetch books when filters change
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Pagination
  const totalPages = Math.ceil(totalResults / itemsPerPage);
  const paginatedBooks = books.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getCoverUrl = (book: Book) => {
    return PLACEHOLDER_COVERS[book.title.charCodeAt(0) % PLACEHOLDER_COVERS.length];
  };

  const getConditionDisplay = (book: Book) => {
    if (book.isUsed) {
      return {
        condition: "USED" as const,
        conditionDetail: book.condition as "Mint" | "Good" | "Fair" | "Poor",
      };
    }
    return {
      condition: "NEW" as const,
      conditionDetail: undefined,
    };
  };

  const clearFilters = () => {
    setSearchQuery("");
    setActiveCategory("");
    setActiveCondition("");
    setMinPrice("");
    setMaxPrice("");
    setMinRating(0);
    setCurrentPage(1);
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters = searchQuery || activeCategory || activeCondition || minPrice || maxPrice || minRating > 0;

  return (
    <div className="bg-[var(--color-brand-cream)]/30 min-h-screen pb-20">
      {/* PAGE HEADER */}
      <div className="bg-white border-b border-black/5 pt-10 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-sm text-gray-500 mb-4">
            <span>Home</span> <span className="mx-2">/</span>{" "}
            <span className="text-[var(--color-brand-dark-blue)] font-medium">
              Browse Books
            </span>
          </div>
          <h1 className="text-4xl font-serif font-black text-[var(--color-brand-dark-blue)] tracking-tight">
            All Books
          </h1>
          <p className="text-[var(--color-brand-brown)] mt-2">
            Explore our collection of new and pre-loved books.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        {/* MOBILE FILTER OVERLAY */}
        <div
          className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${isMobileFilterOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={() => setIsMobileFilterOpen(false)}
        />

        {/* SIDEBAR FILTERS */}
        <aside
          className={`fixed lg:static top-0 left-0 h-full lg:h-auto w-3/4 max-w-sm lg:w-64 bg-white lg:bg-transparent shadow-2xl lg:shadow-none z-50 lg:z-0 transform transition-transform duration-300 overflow-y-auto lg:overflow-visible ${isMobileFilterOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        >
          <div className="p-6 lg:p-0">
            <div className="flex items-center justify-between lg:hidden mb-6">
              <h2 className="text-xl font-bold text-[var(--color-brand-dark-blue)]">
                Filters
              </h2>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Category Filter */}
            <div className="mb-8">
              <h3 className="font-bold text-[var(--color-brand-dark-blue)] mb-4 uppercase text-sm tracking-wider">
                Categories
              </h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => setActiveCategory("")}
                    className={`text-sm w-full text-left transition-colors ${activeCategory === "" ? "text-[var(--color-brand-muted-orange)] font-bold" : "text-gray-600 hover:text-[var(--color-brand-dark-blue)]"}`}
                  >
                    All Categories
                  </button>
                </li>
                {categories.map((category) => (
                  <li key={category.id}>
                    <button
                      onClick={() => setActiveCategory(category.id)}
                      className={`text-sm w-full text-left transition-colors ${activeCategory === category.id ? "text-[var(--color-brand-muted-orange)] font-bold" : "text-gray-600 hover:text-[var(--color-brand-dark-blue)]"}`}
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <hr className="border-black/5 my-6" />

            {/* Price Filter */}
            <div className="mb-8">
              <h3 className="font-bold text-[var(--color-brand-dark-blue)] mb-4 uppercase text-sm tracking-wider">
                Price Range
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-muted-orange)]"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-muted-orange)]"
                />
              </div>
            </div>

            <hr className="border-black/5 my-6" />

            {/* Condition Filter */}
            <div className="mb-8">
              <h3 className="font-bold text-[var(--color-brand-dark-blue)] mb-4 uppercase text-sm tracking-wider">
                Condition
              </h3>
              <div className="space-y-3">
                {CONDITIONS.map((cond) => (
                  <label
                    key={cond.value}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="condition"
                      value={cond.value}
                      checked={activeCondition === cond.value}
                      onChange={(e) => setActiveCondition(e.target.value)}
                      className="w-4 h-4 text-[var(--color-brand-muted-orange)] border-gray-300 focus:ring-[var(--color-brand-muted-orange)] cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-[var(--color-brand-dark-blue)]">
                      {cond.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="border-black/5 my-6" />

            {/* Rating Filter */}
            <div className="mb-8">
              <h3 className="font-bold text-[var(--color-brand-dark-blue)] mb-4 uppercase text-sm tracking-wider">
                Minimum Rating
              </h3>
              <div className="space-y-3">
                {[4, 3, 2, 1].map((rating) => (
                  <label
                    key={rating}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="rating"
                      checked={minRating === rating}
                      onChange={() => setMinRating(rating)}
                      className="w-4 h-4 text-[var(--color-brand-muted-orange)] border-gray-300 focus:ring-[var(--color-brand-muted-orange)] cursor-pointer"
                    />
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
                        />
                      ))}
                      <span className="text-sm text-gray-500 ml-1">& Up</span>
                    </div>
                  </label>
                ))}
                {minRating > 0 && (
                  <button
                    onClick={() => setMinRating(0)}
                    className="text-xs text-[var(--color-brand-muted-orange)] hover:underline"
                  >
                    Clear rating filter
                  </button>
                )}
              </div>
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                className="w-full mb-6"
                onClick={clearFilters}
              >
                Clear All Filters
              </Button>
            )}

            <Button
              className="w-full lg:hidden mb-6"
              onClick={() => setIsMobileFilterOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-black/5 flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden shrink-0"
                onClick={() => setIsMobileFilterOpen(true)}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <div className="text-sm text-[var(--color-brand-brown)] font-medium">
                {isLoading ? (
                  "Loading..."
                ) : (
                  <>
                    Showing{" "}
                    <span className="text-[var(--color-brand-dark-blue)]">
                      {totalResults > 0 ? `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, totalResults)}` : "0"}
                    </span>{" "}
                    of {totalResults} results
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-muted-orange)] focus:bg-white transition-colors"
                />
              </div>

              {/* Sort */}
              <div className="relative w-full sm:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[var(--color-brand-dark-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-muted-orange)] focus:bg-white transition-colors cursor-pointer"
                >
                  <option value="relevance">Sort by: Relevance</option>
                  <option value="newest">Sort by: Newest Arrivals</option>
                  <option value="price_low">
                    Sort by: Price (Low to High)
                  </option>
                  <option value="price_high">
                    Sort by: Price (High to Low)
                  </option>
                  <option value="rating">Sort by: Average Rating</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
              <p className="text-red-600 text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={fetchBooks}
              >
                Retry
              </Button>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-[var(--color-brand-muted-orange)]" />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && books.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-black/5">
              <p className="text-gray-500 mb-4">No books found matching your criteria.</p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          )}

          {/* Book Grid */}
          {!isLoading && !error && books.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {paginatedBooks.map((book) => {
                const { condition, conditionDetail } = getConditionDisplay(book);
                return (
                  <BookCard
                    key={book.id}
                    id={book.id}
                    title={book.title}
                    author={book.author}
                    price={book.price}
                    coverUrl={getCoverUrl(book)}
                    condition={condition}
                    conditionDetail={conditionDetail}
                    rating={book.averageRating}
                  />
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !error && totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg bg-white text-gray-500 hover:bg-gray-50 hover:text-[var(--color-brand-dark-blue)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show first, last, and pages around current
                  return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                })
                .map((page, idx, arr) => {
                  // Add ellipsis
                  if (idx > 0 && arr[idx - 1] !== page - 1) {
                    return (
                      <span key={`ellipsis-${page}`} className="text-gray-400 px-2">
                        ...
                      </span>
                    );
                  }
                  return (
                    <button
                      key={page}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                        currentPage === page
                          ? "bg-[var(--color-brand-dark-blue)] text-white"
                          : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-[var(--color-brand-dark-blue)]"
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  );
                })}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-lg bg-white text-gray-500 hover:bg-gray-50 hover:text-[var(--color-brand-dark-blue)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Books;
