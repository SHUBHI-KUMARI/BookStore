import { ShoppingCart, Star } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Link } from "react-router-dom";

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
  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full ring-1 ring-black/5">
      {/* Cover Image Container */}
      <Link
        to={`/books/${id}`}
        className="relative h-64 w-full bg-gray-50 flex items-center justify-center p-6 overflow-hidden"
      >
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          <Badge
            variant={condition === "NEW" ? "warning" : "primary"}
            className="uppercase tracking-wider"
          >
            {condition}
          </Badge>
          {condition === "USED" && conditionDetail && (
            <Badge
              variant="neutral"
              className="uppercase tracking-wider bg-white/90 backdrop-blur-sm shadow-sm border-gray-200"
            >
              {conditionDetail}
            </Badge>
          )}
        </div>

        {/* Image */}
        <img
          src={coverUrl}
          alt={`Cover of ${title}`}
          className="h-full w-auto object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500 ease-out"
          loading="lazy"
        />
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${i < (rating || 5) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1.5 font-medium">
            ({title.length * 3 + 12})
          </span>
        </div>

        {/* Title & Author */}
        <Link
          to={`/books/${id}`}
          className="group-hover:text-[var(--color-brand-muted-orange)] transition-colors inline-block"
        >
          <h3 className="font-bold text-lg text-[var(--color-brand-dark-blue)] leading-snug line-clamp-2 min-h-[3.2rem] mb-1.5">
            {title}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 mb-4 font-medium">{author}</p>

        {/* Spacer to push pricing down */}
        <div className="flex-grow min-h-2" />

        {/* Price & Action */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
          <span className="text-2xl font-bold tracking-tight text-[var(--color-brand-dark-blue)]">
            ${price.toFixed(2)}
          </span>
          <Button
            size="sm"
            variant="primary"
            className="rounded-full px-5 shadow-sm hover:shadow-md"
            aria-label={`Add ${title} to cart`}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Cart
          </Button>
        </div>
      </div>
    </div>
  );
};
