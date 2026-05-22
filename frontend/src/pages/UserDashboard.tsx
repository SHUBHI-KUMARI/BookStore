import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  LayoutDashboard,
  Loader2,
  LogOut,
  MessageSquare,
  Package,
  Pencil,
  Save,
  ShieldCheck,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { useAuth } from "../hooks/useAuth";
import { bookService, type Book, type Review } from "../services/bookService";
import { orderService, type Order } from "../services/orderService";
import { userService, type UserProfile } from "../services/userService";
import api from "../services/api";

type DashboardTab = "overview" | "orders" | "listings" | "reviews" | "profile";

type EditableListing = {
  id: string;
  title: string;
  author: string;
  categoryId: string;
  condition: Book["condition"];
  price: string;
  stock: string;
  description: string;
  sellerNotes: string;
  image: string;
};

const LISTING_CONDITIONS = [
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  { value: "POOR", label: "Poor" },
];

const ORDER_STATUS_STYLES: Record<Order["status"], string> = {
  PENDING: "bg-amber-50 text-amber-700",
  PROCESSING: "bg-blue-50 text-blue-700",
  SHIPPED: "bg-purple-50 text-purple-700",
  DELIVERED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-600",
};

export const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [listings, setListings] = useState<Book[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [categories, setCategories] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editingListing, setEditingListing] = useState<EditableListing | null>(
    null,
  );
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    age: "",
  });

  const loadData = async (tab: DashboardTab) => {
    setIsLoading(true);
    setError("");

    try {
      if (tab === "overview") {
        const [profileData, ordersData, listingsData, reviewsData] =
          await Promise.all([
            userService.getUserDetails(),
            orderService.getUserOrders(),
            userService.getUserListings(),
            userService.getUserReviews(),
          ]);
        setProfile(profileData);
        setOrders(ordersData);
        setListings(listingsData);
        setReviews(reviewsData);
        setProfileForm({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone || "",
          address: profileData.address || "",
          age: profileData.age?.toString() || "",
        });
        return;
      }

      if (tab === "orders") {
        setOrders(await orderService.getUserOrders());
        return;
      }

      if (tab === "listings") {
        const [listingData, categoryData] = await Promise.all([
          userService.getUserListings(),
          api.get("/categories"),
        ]);
        setListings(listingData);
        setCategories(
          categoryData.data.map((category: { id: string; name: string }) => ({
            value: category.id,
            label: category.name,
          })),
        );
        return;
      }

      if (tab === "reviews") {
        setReviews(await userService.getUserReviews());
        return;
      }

      const profileData = await userService.getUserDetails();
      setProfile(profileData);
      setProfileForm({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone || "",
        address: profileData.address || "",
        age: profileData.age?.toString() || "",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load your dashboard data.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData(activeTab);
  }, [activeTab]);

  const metrics = useMemo(() => {
    const booksPurchased = orders.reduce(
      (sum, order) =>
        sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    );
    const totalSpent = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );
    const activeListings = listings.filter(
      (listing) => listing.approvalStatus === "APPROVED" && listing.stock > 0,
    ).length;

    return {
      booksPurchased,
      totalSpent,
      activeListings,
      reviewsWritten: reviews.length,
    };
  }, [orders, listings, reviews]);

  const openListingEditor = (listing: Book) => {
    setEditingListing({
      id: listing.id,
      title: listing.title,
      author: listing.author,
      categoryId: listing.categoryId,
      condition: listing.condition,
      price: listing.price.toString(),
      stock: listing.stock.toString(),
      description: listing.description || "",
      sellerNotes: listing.sellerNotes || "",
      image: listing.image || "",
    });
  };

  const handleListingFieldChange = (
    key: keyof EditableListing,
    value: string,
  ) => {
    setEditingListing((current) =>
      current
        ? {
            ...current,
            [key]: value,
          }
        : current,
    );
  };

  const handleSaveListing = async () => {
    if (!editingListing) return;

    setIsLoading(true);
    setError("");

    try {
      await bookService.updateBook(editingListing.id, {
        title: editingListing.title,
        author: editingListing.author,
        categoryId: editingListing.categoryId,
        condition: editingListing.condition,
        price: Number(editingListing.price),
        stock: Number(editingListing.stock),
        description: editingListing.description,
        sellerNotes: editingListing.sellerNotes,
        image: editingListing.image || undefined,
      });
      setEditingListing(null);
      setListings(await userService.getUserListings());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save listing changes.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!window.confirm("Delete this listing?")) return;

    setIsLoading(true);
    setError("");
    try {
      await bookService.deleteBook(listingId);
      setListings((current) =>
        current.filter((listing) => listing.id !== listingId),
      );
      if (editingListing?.id === listingId) {
        setEditingListing(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete the listing.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm("Cancel this order?")) return;

    setIsLoading(true);
    setError("");
    try {
      const updated = await orderService.cancelOrder(orderId);
      setOrders((current) =>
        current.map((order) => (order.id === updated.id ? updated : order)),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to cancel the order.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setError("");

    try {
      const updated = await userService.updateUserDetails(profileForm);
      setProfile(updated);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update profile.",
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const tabs: Array<{ id: DashboardTab; label: string; icon: typeof User }> = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: "Orders", icon: Package },
    { id: "listings", label: "Listings", icon: BookOpen },
    { id: "reviews", label: "Reviews", icon: MessageSquare },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-72 bg-white border-r border-slate-200 flex-shrink-0">
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-2xl border border-amber-200 shadow-sm">
              {(profile?.name || user?.name || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl text-slate-900 line-clamp-1">
                {profile?.name || user?.name || "Reader"}
              </h2>
              <span className="text-sm text-slate-500 font-medium">
                Buyer and seller
              </span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <tab.icon
                  className={`w-5 h-5 ${
                    activeTab === tab.id ? "text-amber-400" : "text-slate-400"
                  }`}
                />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="mt-12 pt-6 border-t border-slate-100">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5 opacity-70" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 lg:p-12 max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">
            {activeTab === "overview" && "Your marketplace dashboard"}
            {activeTab === "orders" && "Order history"}
            {activeTab === "listings" && "Manage your listings"}
            {activeTab === "reviews" && "Your reviews"}
            {activeTab === "profile" && "Profile settings"}
          </h1>
          <p className="text-slate-500">
            Track purchases, keep listings healthy, and manage your seller
            profile from one place.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="mb-6 flex items-center gap-2 text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading data...
          </div>
        )}

        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: "Books purchased",
                  value: metrics.booksPurchased,
                },
                {
                  label: "Total spent",
                  value: `$${metrics.totalSpent.toFixed(2)}`,
                },
                {
                  label: "Active listings",
                  value: metrics.activeListings,
                },
                {
                  label: "Reviews written",
                  value: metrics.reviewsWritten,
                },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
                >
                  <p className="text-sm text-slate-500 mb-2">{metric.label}</p>
                  <h3 className="text-3xl font-bold text-slate-900">
                    {metric.value}
                  </h3>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-serif font-bold text-slate-900">
                    Recent orders
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("orders")}
                  >
                    View all
                  </Button>
                </div>
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-sm text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="font-bold text-slate-900">
                        ${order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {!orders.length && (
                    <p className="text-sm text-slate-500">No orders yet.</p>
                  )}
                </div>
              </section>

              <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-serif font-bold text-slate-900">
                    Listing health
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("listings")}
                  >
                    Manage
                  </Button>
                </div>
                <div className="space-y-4">
                  {listings.slice(0, 3).map((listing) => (
                    <div
                      key={listing.id}
                      className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {listing.title}
                        </p>
                        <p className="text-sm text-slate-500">
                          {listing.approvalStatus || "APPROVED"} •{" "}
                          {listing.stock} in stock
                        </p>
                      </div>
                      <span className="font-bold text-slate-900">
                        ${listing.price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {!listings.length && (
                    <p className="text-sm text-slate-500">
                      No listings yet. Start selling from the Sell page.
                    </p>
                  )}
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-lg font-bold text-slate-900">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </h2>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${ORDER_STATUS_STYLES[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      Payment: {order.paymentStatus}
                      {order.paymentReference
                        ? ` • ${order.paymentReference}`
                        : ""}
                    </p>
                    <p className="text-sm text-slate-500">
                      Delivery: {order.deliveryMethod} • {order.shippingCity},{" "}
                      {order.shippingState}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">
                      ${order.totalAmount.toFixed(2)}
                    </p>
                    <p className="text-sm text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium text-slate-900">
                          {item.book?.title || "Book"}
                        </p>
                        <p className="text-slate-500">
                          Qty {item.quantity} • ${item.price.toFixed(2)} each
                        </p>
                      </div>
                      <span className="font-semibold text-slate-900">
                        ${(item.quantity * item.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {["PENDING", "PROCESSING"].includes(order.status) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelOrder(order.id)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel order
                  </Button>
                )}
              </div>
            ))}
            {!orders.length && (
              <div className="bg-white rounded-3xl border border-slate-100 p-8 text-slate-500">
                You have not placed any orders yet.
              </div>
            )}
          </div>
        )}

        {activeTab === "listings" && (
          <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-8">
            <div className="space-y-4">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm"
                >
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-lg font-bold text-slate-900">
                          {listing.title}
                        </h2>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                          {listing.approvalStatus || "APPROVED"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mb-2">
                        {listing.author} • {listing.category?.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        ${listing.price.toFixed(2)} • {listing.stock} in stock
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openListingEditor(listing)}
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleDeleteListing(listing.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {!listings.length && (
                <div className="bg-white rounded-3xl border border-slate-100 p-8 text-slate-500">
                  No listings yet. Publish your first book from the Sell page.
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm h-fit">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <h2 className="text-xl font-bold text-slate-900">
                  {editingListing ? "Edit listing" : "Listing editor"}
                </h2>
              </div>

              {editingListing ? (
                <div className="space-y-4">
                  <Input
                    label="Title"
                    value={editingListing.title}
                    onChange={(event) =>
                      handleListingFieldChange("title", event.target.value)
                    }
                  />
                  <Input
                    label="Author"
                    value={editingListing.author}
                    onChange={(event) =>
                      handleListingFieldChange("author", event.target.value)
                    }
                  />
                  <Select
                    label="Category"
                    value={editingListing.categoryId}
                    onChange={(event) =>
                      handleListingFieldChange("categoryId", event.target.value)
                    }
                    options={categories}
                  />
                  <Select
                    label="Condition"
                    value={editingListing.condition}
                    onChange={(event) =>
                      handleListingFieldChange(
                        "condition",
                        event.target.value as Book["condition"],
                      )
                    }
                    options={LISTING_CONDITIONS}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Price"
                      type="number"
                      value={editingListing.price}
                      onChange={(event) =>
                        handleListingFieldChange("price", event.target.value)
                      }
                    />
                    <Input
                      label="Stock"
                      type="number"
                      value={editingListing.stock}
                      onChange={(event) =>
                        handleListingFieldChange("stock", event.target.value)
                      }
                    />
                  </div>
                  <Input
                    label="Image URL"
                    value={editingListing.image}
                    onChange={(event) =>
                      handleListingFieldChange("image", event.target.value)
                    }
                  />
                  <Textarea
                    label="Description"
                    value={editingListing.description}
                    onChange={(event) =>
                      handleListingFieldChange(
                        "description",
                        event.target.value,
                      )
                    }
                  />
                  <Textarea
                    label="Seller Notes"
                    value={editingListing.sellerNotes}
                    onChange={(event) =>
                      handleListingFieldChange(
                        "sellerNotes",
                        event.target.value,
                      )
                    }
                  />
                  <div className="flex gap-3">
                    <Button onClick={handleSaveListing}>
                      <Save className="w-4 h-4 mr-2" />
                      Save and resubmit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingListing(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Seller edits send the listing back into admin review so the
                    marketplace stays trustworthy.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Pick a listing to edit its details, adjust stock, or improve
                  the seller notes seen during admin review.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h2 className="font-bold text-slate-900">
                      {review.book?.title || "Purchased book"}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-amber-500 font-bold">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                </div>
                <p className="text-slate-600">
                  {review.comment || "No written comment provided."}
                </p>
              </div>
            ))}
            {!reviews.length && (
              <div className="bg-white rounded-3xl border border-slate-100 p-8 text-slate-500">
                Reviews appear here after you buy and rate books.
              </div>
            )}
          </div>
        )}

        {activeTab === "profile" && (
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm max-w-3xl">
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Name"
                value={profileForm.name}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
              <Input
                label="Email"
                type="email"
                value={profileForm.email}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
              />
              <Input
                label="Phone"
                value={profileForm.phone}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
              />
              <Input
                label="Age"
                value={profileForm.age}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    age: event.target.value,
                  }))
                }
              />
            </div>

            <div className="mt-6">
              <Textarea
                label="Address"
                value={profileForm.address}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    address: event.target.value,
                  }))
                }
              />
            </div>

            <div className="mt-8">
              <Button isLoading={isSavingProfile} onClick={handleSaveProfile}>
                Save profile
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
