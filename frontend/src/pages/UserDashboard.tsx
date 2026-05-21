import { useState, useEffect } from "react";
import {
  User,
  Package,
  Bookmark,
  Edit3,
  MessageSquare,
  LogOut,
  Settings,
  BookOpen,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { userService } from "../services/userService";
import type { Order } from "../services/orderService";
import type { Book, Review } from "../services/bookService";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  phone?: string;
  address?: string;
  age?: number;
}

export const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [listings, setListings] = useState<Book[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [, setSaved] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    age: "",
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (activeTab === "profile") {
          const data = (await userService.getUserDetails()) as UserProfile;
          setProfile(data);
          setEditForm({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            age: data.age?.toString() || "",
          });
        } else if (activeTab === "orders") {
          const data = await userService.getUserOrders();
          setOrders(data as Order[]);
        } else if (activeTab === "listed") {
          const data = await userService.getUserListings();
          setListings(data as Book[]);
        } else if (activeTab === "reviews") {
          const data = await userService.getUserReviews();
          setReviews(data as Review[]);
        } else if (activeTab === "saved") {
          const data = await userService.getUserSaved();
          setSaved(data);
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [activeTab]);

  const handleUpdateProfile = async () => {
    await userService.updateUserDetails(editForm);
    setIsEditing(false);
    const updated = await userService.getUserDetails();
    setProfile(updated as UserProfile);
  };

  const TABS = [
    { id: "profile", label: "Profile Overview", icon: User },
    { id: "orders", label: "Order History", icon: Package },
    { id: "saved", label: "Saved Books", icon: Bookmark },
    { id: "listed", label: "My Listings", icon: Edit3 },
    { id: "reviews", label: "My Reviews", icon: MessageSquare },
  ];

  return (
    <div className="bg-[var(--color-brand-cream)]/30 min-h-screen flex flex-col md:flex-row">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-white border-r border-black/5 flex-shrink-0 relative z-10 md:min-h-[calc(100vh-80px)]">
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-[var(--color-brand-muted-orange)]/10 rounded-full flex items-center justify-center text-[var(--color-brand-muted-orange)] font-bold text-xl">
              {(user?.name || "User").charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-[var(--color-brand-dark-blue)] line-clamp-1">
                {profile?.name || user?.name || "User"}
              </h2>
              <span className="text-xs text-gray-500">
                Member since {"Recent"}
              </span>
            </div>
          </div>

          <nav className="space-y-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-[var(--color-brand-dark-blue)] text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-[var(--color-brand-dark-blue)]"
                }`}
              >
                <tab.icon
                  className={`w-5 h-5 ${activeTab === tab.id ? "text-white" : "text-gray-400"}`}
                />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="mt-12 pt-6 border-t border-gray-100">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-10 max-w-5xl">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-bold text-[var(--color-brand-dark-blue)] mb-6">
              Profile Overview
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Total Orders
                  </p>
                  <p className="text-2xl font-bold text-[var(--color-brand-dark-blue)]">
                    {orders.length}
                  </p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Active Listings
                  </p>
                  <p className="text-2xl font-bold text-[var(--color-brand-dark-blue)]">
                    {
                      listings.filter(
                        (listing) => listing.approvalStatus === "APPROVED",
                      ).length
                    }
                  </p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Reviews Written
                  </p>
                  <p className="text-2xl font-bold text-[var(--color-brand-dark-blue)]">
                    {reviews.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 md:p-8">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-[var(--color-brand-dark-blue)]">
                  Personal Information
                </h2>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Settings className="w-4 h-4 mr-2" /> Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm({
                          name: (profile?.name as string) || "",
                          email: (profile?.email as string) || "",
                          phone: (profile?.phone as string) || "",
                          address: (profile?.address as string) || "",
                          age: profile?.age?.toString() || "",
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleUpdateProfile}
                    >
                      Save
                    </Button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                    Full Name
                  </label>
                  {!isEditing ? (
                    <p className="font-medium text-[var(--color-brand-dark-blue)] mt-1">
                      {profile?.name || user?.name || "User"}
                    </p>
                  ) : (
                    <input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="border p-1 mt-1 rounded"
                    />
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                    Email Address
                  </label>
                  {!isEditing ? (
                    <p className="font-medium text-[var(--color-brand-dark-blue)] mt-1">
                      {profile?.email || user?.email || ""}
                    </p>
                  ) : (
                    <input
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      className="border p-1 mt-1 rounded"
                    />
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                    Phone Number
                  </label>
                  {!isEditing ? (
                    <p className="font-medium text-[var(--color-brand-dark-blue)] mt-1">
                      {profile?.phone || "Not provided"}
                    </p>
                  ) : (
                    <input
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                      className="border p-1 mt-1 rounded w-full"
                      placeholder="+1 (555) 123-4567"
                    />
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                    Age
                  </label>
                  {!isEditing ? (
                    <p className="font-medium text-[var(--color-brand-dark-blue)] mt-1">
                      {profile?.age || "Not provided"}
                    </p>
                  ) : (
                    <input
                      type="number"
                      value={editForm.age}
                      onChange={(e) =>
                        setEditForm({ ...editForm, age: e.target.value })
                      }
                      className="border p-1 mt-1 rounded w-full"
                      placeholder="e.g. 25"
                    />
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                    Default Address
                  </label>
                  {!isEditing ? (
                    <p className="font-medium text-[var(--color-brand-dark-blue)] mt-1 text-sm">
                      {profile?.address || "Not provided"}
                    </p>
                  ) : (
                    <textarea
                      value={editForm.address}
                      onChange={(e) =>
                        setEditForm({ ...editForm, address: e.target.value })
                      }
                      className="border p-2 mt-1 rounded w-full min-h-[80px]"
                      placeholder="123 Market St, Apt 4B&#10;San Francisco, CA 94105"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-bold text-[var(--color-brand-dark-blue)] mb-6">
              Order History
            </h1>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand-muted-orange)]" />
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-black/5">
                <p className="text-gray-500">No orders yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-hover hover:shadow-md hover:border-gray-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-[var(--color-brand-dark-blue)]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[var(--color-brand-dark-blue)]">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()} •{" "}
                          {order.items?.length ?? 0} Items
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 justify-between md:justify-end w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                      <div className="text-left md:text-right">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="font-bold text-[var(--color-brand-dark-blue)]">
                          ${order.totalAmount.toFixed(2)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === "DELIVERED" ? "bg-emerald-50 text-emerald-600" : order.status === "SHIPPED" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === "listed" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-[var(--color-brand-dark-blue)]">
                My Listings
              </h1>
            </div>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand-muted-orange)]" />
              </div>
            ) : listings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-black/5">
                <p className="text-gray-500">No listings yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-black/5 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-bold text-[var(--color-brand-dark-blue)]">
                        {listing.title}
                      </h3>
                      <p className="text-sm text-[var(--color-brand-brown)] font-medium mt-1">
                        ${listing.price.toFixed(2)} • {listing.condition}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${listing.approvalStatus === "APPROVED" ? "bg-emerald-50 text-emerald-600" : listing.approvalStatus === "PENDING" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}
                      >
                        {listing.approvalStatus ??
                          (listing.isUsed ? "PENDING" : "APPROVED")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-bold text-[var(--color-brand-dark-blue)] mb-6">
              My Reviews
            </h1>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand-muted-orange)]" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-black/5">
                <p className="text-gray-500">No reviews yet.</p>
              </div>
            ) : (
              reviews.map((review: Review & { book?: { title: string } }) => (
                <div
                  key={review.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-black/5"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-[var(--color-brand-dark-blue)]">
                      {review.book?.title ?? "Unknown Book"}
                    </h3>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />{" "}
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-1 text-yellow-400 mb-3">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-600 italic">
                      "{review.comment}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Saved Tab */}
        {activeTab === "saved" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-bold text-[var(--color-brand-dark-blue)] mb-6">
              Saved Books
            </h1>
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-black/5 flex flex-col items-center text-center">
              <Bookmark className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500">You haven't saved any books yet.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
