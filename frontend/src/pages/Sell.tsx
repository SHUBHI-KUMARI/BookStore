import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Info, ShieldCheck, Store, Tag } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { bookService } from "../services/bookService";
import api from "../services/api";

const CONDITION_OPTIONS = [
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  { value: "POOR", label: "Poor" },
];

export const Sell = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedImageName, setSelectedImageName] = useState("");
  const [categories, setCategories] = useState<
    Array<{ value: string; label: string }>
  >([{ value: "", label: "Select a category" }]);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    categoryId: "",
    condition: "GOOD" as "GOOD" | "FAIR" | "POOR",
    price: "",
    stock: "1",
    description: "",
    sellerNotes: "",
    image: "",
  });

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get("/categories");
      setCategories([
        { value: "", label: "Select a category" },
        ...res.data.map((category: { id: string; name: string }) => ({
          value: category.id,
          label: category.name,
        })),
      ]);
    } catch {
      // Keep default option
    }
  }, []);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      categoryId: "",
      condition: "GOOD",
      price: "",
      stock: "1",
      description: "",
      sellerNotes: "",
      image: "",
    });
    setSelectedImageName("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await bookService.createBook({
        title: formData.title,
        author: formData.author,
        categoryId: formData.categoryId,
        condition: formData.condition,
        price: Number(formData.price),
        stock: Number(formData.stock),
        description: formData.description,
        sellerNotes: formData.sellerNotes,
        image: formData.image || undefined,
      });
      setIsSuccess(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string; error?: string } } })
          ?.response?.data?.error ||
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        "Failed to submit listing. Please try again.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setFormData((current) => ({ ...current, image: "" }));
      setSelectedImageName("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Please upload an image smaller than 5MB.");
      event.target.value = "";
      return;
    }

    setError("");
    setSelectedImageName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((current) => ({
        ...current,
        image: typeof reader.result === "string" ? reader.result : "",
      }));
    };
    reader.readAsDataURL(file);
  };

  if (isSuccess) {
    return (
      <div className="bg-[var(--color-brand-cream)]/30 min-h-[80vh] flex items-center justify-center py-20 px-4">
        <div className="max-w-lg w-full bg-white p-10 rounded-3xl shadow-xl border border-black/5 text-center">
          <div className="w-20 h-20 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-serif font-black text-[var(--color-brand-dark-blue)] mb-3">
            Listing submitted
          </h2>
          <p className="text-gray-500 mb-8">
            Your book is now awaiting admin approval. You can track its status
            from your dashboard and update the listing anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1"
              onClick={() => {
                setIsSuccess(false);
                resetForm();
              }}
            >
              List another book
            </Button>
            <Link to="/dashboard" className="flex-1">
              <Button variant="outline" className="w-full">
                Open dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-brand-cream)]/30 min-h-screen pb-24">
      <div className="bg-[var(--color-brand-dark-blue)] pt-16 pb-28 border-b border-black/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-white font-bold text-sm mb-6 border border-white/20">
            Community Marketplace
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-black text-white tracking-tight mb-4">
            Sell your books with confidence
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Create a listing, describe the condition honestly, and let the admin
            team approve it before it goes live for buyers.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-2xl border border-black/5 p-6 md:p-10 space-y-8"
        >
          <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-8">
            <div className="space-y-8">
              <div className="flex items-center gap-3 pb-5 border-b border-gray-100">
                <div className="w-12 h-12 bg-[var(--color-brand-muted-orange)]/10 rounded-full flex items-center justify-center">
                  <Tag className="w-6 h-6 text-[var(--color-brand-muted-orange)]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[var(--color-brand-dark-blue)]">
                    Listing details
                  </h2>
                  <p className="text-sm text-gray-500">
                    Better detail leads to faster approvals and stronger buyer
                    trust.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Book Title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                />
                <Input
                  label="Author"
                  name="author"
                  required
                  value={formData.author}
                  onChange={handleChange}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Select
                  label="Category"
                  name="categoryId"
                  required
                  value={formData.categoryId}
                  onChange={handleChange}
                  options={categories}
                />
                <Select
                  label="Condition"
                  name="condition"
                  required
                  value={formData.condition}
                  onChange={handleChange}
                  options={CONDITION_OPTIONS}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Price ($)"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={handleChange}
                />
                <Input
                  label="Available Copies"
                  name="stock"
                  type="number"
                  min="1"
                  required
                  value={formData.stock}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-[var(--color-brand-brown)]">
                  Book Cover Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="block w-full rounded-xl border-2 border-dashed border-gray-200 bg-white px-4 py-3 text-sm text-[var(--color-brand-brown)] file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--color-brand-dark-blue)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-gray-400"
                />
                <p className="text-xs text-gray-500">
                  The image will be uploaded to Cloudinary folder `rebook/books`
                  when you submit the listing.
                </p>
                {selectedImageName && (
                  <p className="text-sm font-medium text-[var(--color-brand-dark-blue)]">
                    Selected: {selectedImageName}
                  </p>
                )}
                {formData.image && (
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <img
                      src={formData.image}
                      alt="Selected cover preview"
                      className="h-56 w-auto rounded-xl object-contain mx-auto"
                    />
                  </div>
                )}
              </div>

              <Textarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Summarize the book and mention marks, highlights, or wear."
                required
              />

              <Textarea
                label="Seller Notes"
                name="sellerNotes"
                value={formData.sellerNotes}
                onChange={handleChange}
                placeholder="Pickup window, shipping preference, bundled extras, or anything useful for admin review."
              />
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-emerald-900">Approval flow</h3>
                </div>
                <p className="text-sm text-emerald-800">
                  Used books start as <strong>pending</strong>. Admins review
                  the condition, category, and notes before publishing the
                  listing.
                </p>
              </div>

              <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Info className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-amber-900">Seller tips</h3>
                </div>
                <ul className="text-sm text-amber-800 space-y-2">
                  <li>Use the real condition of the copy.</li>
                  <li>Set stock above `1` if you have multiple copies.</li>
                  <li>Add a cover URL so your listing looks complete.</li>
                </ul>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Store className="w-5 h-5 text-slate-700" />
                  <h3 className="font-bold text-slate-900">
                    What happens next
                  </h3>
                </div>
                <p className="text-sm text-slate-600">
                  Once approved, buyers can add your listing to cart, check out,
                  and place orders through the marketplace flow.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              By listing a book, you confirm the condition details are accurate.
            </p>
            <Button type="submit" size="lg" isLoading={isSubmitting}>
              Submit listing
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Sell;
