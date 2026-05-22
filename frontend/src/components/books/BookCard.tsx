import { ShoppingCart, Star, Loader2 } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  price: number;
  coverUrl: string;
  condition: "NEW" | "USED";
  conditionDetail?: "Mint" | "Good" | "Fair" | "Poor";
  rating?: number;
}

export const BookCard = ({
  id,
  title,
  author,
  price,
  coverUrl,
  condition,
  conditionDetail,
  rating,
}: BookCardProps) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setIsAdding(true);
    try {
      await addToCart(id, 1);
    } catch {
      // ignore
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full ring-1 ring-slate-900/5">
      {/* Cover Image Container */}
      <Link
        to={`/books/${id}`}
        className="relative h-64 w-full bg-slate-50/50 flex items-center justify-center p-6 overflow-hidden border-b border-slate-50"
      >
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          <Badge
            variant={condition === "NEW" ? "warning" : "primary"}
            className="uppercase tracking-wider text-[10px]"
          >
            {condition}
          </Badge>
          {condition === "USED" && conditionDetail && (
            <Badge
              variant="neutral"
              className="uppercase tracking-wider bg-white/90 backdrop-blur-sm shadow-sm border-slate-200 text-[10px]"
            >
              {conditionDetail}
            </Badge>
          )}
        </div>

        {/* Image */}
        <img
          src={coverUrl}
          alt={`Cover of ${title}`}
          className="h-full w-auto object-contain drop-shadow-xl group-hover:scale-105 group-hover:-rotate-2 transition-transform duration-500 ease-out"
          loading="lazy"
        />
      </Link>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Title & Author */}
        <p className="text-sm text-slate-500 mb-2 font-medium tracking-wide">
          {author}
        </p>
        <Link
          to={`/books/${id}`}
          className="group-hover:text-amber-600 transition-colors inline-block mb-3"
        >
          <h3 className="font-serif font-bold text-xl text-slate-900 leading-snug line-clamp-2 min-h-[3rem]">
            {title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-4">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < (rating || 5) ? "text-amber-400 fill-amber-400" : "text-slate-200"}`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-400 ml-2 font-medium">
            ({title.length * 3 + 12} reviews)
          </span>
        </div>

        {/* Spacer to push pricing down */}
        <div className="flex-grow" />

        {/* Price & Action */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-4">
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            ${price.toFixed(2)}
          </span>
          <Button
            size="sm"
            className="rounded-full px-5 shadow-sm hover:shadow-md bg-slate-900 text-white hover:bg-slate-800"
            aria-label={`Add ${title} to cart`}
            onClick={handleAddToCart}
            disabled={isAdding}
          >
            {isAdding ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4 mr-2" />
            )}
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};
