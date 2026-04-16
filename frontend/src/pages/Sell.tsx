import { useState } from "react";
import {
  UploadCloud,
  CheckCircle2,
  ShieldCheck,
  Tag,
  Info,
} from "lucide-react";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { Button } from "../components/ui/Button";

const CATEGORY_OPTIONS = [
  { value: "fiction", label: "Fiction & Literature" },
  { value: "science", label: "Science & Tech" },
  { value: "business", label: "Business & Economy" },
  { value: "history", label: "History & Biography" },
  { value: "textbooks", label: "Textbooks" },
];

const CONDITION_OPTIONS = [
  { value: "mint", label: "Mint (Like New)" },
  { value: "good", label: "Good (Minor wear)" },
  { value: "fair", label: "Fair (Noticeable wear, fully readable)" },
  { value: "poor", label: "Poor (Heavy wear, missing pages)" },
];

export const Sell = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    condition: "",
    price: "",
    description: "",
    contact: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="bg-[var(--color-brand-cream)]/30 min-h-[80vh] flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-black/5 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-serif font-black text-[var(--color-brand-dark-blue)] mb-3">
            Listing Submited!
          </h2>
          <p className="text-gray-500 mb-8">
            Your book has been sent for review. Once approved by our team, it
            will be live on the marketplace.
          </p>
          <Button onClick={() => setIsSuccess(false)} className="w-full">
            List Another Book
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-brand-cream)]/30 min-h-screen pb-24">
      {/* HEADER */}
      <div className="bg-[var(--color-brand-dark-blue)] pt-16 pb-32 border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-white font-bold text-sm mb-6 border border-white/20">
            Community Marketplace
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-black text-white tracking-tight mb-4">
            Sell Your Used Books
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Give your read books a second life. List them on ReBook to connect
            with thousands of readers and earn cash securely.
          </p>
        </div>
      </div>

      {/* FORM CONTAINER */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 md:p-10 rounded-3xl shadow-2xl border border-black/5"
        >
          <div className="flex items-center gap-3 mb-10 pb-6 border-b border-gray-100">
            <div className="w-12 h-12 bg-[var(--color-brand-muted-orange)]/10 rounded-full flex items-center justify-center">
              <Tag className="w-6 h-6 text-[var(--color-brand-muted-orange)]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-brand-dark-blue)]">
                Book Details
              </h2>
              <p className="text-sm text-gray-500">
                Provide accurate information to help buyers find your book.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Title & Author */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Book Title"
                name="title"
                placeholder="e.g., The Great Gatsby"
                value={formData.title}
                onChange={handleChange}
                required
              />
              <Input
                label="Author"
                name="author"
                placeholder="e.g., F. Scott Fitzgerald"
                value={formData.author}
                onChange={handleChange}
                required
              />
            </div>

            {/* Category & Condition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Category"
                name="category"
                options={CATEGORY_OPTIONS}
                value={formData.category}
                onChange={handleChange}
                required
              />
              <Select
                label="Condition"
                name="condition"
                options={CONDITION_OPTIONS}
                value={formData.condition}
                onChange={handleChange}
                required
              />
            </div>

            {/* Price & Image Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Selling Price ($)"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
                <div className="flex items-start gap-2 mt-2 text-xs text-gray-500">
                  <Info className="w-4 h-4 shrink-0 text-blue-500" />
                  <p>
                    ReBook takes a 5% platform fee from the final sale price.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-[var(--color-brand-dark-blue)] mb-1.5 block">
                  Book Cover Image
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-[var(--color-brand-muted-orange)]/50 transition-colors p-6 flex flex-col items-center justify-center gap-2 cursor-pointer group">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-5 h-5 text-[var(--color-brand-muted-orange)]" />
                  </div>
                  <span className="text-sm font-medium text-gray-600 group-hover:text-[var(--color-brand-dark-blue)]">
                    Click to upload or drag & drop
                  </span>
                  <span className="text-xs text-gray-400">
                    JPG, PNG (Max 5MB)
                  </span>
                </div>
              </div>
            </div>

            <Textarea
              label="Description & Condition Notes"
              name="description"
              placeholder="Describe the book's contents and any specific wear & tear (e.g., highlights, folded pages)..."
              value={formData.description}
              onChange={handleChange}
              required
            />

            <hr className="border-gray-100" />

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--color-brand-dark-blue)]">
                  Logistics
                </h2>
                <p className="text-sm text-gray-500">
                  How should buyers coordinate with you?
                </p>
              </div>
            </div>

            <Textarea
              label="Contact & Pickup Details"
              name="contact"
              placeholder="e.g., Available for drop-off at University Library, or preferred shipping method..."
              value={formData.contact}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-sm font-medium text-gray-500 text-center sm:text-left">
              By listing, you agree to our{" "}
              <a
                href="#"
                className="text-[var(--color-brand-muted-orange)] hover:underline"
              >
                Seller Terms
              </a>
              .
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto px-12 group"
              isLoading={isSubmitting}
            >
              <span className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                Submit Listing
              </span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Sell;
