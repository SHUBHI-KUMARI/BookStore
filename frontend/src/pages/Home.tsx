import { useState, useEffect } from "react";
import {
  Search,
  ChevronRight,
  ShieldCheck,
  Recycle,
  Star,
  BookOpen,
  Clock,
  Users,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { BookCard } from "../components/books/BookCard";
import { Link, useNavigate } from "react-router-dom";
import { bookService, type Book } from "../services/bookService";
import api from "../services/api";
import { getBookCoverUrl } from "../utils/bookCovers";

interface Category {
  id: string;
  name: string;
}

const CATEGORY_ICONS: Record<
  string,
  { icon: typeof BookOpen; color: string; bg: string }
> = {
  "Fiction & Literature": {
    icon: BookOpen,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  "Science & Tech": {
    icon: ShieldCheck,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  "Business & Economy": {
    icon: Users,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  "History & Bio": {
    icon: Clock,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
};

const getDefaultCategoryIcon = () => ({
  icon: BookOpen,
  color: "text-slate-600",
  bg: "bg-slate-50",
});

export const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [usedBooks, setUsedBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const categoriesRes = await api.get("/categories");
        setCategories(categoriesRes.data);

        const newBooksData = await bookService.getAll({ isUsed: false });
        setPopularBooks(newBooksData.slice(0, 4));

        const usedBooksData = await bookService.getAll({ isUsed: true });
        setUsedBooks(usedBooksData.slice(0, 4));
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? "Failed to load books. Please try again.";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getConditionDisplay = (book: Book) => {
    if (book.isUsed) {
      return {
        condition: "USED" as const,
        conditionDetail: book.condition as "Mint" | "Good" | "Fair" | "Poor",
      };
    }
    return { condition: "NEW" as const, conditionDetail: undefined };
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50">
      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-100/40 via-white to-white"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left Column: Text & Search */}
            <div className="w-full lg:w-[55%] flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-amber-50 text-amber-700 font-medium text-sm mb-8 border border-amber-200/50 shadow-sm">
                <Sparkles className="w-4 h-4" />
                <span>Join 50,000+ Readers Weekly</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-serif text-slate-900 leading-[1.1] mb-8 tracking-tight">
                Discover Your Next <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500 italic pr-2">
                  Great Story
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-xl leading-relaxed font-light">
                The premier destination for bibliophiles. Shop pristine new
                releases, or explore our curated marketplace for pre-loved
                treasures.
              </p>

              {/* Search Bar Container */}
              <form
                onSubmit={handleSearch}
                className="w-full max-w-xl relative flex items-center bg-white rounded-2xl p-2 shadow-xl shadow-slate-200/50 border border-slate-100 focus-within:ring-2 ring-amber-500/20 transition-all duration-300"
              >
                <Search className="h-6 w-6 text-slate-400 absolute left-6" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-16 pr-32 py-4 rounded-xl focus:outline-none text-lg text-slate-800 placeholder-slate-400 bg-transparent font-medium"
                  placeholder="Title, author, or ISBN..."
                />
                <Button
                  type="submit"
                  size="lg"
                  className="absolute right-2 shadow-md rounded-xl py-3 px-8 text-base bg-slate-900 hover:bg-slate-800 text-white border-0"
                >
                  Search
                </Button>
              </form>

              <div className="flex items-center gap-6 mt-12 text-sm text-slate-600">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <img
                      key={i}
                      src={`https://i.pravatar.cc/100?img=${i + 10}`}
                      className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                      alt="User"
                    />
                  ))}
                </div>
                <div className="flex flex-col items-start gap-1">
                  <div className="flex gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <span className="font-medium">from 10k+ reviews</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Graphic/Image Grid */}
            <div className="w-full lg:w-[45%] relative hidden md:block">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-amber-100/40 rounded-full blur-3xl -z-10" />
              <div className="grid grid-cols-2 gap-6 relative">
                <div className="space-y-6 pt-12">
                  <img
                    src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800"
                    alt="Book"
                    className="rounded-3xl shadow-2xl hover:-translate-y-2 transition-transform duration-500 object-cover aspect-[3/4]"
                  />
                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-white flex flex-col items-center justify-center text-center hover:-translate-y-2 transition-transform duration-500">
                    <Recycle className="w-10 h-10 text-emerald-600 mb-3" />
                    <h3 className="font-bold text-slate-900 text-lg">
                      Trade In
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">
                      Exchange old books for credit.
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <img
                    src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800"
                    alt="Book"
                    className="rounded-3xl shadow-2xl hover:-translate-y-2 transition-transform duration-500 object-cover aspect-[4/5]"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1614544048536-0d28caf77f41?auto=format&fit=crop&q=80&w=800"
                    alt="Book"
                    className="rounded-3xl shadow-2xl hover:-translate-y-2 transition-transform duration-500 object-cover aspect-[3/4]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Error State */}
      {error && (
        <section className="py-8 bg-red-50 border-b border-red-100">
          <div className="max-w-7xl mx-auto px-4 text-center flex flex-col items-center">
            <p className="text-red-600 mb-4 font-medium">{error}</p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="border-red-200 text-red-700 hover:bg-red-100"
            >
              Try Again
            </Button>
          </div>
        </section>
      )}

      {/* 2. FEATURED CATEGORIES */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div className="max-w-xl">
              <h2 className="text-3xl lg:text-4xl font-serif text-slate-900 mb-4 tracking-tight">
                Explore Curated Categories
              </h2>
              <p className="text-slate-600 text-lg font-light">
                Find exactly what you are looking for in our meticulously
                organized collections.
              </p>
            </div>
            <Link
              to="/books"
              className="hidden sm:flex items-center text-slate-900 font-medium hover:text-amber-600 transition-colors group"
            >
              View Collection{" "}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.slice(0, 4).map((cat) => {
                const {
                  icon: Icon,
                  color,
                  bg,
                } = CATEGORY_ICONS[cat.name] || getDefaultCategoryIcon();
                return (
                  <Link
                    key={cat.id}
                    to={`/books?category=${cat.id}`}
                    className="group border border-slate-200 hover:border-amber-300 rounded-3xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white relative overflow-hidden"
                  >
                    <div
                      className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-50 to-transparent rounded-full -mr-16 -mt-16 transition-all group-hover:scale-150 duration-500 opacity-50`}
                    ></div>
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 duration-300 ${bg} ${color}`}
                    >
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-slate-900 mb-2 relative z-10">
                      {cat.name}
                    </h3>
                    <p className="text-slate-500 font-medium text-sm flex items-center relative z-10">
                      Browse Books{" "}
                      <ChevronRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 3. POPULAR NEW BOOKS */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div className="max-w-xl">
              <h2 className="text-3xl lg:text-4xl font-serif text-slate-900 mb-4 tracking-tight">
                Trending Bestsellers
              </h2>
              <p className="text-slate-600 text-lg font-light">
                The most popular new releases captivating readers worldwide this
                week.
              </p>
            </div>
            <Link
              to="/books"
              className="hidden sm:flex items-center text-slate-900 font-medium hover:text-amber-600 transition-colors group"
            >
              Shop New Arrivals{" "}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
            </div>
          ) : popularBooks.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100 text-slate-500">
              New arrivals will be listed here soon.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {popularBooks.map((book) => {
                const { condition, conditionDetail } =
                  getConditionDisplay(book);
                return (
                  <BookCard
                    key={book.id}
                    id={book.id}
                    title={book.title}
                    author={book.author}
                    price={book.price}
                    coverUrl={getBookCoverUrl(book)}
                    condition={condition}
                    conditionDetail={conditionDetail}
                    rating={book.averageRating}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. USED BOOKS (MARKETPLACE) */}
      <section className="py-32 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800 to-transparent opacity-50 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8 text-center md:text-left">
            <div className="max-w-2xl">
              <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-medium text-xs mb-6 border border-amber-500/30 tracking-widest uppercase">
                Community Marketplace
              </div>
              <h2 className="text-4xl lg:text-5xl font-serif mb-6 tracking-tight">
                Pre-Loved Books, <br className="hidden md:block" /> Unbeatable
                Value
              </h2>
              <p className="text-slate-300 text-lg font-light leading-relaxed">
                Embrace sustainable reading. Find quality-assured used books
                from fellow readers worldwide. Every copy has a history, and
                yours is next.
              </p>
            </div>
            <Link to="/books?isUsed=true">
              <Button
                size="lg"
                className="shrink-0 group bg-white text-slate-900 hover:bg-slate-100 border-0 shadow-xl px-8 py-6 rounded-full text-lg"
              >
                Browse Marketplace
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
            </div>
          ) : usedBooks.length === 0 ? (
            <div className="text-center py-20 bg-slate-800/50 rounded-3xl border border-slate-700 text-slate-400">
              The marketplace is waiting for its first listing.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {usedBooks.map((book) => {
                const { condition, conditionDetail } =
                  getConditionDisplay(book);
                return (
                  <div key={book.id} className="relative group">
                    <BookCard
                      id={book.id}
                      title={book.title}
                      author={book.author}
                      price={book.price}
                      coverUrl={getBookCoverUrl(book)}
                      condition={condition}
                      conditionDetail={conditionDetail}
                      rating={book.averageRating}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 5. WHY CHOOSE US */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl lg:text-4xl font-serif text-slate-900 mb-6 tracking-tight">
              The ReBook Experience
            </h2>
            <p className="text-slate-600 text-lg font-light">
              We have reimagined the bookstore experience prioritizing quality,
              transparency, and community connection.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            {[
              {
                icon: ShieldCheck,
                title: "Curated & Verified",
                desc: "Our quality assurance team ensures every used listing strictly matches its detailed condition report.",
              },
              {
                icon: Recycle,
                title: "Eco-Conscious Reading",
                desc: "Participate in a circular economy. Give books a second life and significantly reduce your carbon footprint.",
              },
              {
                icon: BookOpen,
                title: "Limitless Selection",
                desc: "From the latest hardcovers to rare, out-of-print paperbacks—find exactly what you need in one place.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="text-center flex flex-col items-center group"
              >
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-sm border border-slate-100 group-hover:-translate-y-2 transition-all duration-300">
                  <feature.icon className="w-10 h-10 text-slate-800 group-hover:text-amber-600 transition-colors" />
                </div>
                <h3 className="text-2xl font-serif text-slate-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-slate-600 font-light leading-relaxed px-4">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="py-32 bg-white relative overflow-hidden border-t border-slate-100">
        <div className="absolute -top-24 -left-20 text-[30rem] text-slate-50 font-serif leading-none select-none pointer-events-none z-0">
          "
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl lg:text-4xl font-serif text-slate-900 mb-20 text-center tracking-tight">
            Voices from Our Community
          </h2>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                n: "Sarah Jenkins",
                r: "Literature Student",
                t: "I purchased all my required reading here. The used books arrived in spectacular condition, saving me hundreds.",
              },
              {
                n: "David Cho",
                r: "Avid Reader",
                t: "The marketplace is brilliantly designed. It took me less than three minutes to list my read novels and find buyers.",
              },
              {
                n: "Emily R.",
                r: "Book Collector",
                t: "A seamless blend of new and rare used books. The interface is gorgeous, and the customer support is unparalleled.",
              },
            ].map((test, i) => (
              <div
                key={i}
                className="bg-slate-50 p-10 rounded-3xl relative hover:-translate-y-2 transition-transform duration-300 border border-slate-100/50"
              >
                <div className="flex gap-1 text-amber-500 mb-8">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <p className="text-slate-700 text-lg font-light leading-relaxed mb-10">
                  "{test.t}"
                </p>
                <div className="flex items-center gap-4 mt-auto">
                  <img
                    src={`https://i.pravatar.cc/100?img=${i + 25}`}
                    className="w-14 h-14 rounded-full shadow-sm"
                    alt={test.n}
                  />
                  <div>
                    <h4 className="font-medium text-slate-900">{test.n}</h4>
                    <span className="text-sm text-slate-500 font-light">
                      {test.r}
                    </span>
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
