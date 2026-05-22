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
  LayoutDashboard,
  TrendingUp,
  Library,
  BookMarked
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
  const [activeTab, setActiveTab] = useState("dashboard");
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
        if (activeTab === "dashboard") {
          const [ordersData, listingsData, reviewsData, profileData] = await Promise.all([
            userService.getUserOrders(),
            userService.getUserListings(),
            userService.getUserReviews(),
            userService.getUserDetails()
          ]);
          setOrders(ordersData as Order[]);
          setListings(listingsData as Book[]);
          setReviews(reviewsData as Review[]);
          setProfile(profileData as UserProfile);
        } else if (activeTab === "profile") {
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
      } catch (err) {
        console.error("Failed to load data", err);
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
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "orders", label: "Order History", icon: Package },
    { id: "listed", label: "My Listings", icon: Edit3 },
    { id: "reviews", label: "My Reviews", icon: MessageSquare },
    { id: "saved", label: "Saved Books", icon: Bookmark },
    { id: "profile", label: "Profile Settings", icon: User },
  ];

  // Calculate Metrics Let's conditionally extract total items purchased and amount.
  const totalBooksPurchased = orders.reduce((sum, order) => sum + (order.items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0), 0);
  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const activeListingsCount = listings.filter((l) => l.approvalStatus === "APPROVED").length;

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col md:flex-row">
      {/* SIDEBAR */}
      <aside className="w-full md:w-72 bg-white border-r border-slate-200 flex-shrink-0 relative z-10 md:min-h-[calc(100vh-80px)]">
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-2xl border border-amber-200 shadow-sm">
              {(profile?.name || user?.name || "User").charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl text-slate-900 line-clamp-1">
                {profile?.name || user?.name || "User"}
              </h2>
              <span className="text-sm text-slate-500 font-medium">Reader</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all ${activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
              >
                <tab.icon
                  className={`w-5 h-5 ${activeTab === tab.id ? "text-amber-400" : "text-slate-400 group-hover:text-slate-600"}`}
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

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 max-w-6xl mx-auto w-full">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">Welcome Back, {profile?.name?.split(" ")[0] || "Reader"}</h1>
              <p className="text-slate-500">Here is what is happening with your reading journey.</p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
              </div>
            ) : (
              <>
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <Library className="w-6 h-6" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-slate-900 mb-1">{totalBooksPurchased}</h3>
                      <p className="text-sm text-slate-500 font-medium">Books Purchased</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-slate-900 mb-1">{activeListingsCount}</h3>
                      <p className="text-sm text-slate-500 font-medium">Active Listings</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-slate-900 mb-1">${totalSpent.toFixed(2)}</h3>
                      <p className="text-sm text-slate-500 font-medium">Total Spent</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-slate-900 mb-1">{reviews.length}</h3>
                      <p className="text-sm text-slate-500 font-medium">Reviews Written</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity panels */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                  {/* Recent Orders */}
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-serif font-bold text-slate-900">Recent Orders</h2>
                      <button onClick={() => setActiveTab("orders")} className="text-amber-600 text-sm font-medium hover:underline">View All</button>
                    </div>
                    {orders.length === 0 ? (
                      <p className="text-slate-500 text-sm">No recent orders found.</p>
                    ) : (
                      <div className="space-y-4">
                        {orders.slice(0, 3).map(o => (
                          <div key={o.id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                                <Package className="w-5 h-5 text-slate-400" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">Order #{o.id.slice(0, 6).toUpperCase()}</p>
                                <p className="text-xs text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <span className="font-bold text-slate-900">${o.totalAmount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Reviews */}
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-serif font-bold text-slate-900">Recent Reviews</h2>
                      <button onClick={() => setActiveTab("reviews")} className="text-amber-600 text-sm font-medium hover:underline">View All</button>
                    </div>
                    {reviews.length === 0 ? (
                      <p className="text-slate-500 text-sm">No recent reviews found.</p>
                    ) : (
                      <div className="space-y-4">
                        {reviews.slice(0, 3).map(r => (
                          <div key={r.id} className="py-3 border-b border-slate-50 last:border-0">
                            <div className="flex justify-between items-center mb-1">
                              <p className="font-medium text-slate-900 truncate pr-4">{r.book?.title || "Book"}</p>
                              <div className="flex text-amber-400 shrink-0">
                                {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                              </div>
                            </div>
                            <p className="text-sm text-slate-500 line-clamp-1 italic">"{r.comment}"</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-6">
              Profile Settings
            </h1>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h2 className="text-xl font-serif font-bold text-slate-900">
                  Personal Information
                </h2>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="rounded-full border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    <Settings className="w-4 h-4 mr-2" /> Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
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
                      className="rounded-full border-slate-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-slate-900 text-white rounded-full hover:bg-slate-800"
                      onClick={handleUpdateProfile}
                    >
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2 block">
                    Full Name
                  </label>
                  {!isEditing ? (
                    <p className="font-medium text-slate-900 text-lg">
                      {profile?.name || user?.name || "User"}
                    </p>
                  ) : (
                    <input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                    />
                  )}
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2 block">
                    Email Address
                  </label>
                  {!isEditing ? (
                    <p className="font-medium text-slate-900 text-lg">
                      {profile?.email || user?.email || ""}
                    </p>
                  ) : (
                    <input
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                    />
                  )}
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2 block">
                    Phone Number
                  </label>
                  {!isEditing ? (
                    <p className="font-medium text-slate-900 text-lg">
                      {profile?.phone || "Not provided"}
                    </p>
                  ) : (
                    <input
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                      className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                      placeholder="+1 (555) 123-4567"
                    />
                  )}
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2 block">
                    Age
                  </label>
                  {!isEditing ? (
                    <p className="font-medium text-slate-900 text-lg">
                      {profile?.age || "Not provided"}
                    </p>
                  ) : (
                    <input
                      type="number"
                      value={editForm.age}
                      onChange={(e) =>
                        setEditForm({ ...editForm, age: e.target.value })
                      }
                      className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                      placeholder="e.g. 25"
                    />
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2 block">
                    Default Delivery Address
                  </label>
                  {!isEditing ? (
                    <p className="font-medium text-slate-900 text-lg">
                      {profile?.address || "Not provided"}
                    </p>
                  ) : (
                    <textarea
                      value={editForm.address}
                      onChange={(e) =>
                        setEditForm({ ...editForm, address: e.target.value })
                      }
                      className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all min-h-[100px]"
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
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-6">
              Order History
            </h1>
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 flex flex-col items-center">
                <Package className="w-16 h-16 text-slate-300 mb-6" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">No Orders Yet</h3>
                <p className="text-slate-500">When you purchase books, they will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md hover:border-amber-200"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                        <Package className="w-6 h-6 text-slate-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 mb-1">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium">
                          {new Date(order.createdAt).toLocaleDateString()} •{" "}
                          {order.items?.length ?? 0} Items
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 justify-between md:justify-end w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <div className="text-left md:text-right">
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Total</p>
                        <p className="text-xl font-bold text-slate-900">
                          ${order.totalAmount.toFixed(2)}
                        </p>
                      </div>
                      <span
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold tracking-wide uppercase ${order.status === "DELIVERED" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : order.status === "SHIPPED" ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-amber-50 text-amber-600 border border-amber-100"}`}
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
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-6">
              My Listings
            </h1>
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
              </div>
            ) : listings.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 flex flex-col items-center">
                <Edit3 className="w-16 h-16 text-slate-300 mb-6" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">No Listings</h3>
                <p className="text-slate-500">You haven't listed any books for sale yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col justify-between"
                  >
                    <div className="mb-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-slate-900 line-clamp-2">
                          {listing.title}
                        </h3>
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider shrink-0 ml-4 ${listing.approvalStatus === "APPROVED" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : listing.approvalStatus === "PENDING" ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-red-50 text-red-600 border border-red-100"}`}
                        >
                          {listing.approvalStatus ?? (listing.isUsed ? "PENDING" : "APPROVED")}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 font-medium">Condition: {listing.condition}</p>
                    </div>
                    <div className="pt-4 border-t border-slate-50">
                      <span className="text-2xl font-bold text-slate-900">${listing.price.toFixed(2)}</span>
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
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-6">
              My Reviews
            </h1>
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 flex flex-col items-center">
                <MessageSquare className="w-16 h-16 text-slate-300 mb-6" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">No Reviews</h3>
                <p className="text-slate-500">You haven't written any book reviews yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((review: Review & { book?: { title: string } }) => (
                  <div
                    key={review.id}
                    className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-lg text-slate-900 flex-1 pr-4 line-clamp-2">
                        {review.book?.title ?? "Unknown Book"}
                      </h3>
                      <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 shrink-0 bg-slate-50 px-2.5 py-1 rounded-lg">
                        <Clock className="w-3 h-3" />{" "}
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`text-lg ${i < review.rating ? "text-amber-400" : "text-slate-200"}`}>★</span>
                      ))}
                    </div>
                    {review.comment && (
                      <p className="text-slate-600 leading-relaxed italic bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        "{review.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Saved Tab */}
        {activeTab === "saved" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-6">
              Saved Books
            </h1>
            <div className="bg-white rounded-3xl p-16 border border-slate-100 flex flex-col items-center text-center">
              <BookMarked className="w-16 h-16 text-slate-300 mb-6" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">No Saved Books</h3>
              <p className="text-slate-500">Save books you're interested in for later reading.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
