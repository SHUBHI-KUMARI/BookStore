import {
  Search,
  ChevronRight,
  ShieldCheck,
  Recycle,
  Star,
  BookOpen,
  Clock,
  Users,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { BookCard } from "../components/books/BookCard";
import { Link } from "react-router-dom";

// --- MOCK DATA ---
const POPULAR_BOOKS = [
  {
    id: "b1",
    title: "The Midnight Library",
    author: "Matt Haig",
    price: 18.99,
    coverUrl:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600",
    condition: "NEW" as const,
    rating: 5,
  },
  {
    id: "b2",
    title: "Atomic Habits",
    author: "James Clear",
    price: 16.5,
    coverUrl:
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600",
    condition: "NEW" as const,
    rating: 5,
  },
  {
    id: "b3",
    title: "Dune",
    author: "Frank Herbert",
    price: 14.99,
    coverUrl:
      "https://images.unsplash.com/photo-1614544048536-0d28caf77f41?auto=format&fit=crop&q=80&w=600",
    condition: "NEW" as const,
    rating: 4,
  },
  {
    id: "b4",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    price: 15.0,
    coverUrl:
      "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=600",
    condition: "NEW" as const,
    rating: 5,
  },
];

const USED_BOOKS = [
  {
    id: "u1",
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    price: 9.5,
    coverUrl:
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600",
    condition: "USED" as const,
    conditionDetail: "Good" as const,
    rating: 4,
  },
  {
    id: "u2",
    title: "Project Hail Mary",
    author: "Andy Weir",
    price: 11.2,
    coverUrl:
      "https://images.unsplash.com/photo-1614544048536-0d28caf77f41?auto=format&fit=crop&q=80&w=600",
    condition: "USED" as const,
    conditionDetail: "Mint" as const,
    rating: 5,
  },
  {
    id: "u3",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    price: 8.0,
    coverUrl:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600",
    condition: "USED" as const,
    conditionDetail: "Fair" as const,
    rating: 4,
  },
  {
    id: "u4",
    title: "1984",
    author: "George Orwell",
    price: 5.5,
    coverUrl:
      "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=600",
    condition: "USED" as const,
    conditionDetail: "Good" as const,
    rating: 4,
  },
];

const CATEGORIES = [
  {
    name: "Fiction & Literature",
    count: "12.5k Books",
    icon: BookOpen,
    color: "bg-blue-50 text-blue-600",
  },
  {
    name: "Science & Tech",
    count: "8.2k Books",
    icon: ShieldCheck,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    name: "Business & Economy",
    count: "5.4k Books",
    icon: Users,
    color: "bg-amber-50 text-amber-600",
  },
  {
    name: "History & Bio",
    count: "6.1k Books",
    icon: Clock,
    color: "bg-purple-50 text-purple-600",
  },
];

export const Home = () => {
  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative bg-[var(--color-brand-cream)] pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left Column: Text & Search */}
            <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
              <span className="inline-block py-1 px-3 rounded-full bg-[var(--color-brand-muted-orange)]/10 text-[var(--color-brand-muted-orange)] font-bold text-sm mb-6 border border-[var(--color-brand-muted-orange)]/20 shadow-sm transition-transform hover:-translate-y-0.5">
                Join 50,000+ Readers Weekly
              </span>
              <h1 className="text-5xl lg:text-7xl font-serif font-black text-[var(--color-brand-dark-blue)] leading-[1.1] mb-6 tracking-tight">
                Discover Your Next{" "}
                <span className="text-[var(--color-brand-muted-orange)] relative inline-block">
                  Great Read
                  <svg
                    className="absolute w-full h-3 -bottom-1 left-0 text-[var(--color-brand-muted-orange)]/30"
                    viewBox="0 0 100 10"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 5 Q 50 10 100 0"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                  </svg>
                </span>
              </h1>
              <p className="text-lg text-[var(--color-brand-brown)] mb-10 max-w-xl leading-relaxed">
                The premier marketplace for new and pre-loved books. Buy top
                sellers, or safely list your used books to earn cash while
                supporting sustainable reading.
              </p>

              {/* Search Bar Container */}
              <div className="w-full max-w-xl relative flex items-center bg-white rounded-2xl p-2 shadow-lg border border-black/5 focus-within:ring-4 ring-[var(--color-brand-muted-orange)]/20 transition-all duration-300">
                <Search className="h-6 w-6 text-gray-400 absolute left-6" />
                <input
                  type="text"
                  className="w-full pl-14 pr-32 py-4 rounded-xl focus:outline-none text-lg text-[var(--color-brand-dark-blue)] placeholder-gray-400 bg-transparent font-medium"
                  placeholder="Title, author, or ISBN..."
                />
                <Button
                  size="lg"
                  className="absolute right-2 shadow-sm rounded-xl py-3 px-8 text-base"
                >
                  Search
                </Button>
              </div>

              <div className="flex items-center gap-6 mt-10 text-sm font-medium text-[var(--color-brand-brown)]">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <img
                      key={i}
                      src={`https://i.pravatar.cc/100?img=${i + 10}`}
                      className="w-10 h-10 rounded-full border-2 border-[var(--color-brand-cream)] shadow-sm"
                      alt="User"
                    />
                  ))}
                </div>
                <div className="flex flex-col">
                  <div className="flex gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <span>from 10k+ reviews</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Graphic/Image Grid */}
            <div className="w-full lg:w-1/2 relative hidden md:block">
              {/* Decorative blobs/shapes */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-[var(--color-brand-muted-orange)]/10 to-[var(--color-brand-dark-blue)]/5 rounded-full blur-3xl -z-10" />

              <div className="grid grid-cols-2 gap-6 relative">
                <div className="space-y-6 translate-y-12">
                  <img
                    src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800"
                    alt="Book"
                    className="rounded-2xl shadow-2xl hover:scale-[1.02] transition-transform duration-500 border border-white/50"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800"
                    alt="Book"
                    className="rounded-2xl shadow-xl hover:scale-[1.02] transition-transform duration-500 border border-white/50"
                  />
                </div>
                <div className="space-y-6">
                  <img
                    src="https://images.unsplash.com/photo-1614544048536-0d28caf77f41?auto=format&fit=crop&q=80&w=800"
                    alt="Book"
                    className="rounded-2xl shadow-xl hover:scale-[1.02] transition-transform duration-500 border border-white/50"
                  />
                  <div className="bg-white p-6 rounded-2xl shadow-xl border border-black/5 flex flex-col items-center justify-center text-center hover:scale-[1.02] transition-transform duration-500">
                    <Recycle className="w-12 h-12 text-[var(--color-brand-muted-orange)] mb-3" />
                    <h3 className="font-bold text-[var(--color-brand-dark-blue)] text-lg">
                      Trade In
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Exchange old books for cash or credit.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED CATEGORIES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold font-serif text-[var(--color-brand-dark-blue)] mb-2">
                Explore Categories
              </h2>
              <p className="text-[var(--color-brand-brown)]">
                Find precisely what you're looking for
              </p>
            </div>
            <Link
              to="/categories"
              className="hidden sm:flex items-center text-[var(--color-brand-dark-blue)] font-bold hover:text-[var(--color-brand-muted-orange)] transition-colors"
            >
              View All <ChevronRight className="w-5 h-5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.name}
                className="group cursor-pointer border border-black/5 hover:border-[var(--color-brand-muted-orange)]/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg bg-white"
              >
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300 ${cat.color}`}
                >
                  <cat.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-brand-dark-blue)] mb-2">
                  {cat.name}
                </h3>
                <p className="text-gray-500 font-medium">{cat.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. POPULAR NEW BOOKS */}
      <section className="py-20 bg-gray-50/50 border-t border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold font-serif text-[var(--color-brand-dark-blue)] mb-2">
                Trending Bestsellers
              </h2>
              <p className="text-[var(--color-brand-brown)]">
                The most popular new releases this week
              </p>
            </div>
            <Link
              to="/books"
              className="hidden sm:flex items-center text-[var(--color-brand-dark-blue)] font-bold hover:text-[var(--color-brand-muted-orange)] transition-colors"
            >
              Shop New <ChevronRight className="w-5 h-5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {POPULAR_BOOKS.map((book) => (
              <BookCard key={book.id} {...book} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. USED BOOKS (MARKETPLACE) */}
      <section className="py-24 bg-[var(--color-brand-dark-blue)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6 text-center md:text-left">
            <div className="max-w-2xl">
              <span className="text-[var(--color-brand-muted-orange)] font-bold tracking-wider uppercase text-sm mb-3 block">
                Community Marketplace
              </span>
              <h2 className="text-4xl font-bold font-serif mb-4">
                Pre-Loved Books at Great Prices
              </h2>
              <p className="text-gray-300 text-lg">
                Save money and reduce waste by buying quality used books from
                fellow readers. Every book is verified for condition quality.
              </p>
            </div>
            <Button variant="secondary" size="lg" className="shrink-0 group">
              Browse Used Books
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:-mr-4 pr-4 pb-8 overflow-x-auto snap-x">
            {USED_BOOKS.map((book) => (
              <div key={book.id} className="snap-start min-w-[280px]">
                <BookCard {...book} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE US */}
      <section className="py-24 bg-white border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold font-serif text-[var(--color-brand-dark-blue)] mb-4">
              The ReBook Advantage
            </h2>
            <p className="text-[var(--color-brand-brown)] text-lg">
              We are built differently to ensure transparency, quality, and
              community trust.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center flex flex-col items-center group">
              <div className="w-20 h-20 bg-[var(--color-brand-cream)] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:bg-[var(--color-brand-muted-orange)]/10">
                <ShieldCheck className="w-10 h-10 text-[var(--color-brand-muted-orange)] group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-brand-dark-blue)] mb-3">
                Verified Sellers
              </h3>
              <p className="text-gray-500 leading-relaxed">
                Our strict approval workflow ensures that every used book listed
                matches its described condition.
              </p>
            </div>

            <div className="text-center flex flex-col items-center group">
              <div className="w-20 h-20 bg-[var(--color-brand-cream)] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:bg-[var(--color-brand-muted-orange)]/10">
                <Recycle className="w-10 h-10 text-[var(--color-brand-muted-orange)] group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-brand-dark-blue)] mb-3">
                Eco-Friendly Reading
              </h3>
              <p className="text-gray-500 leading-relaxed">
                By choosing to buy and sell used books, you are directly
                contributing to a circular economy.
              </p>
            </div>

            <div className="text-center flex flex-col items-center group">
              <div className="w-20 h-20 bg-[var(--color-brand-cream)] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:bg-[var(--color-brand-muted-orange)]/10">
                <BookOpen className="w-10 h-10 text-[var(--color-brand-muted-orange)] group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-brand-dark-blue)] mb-3">
                Vast Selection
              </h3>
              <p className="text-gray-500 leading-relaxed">
                From new bestsellers to out-of-print textbooks, our hybrid
                marketplace has it all in one cart.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="py-24 bg-[var(--color-brand-cream)]/50 relative overflow-hidden">
        {/* Quote watermark background */}
        <div className="absolute top-10 left-10 text-[20rem] text-[var(--color-brand-muted-orange)]/5 font-serif leading-none select-none pointer-events-none">
          "
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl font-bold font-serif text-[var(--color-brand-dark-blue)] mb-16 text-center">
            Loved by Readers Everywhere
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                n: "Sarah Jenkins",
                r: "Student",
                t: "I bought all my textbooks here used for a fraction of the university bookstore price. They arrived in great condition exactly as described!",
              },
              {
                n: "David Cho",
                r: "Avid Reader",
                t: "Selling the novels I finished reading has never been easier. The platform connects me with buyers instantly and handles the process.",
              },
              {
                n: "Emily R.",
                r: "Book Collector",
                t: "I love how I can seamlessly buy both new releases and track down rare used books in a single shopping cart. Beautiful UI as well.",
              },
            ].map((test, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-2xl shadow-sm border border-black/5 relative hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="flex gap-1 text-[var(--color-brand-muted-orange)] mb-6">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <p className="text-[var(--color-brand-brown)] text-lg italic mb-8 relative z-10">
                  "{test.t}"
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={`https://i.pravatar.cc/100?img=${i + 25}`}
                    className="w-12 h-12 rounded-full border-2 border-[var(--color-brand-cream)]"
                    alt={test.n}
                  />
                  <div>
                    <h4 className="font-bold text-[var(--color-brand-dark-blue)]">
                      {test.n}
                    </h4>
                    <span className="text-sm text-gray-500">{test.r}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
