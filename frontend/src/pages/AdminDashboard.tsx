import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  PackageOpen,
  CheckCircle,
  BarChart3,
  Settings,
  LogOut,
  Search,
  MoreVertical,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { adminService } from "../services/adminService";
import type { Order } from "../services/orderService";
import type { Book } from "../services/bookService";
import type { AdminUser } from "../services/adminService";

interface StatsData {
  totalSales: number;
  totalOrders: number;
  activeUsers: number;
  totalBooks: number;
  pendingApproval: number;
}

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingBooks, setPendingBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [allBooks, setAllBooks] = useState<Book[]>([]);

  const MENU = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "books", label: "Manage Books", icon: BookOpen },
    { id: "approvals", label: "Listing Approvals", icon: CheckCircle },
    { id: "orders", label: "Orders", icon: PackageOpen },
    { id: "users", label: "Users", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  useEffect(() => {
    loadOverviewData();
  }, []);

  useEffect(() => {
    if (activeTab === "orders") loadOrders();
    if (activeTab === "approvals") loadPendingBooks();
    if (activeTab === "users") loadUsers();
    if (activeTab === "books") loadAllBooks();
  }, [activeTab]);

  const loadOverviewData = async () => {
    setIsLoading(true);
    try {
      const [ordersData, booksData, usersData] = await Promise.all([
        adminService.getAllOrders(),
        adminService.getAllBooks(),
        adminService.getAllUsers(),
      ]);
      const totalSales = ordersData
        .filter((o) => o.paymentStatus === "COMPLETED")
        .reduce((sum, o) => sum + o.totalAmount, 0);
      const pendingBooks = booksData.filter(
        (b) => b.isUsed && b.approvalStatus === "PENDING"
      ).length;
      setStats({
        totalSales,
        totalOrders: ordersData.length,
        activeUsers: usersData.length,
        totalBooks: booksData.length,
        pendingApproval: pendingBooks,
      });
      setOrders(ordersData.slice(0, 5));
      setPendingBooks(booksData.filter((b) => b.isUsed && b.approvalStatus === "PENDING").slice(0, 5));
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAllOrders();
      setOrders(data);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPendingBooks = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getPendingBooks();
      setPendingBooks(data);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllBooks = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAllBooks();
      setAllBooks(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveBook = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      await adminService.approveBook(id, status);
      await loadPendingBooks();
      await loadOverviewData();
    } catch (err) {
      console.error("Failed to update book status:", err);
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: Order["status"]) => {
    try {
      await adminService.updateOrderStatus(id, status);
      await loadOrders();
    } catch (err) {
      console.error("Failed to update order status:", err);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col md:flex-row">
      {/* ADMIN SIDEBAR */}
      <aside className="w-full md:w-64 bg-[var(--color-brand-dark-blue)] text-white flex-shrink-0 relative z-10 md:min-h-[calc(100vh-80px)] hidden md:flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-[var(--color-brand-muted-orange)]" />
          <span className="font-bold text-lg tracking-tight uppercase">
            Admin Panel
          </span>
        </div>
        <nav className="flex-1 py-6 px-3 space-y-1">
          {MENU.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon
                className={`w-5 h-5 ${activeTab === item.id ? "text-[var(--color-brand-muted-orange)]" : ""}`}
              />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 text-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
              A
            </div>
            <div>
              <p className="font-medium line-clamp-1">
                {user?.name || "Admin User"}
              </p>
              <p className="text-gray-400 text-xs">
                {user?.role || "Superadmin"}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full py-2 flex items-center justify-center gap-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* ADMIN TOPBAR FOR MOBILE (Optional, skipping full mobile admin menu for brevity, keeping simple horizontal scroll if needed) */}

      {/* ADMIN MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-8 w-full overflow-hidden">
        {/* Header Search */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-brand-dark-blue)] capitalize">
            {activeTab.replace("-", " ")}
          </h1>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-muted-orange)]"
            />
          </div>
        </header>

        {activeTab === "overview" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {isLoading ? (
                <div className="col-span-4 flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand-muted-orange)]" />
                </div>
              ) : stats ? [
                { title: "Total Sales", value: `$${stats.totalSales.toFixed(0)}`, icon: BarChart3 },
                { title: "Active Users", value: String(stats.activeUsers), icon: Users },
                { title: "Total Books", value: String(stats.totalBooks), icon: BookOpen },
                { title: "Pending Approval", value: String(stats.pendingApproval), icon: CheckCircle },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-brand-cream)] flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-[var(--color-brand-muted-orange)]" />
                    </div>
                  </div>
                  <p className="text-gray-500 font-medium text-sm mb-1">
                    {stat.title}
                  </p>
                  <h3 className="text-3xl font-black text-[var(--color-brand-dark-blue)] tracking-tight">
                    {stat.value}
                  </h3>
                </div>
              )) : null}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Approvals */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-[var(--color-brand-dark-blue)]">
                    Needs Approval
                  </h3>
                  <button onClick={() => setActiveTab("approvals")} className="text-xs font-bold text-[var(--color-brand-muted-orange)] hover:underline">
                    View All
                  </button>
                </div>
                <div className="p-0 overflow-x-auto">
                  {pendingBooks.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">No pending listings</div>
                  ) : (
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50/50 text-gray-500 font-medium text-xs uppercase">
                        <tr>
                          <th className="px-5 py-3">Book</th>
                          <th className="px-5 py-3">Seller</th>
                          <th className="px-5 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {pendingBooks.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50/50">
                            <td className="px-5 py-4">
                              <p className="font-semibold text-[var(--color-brand-dark-blue)] line-clamp-1">
                                {item.title}
                              </p>
                              <p className="text-gray-500 text-xs">
                                {item.condition} • ${item.price.toFixed(2)}
                              </p>
                            </td>
                            <td className="px-5 py-4 text-gray-600">
                              {item.seller?.name ?? "Unknown"}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-3 text-xs w-auto"
                                  onClick={() => handleApproveBook(item.id, "REJECTED")}
                                >
                                  Reject
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-8 px-3 text-xs w-auto bg-emerald-600 hover:bg-emerald-700"
                                  onClick={() => handleApproveBook(item.id, "APPROVED")}
                                >
                                  Approve
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-[var(--color-brand-dark-blue)]">
                    Recent Orders
                  </h3>
                  <button onClick={() => setActiveTab("orders")} className="text-xs font-bold text-[var(--color-brand-muted-orange)] hover:underline">
                    View All
                  </button>
                </div>
                <div className="p-0 overflow-x-auto">
                  {orders.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">No orders yet</div>
                  ) : (
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50/50 text-gray-500 font-medium text-xs uppercase">
                        <tr>
                          <th className="px-5 py-3">Order ID</th>
                          <th className="px-5 py-3">Total</th>
                          <th className="px-5 py-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50/50">
                            <td className="px-5 py-4">
                              <p className="font-semibold text-[var(--color-brand-dark-blue)]">
                                #{order.id.slice(0, 8).toUpperCase()}
                              </p>
                              <p className="text-gray-500 text-xs">
                                {order.user?.name ?? "Unknown"}
                              </p>
                            </td>
                            <td className="px-5 py-4 font-medium">
                              ${order.totalAmount.toFixed(2)}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <span
                                className={`px-2 py-1 rounded text-xs font-bold inline-block ${
                                  order.status === "DELIVERED"
                                    ? "bg-emerald-50 text-emerald-600"
                                    : order.status === "SHIPPED"
                                      ? "bg-blue-50 text-blue-600"
                                      : "bg-amber-50 text-amber-600"
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fallback for other tabs */}
        {activeTab === "books" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[var(--color-brand-dark-blue)]">All Books</h2>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand-muted-orange)]" />
              </div>
            ) : allBooks.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <p className="text-gray-500">No books found.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50/50 text-gray-500 font-medium text-xs uppercase">
                    <tr>
                      <th className="px-5 py-3">Title</th>
                      <th className="px-5 py-3">Author</th>
                      <th className="px-5 py-3">Price</th>
                      <th className="px-5 py-3">Stock</th>
                      <th className="px-5 py-3">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allBooks.map((book) => (
                      <tr key={book.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-4 font-medium text-[var(--color-brand-dark-blue)]">{book.title}</td>
                        <td className="px-5 py-4 text-gray-600">{book.author}</td>
                        <td className="px-5 py-4">${book.price.toFixed(2)}</td>
                        <td className="px-5 py-4">{book.stock}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${book.isUsed ? "bg-[var(--color-brand-dark-blue)]/10 text-[var(--color-brand-dark-blue)]" : "bg-[var(--color-brand-muted-orange)]/10 text-[var(--color-brand-muted-orange)]"}`}>
                            {book.isUsed ? "Used" : "New"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "approvals" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[var(--color-brand-dark-blue)]">Pending Listings</h2>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand-muted-orange)]" />
              </div>
            ) : pendingBooks.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <p className="text-gray-500">No pending listings to review.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50/50 text-gray-500 font-medium text-xs uppercase">
                    <tr>
                      <th className="px-5 py-3">Book</th>
                      <th className="px-5 py-3">Seller</th>
                      <th className="px-5 py-3">Price</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pendingBooks.map((book) => (
                      <tr key={book.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-[var(--color-brand-dark-blue)]">{book.title}</p>
                          <p className="text-gray-500 text-xs">{book.condition} • {book.author}</p>
                        </td>
                        <td className="px-5 py-4 text-gray-600">{book.seller?.name ?? "Unknown"}</td>
                        <td className="px-5 py-4">${book.price.toFixed(2)}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" className="h-8 px-3 text-xs" onClick={() => handleApproveBook(book.id, "REJECTED")}>Reject</Button>
                            <Button size="sm" className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => handleApproveBook(book.id, "APPROVED")}>Approve</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[var(--color-brand-dark-blue)]">All Orders</h2>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand-muted-orange)]" />
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <p className="text-gray-500">No orders yet.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50/50 text-gray-500 font-medium text-xs uppercase">
                    <tr>
                      <th className="px-5 py-3">Order</th>
                      <th className="px-5 py-3">Customer</th>
                      <th className="px-5 py-3">Total</th>
                      <th className="px-5 py-3">Payment</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-4 font-medium text-[var(--color-brand-dark-blue)]">#{order.id.slice(0, 8).toUpperCase()}</td>
                        <td className="px-5 py-4 text-gray-600">{order.user?.name ?? "Unknown"}</td>
                        <td className="px-5 py-4">${order.totalAmount.toFixed(2)}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${order.paymentStatus === "COMPLETED" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === "DELIVERED" ? "bg-emerald-50 text-emerald-600" : order.status === "SHIPPED" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order["status"])}
                            className="text-xs border rounded px-2 py-1"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[var(--color-brand-dark-blue)]">All Users</h2>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand-muted-orange)]" />
              </div>
            ) : users.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <p className="text-gray-500">No users found.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50/50 text-gray-500 font-medium text-xs uppercase">
                    <tr>
                      <th className="px-5 py-3">Name</th>
                      <th className="px-5 py-3">Email</th>
                      <th className="px-5 py-3">Role</th>
                      <th className="px-5 py-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-4 font-medium text-[var(--color-brand-dark-blue)]">{u.name}</td>
                        <td className="px-5 py-4 text-gray-600">{u.email}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === "ADMIN" ? "bg-[var(--color-brand-dark-blue)]/10 text-[var(--color-brand-dark-blue)]" : "bg-gray-100 text-gray-600"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center animate-in fade-in duration-500">
            <MoreVertical className="w-12 h-12 text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-[var(--color-brand-dark-blue)] mb-2">
              Settings
            </h2>
            <p className="text-gray-500 max-w-md">
              Platform settings will be available in a future update.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
