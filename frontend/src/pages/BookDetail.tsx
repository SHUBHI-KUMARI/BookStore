import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Star,
  ShoppingCart,
  ChevronLeft,
  Package,
  Tag,
  User,
  AlertCircle,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { bookService, type Book } from "../services/bookService";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import { getBookCoverUrl } from "../utils/bookCovers";

const CONDITION_LABEL: Record<string, string> = {
  NEW: "New",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
};

const CONDITION_COLOR: Record<string, string> = {
  NEW: "bg-orange-50 text-orange-600",
  GOOD: "bg-emerald-50 text-emerald-600",
  FAIR: "bg-amber-50 text-amber-600",
  POOR: "bg-red-50 text-red-500",
};

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

export const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, isLoading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addSuccess, setAddSuccess] = useState(false);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    bookService
      .getById(id)
      .then(setBook)
      .catch(() => setError("Book not found or unavailable."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!id) return;
    try {
      await addToCart(id, 1);
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 2500);
    } catch {
      /* show nothing, cart loading state handles UX */
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setReviewSubmitting(true);
    setReviewError("");
    try {
      await api.post(`/reviews/${id}`, {
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewSuccess(true);
      setReviewComment("");
      // Re-fetch to show new review
      const updated = await bookService.getById(id);
      setBook(updated);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to submit review.";
      setReviewError(msg);
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand-muted-orange)]" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <h2 className="text-2xl font-bold text-[var(--color-brand-dark-blue)]">
          {error || "Book not found"}
        </h2>
        <Link to="/books">
          <Button>← Browse Books</Button>
        </Link>
      </div>
    );
  }

  const coverUrl = getBookCoverUrl(book);
  const avgRating = book.averageRating ?? 0;
  const reviewCount = book.reviews?.length ?? 0;

  return (
    <div className="bg-[var(--color-brand-cream)]/30 min-h-screen pb-24">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-black/5 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-[var(--color-brand-dark-blue)]">
            Home
          </Link>
          <span>/</span>
          <Link
            to="/books"
            className="hover:text-[var(--color-brand-dark-blue)]"
          >
            Books
          </Link>
          <span>/</span>
          <span className="text-[var(--color-brand-dark-blue)] font-medium line-clamp-1">
            {book.title}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm font-bold text-[var(--color-brand-brown)] hover:text-[var(--color-brand-dark-blue)] transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Cover Image */}
            <div className="lg:w-80 xl:w-96 flex-shrink-0 bg-[var(--color-brand-cream)] flex items-center justify-center p-10 min-h-[360px]">
              <img
                src={coverUrl}
                alt={book.title}
                className="h-64 w-auto object-contain drop-shadow-2xl rounded-lg"
              />
            </div>

            {/* Details */}
            <div className="flex-1 p-8 lg:p-10 flex flex-col">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${CONDITION_COLOR[book.condition]}`}
                >
                  {CONDITION_LABEL[book.condition]}
                </span>
                {book.isUsed && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--color-brand-dark-blue)]/10 text-[var(--color-brand-dark-blue)]">
                    Pre-owned
                  </span>
                )}
                {book.category && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                    {book.category.name}
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-serif font-black text-[var(--color-brand-dark-blue)] mb-2 leading-tight">
                {book.title}
              </h1>
              <p className="text-lg text-[var(--color-brand-brown)] font-medium mb-4">
                by {book.author}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <StarRating rating={avgRating} />
                <span className="text-sm font-semibold text-[var(--color-brand-dark-blue)]">
                  {avgRating > 0 ? avgRating.toFixed(1) : "No ratings yet"}
                </span>
                {reviewCount > 0 && (
                  <span className="text-sm text-gray-500">
                    ({reviewCount} review{reviewCount !== 1 ? "s" : ""})
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="text-4xl font-black text-[var(--color-brand-dark-blue)] mb-6">
                ${book.price.toFixed(2)}
              </div>

              {/* Stock & Seller */}
              <div className="flex flex-wrap gap-4 mb-8 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Package className="w-4 h-4" />
                  <span>
                    {book.stock > 0 ? (
                      <>
                        <span className="font-bold text-emerald-600">
                          In Stock
                        </span>
                        {" — "}
                        {book.stock} available
                      </>
                    ) : (
                      <span className="font-bold text-red-500">
                        Out of Stock
                      </span>
                    )}
                  </span>
                </div>
                {book.seller && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span>
                      Sold by{" "}
                      <span className="font-bold text-[var(--color-brand-dark-blue)]">
                        {book.seller.name}
                      </span>
                    </span>
                  </div>
                )}
                {book.category && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Tag className="w-4 h-4" />
                    <span>{book.category.name}</span>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                <Button
                  size="lg"
                  className="flex-1 group relative"
                  onClick={handleAddToCart}
                  disabled={book.stock === 0 || cartLoading}
                >
                  {cartLoading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-5 h-5 mr-2 group-hover:-translate-y-0.5 transition-transform" />
                  )}
                  {addSuccess
                    ? "✓ Added to Cart!"
                    : book.stock === 0
                      ? "Out of Stock"
                      : "Add to Cart"}
                </Button>
                <Link to="/cart">
                  <Button variant="outline" size="lg">
                    View Cart
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-10 grid lg:grid-cols-3 gap-8">
          {/* Review List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-serif font-bold text-[var(--color-brand-dark-blue)] mb-6 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-[var(--color-brand-muted-orange)]" />
              Reader Reviews
            </h2>
            {reviewCount === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-black/5 shadow-sm text-gray-500">
                No reviews yet. Be the first to write one!
              </div>
            ) : (
              <div className="space-y-4">
                {book.reviews!.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[var(--color-brand-muted-orange)]/10 text-[var(--color-brand-muted-orange)] flex items-center justify-center font-bold text-sm">
                          {review.user?.name.charAt(0) ?? "?"}
                        </div>
                        <div>
                          <p className="font-bold text-[var(--color-brand-dark-blue)] text-sm">
                            {review.user?.name ?? "Anonymous"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                    {review.comment && (
                      <p className="text-gray-600 text-sm leading-relaxed italic">
                        "{review.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Write a Review */}
          <div>
            <h2 className="text-2xl font-serif font-bold text-[var(--color-brand-dark-blue)] mb-6">
              Write a Review
            </h2>
            {!isAuthenticated ? (
              <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm text-center">
                <p className="text-gray-500 mb-4 text-sm">
                  You must be logged in to write a review.
                </p>
                <Link to="/login">
                  <Button size="sm">Sign In</Button>
                </Link>
              </div>
            ) : reviewSuccess ? (
              <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 text-center text-emerald-700 font-medium">
                ✓ Review submitted! Thank you.
              </div>
            ) : (
              <form
                onSubmit={handleReviewSubmit}
                className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm space-y-4"
              >
                {/* Star picker */}
                <div>
                  <label className="text-xs font-bold text-[var(--color-brand-dark-blue)] uppercase tracking-wider mb-2 block">
                    Your Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${star <= reviewRating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 hover:text-yellow-300"}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="text-xs font-bold text-[var(--color-brand-dark-blue)] uppercase tracking-wider mb-2 block">
                    Comment
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={4}
                    required
                    placeholder="Share your thoughts about this book..."
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-muted-orange)] bg-gray-50"
                  />
                </div>

                {reviewError && (
                  <p className="text-red-500 text-xs">{reviewError}</p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={reviewSubmitting}
                >
                  {reviewSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Submit Review
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
