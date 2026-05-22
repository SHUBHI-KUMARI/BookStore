import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CheckCircle,
  Layers3,
  Loader2,
  LogOut,
  PackageOpen,
  PlusCircle,
  Settings,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { useAuth } from "../hooks/useAuth";
import {
  adminService,
  type AdminUser,
  type Category,
} from "../services/adminService";
import type { Book } from "../services/bookService";
import type { Order } from "../services/orderService";

type AdminTab =
  | "overview"
  | "inventory"
  | "approvals"
  | "orders"
  | "users"
  | "settings";

const ORDER_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [pendingBooks, setPendingBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  });
  const [newBookForm, setNewBookForm] = useState({
    title: "",
    author: "",
    categoryId: "",
    price: "",
    stock: "",
    description: "",
    image: "",
  });

  const loadBaseData = async (tab: AdminTab) => {
    setIsLoading(true);
    setError("");

    try {
      if (tab === "overview") {
        const [ordersData, booksData, usersData, categoryData] =
          await Promise.all([
            adminService.getAllOrders(),
            adminService.getAllBooks(),
            adminService.getAllUsers(),
            adminService.getCategories(),
          ]);
        setOrders(ordersData);
        setBooks(booksData);
        setUsers(usersData);
        setCategories(categoryData);
        setPendingBooks(
          booksData.filter(
            (book) => book.isUsed && book.approvalStatus === "PENDING",
          ),
        );
        return;
      }

      if (tab === "inventory") {
        const [booksData, categoryData] = await Promise.all([
          adminService.getAllBooks(),
          adminService.getCategories(),
        ]);
        setBooks(booksData);
        setCategories(categoryData);
        return;
      }

      if (tab === "approvals") {
        setPendingBooks(await adminService.getPendingBooks());
        return;
      }

      if (tab === "orders") {
        setOrders(await adminService.getAllOrders());
        return;
      }

      if (tab === "users") {
        setUsers(await adminService.getAllUsers());
        return;
      }

      setCategories(await adminService.getCategories());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load admin data.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadBaseData(activeTab);
  }, [activeTab]);

  const stats = useMemo(() => {
    const totalSales = orders
      .filter((order) => order.paymentStatus === "COMPLETED")
      .reduce((sum, order) => sum + order.totalAmount, 0);

    const paidOrders = orders.filter(
      (order) => order.paymentStatus === "COMPLETED",
    ).length;

    return {
      totalSales,
      totalOrders: orders.length,
      paidOrders,
      totalBooks: books.length,
      pendingApproval: pendingBooks.length,
      totalUsers: users.length,
    };
  }, [orders, books, pendingBooks, users]);

  const menu = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "inventory", label: "Inventory", icon: BookOpen },
    { id: "approvals", label: "Approvals", icon: CheckCircle },
    { id: "orders", label: "Orders", icon: PackageOpen },
    { id: "users", label: "Users", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  const handleApproveBook = async (
    id: string,
    status: "APPROVED" | "REJECTED",
  ) => {
    setError("");
    try {
      await adminService.approveBook(id, status);
      const refreshed = await adminService.getPendingBooks();
      setPendingBooks(refreshed);
      if (activeTab === "overview" || activeTab === "inventory") {
        setBooks(await adminService.getAllBooks());
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update listing status.",
      );
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!window.confirm("Delete this book?")) return;

    setError("");
    try {
      await adminService.deleteBook(bookId);
      setBooks((current) => current.filter((book) => book.id !== bookId));
      setPendingBooks((current) =>
        current.filter((book) => book.id !== bookId),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete book.");
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    status: Order["status"],
  ) => {
    setError("");
    try {
      const updated = await adminService.updateOrderStatus(orderId, status);
      setOrders((current) =>
        current.map((order) => (order.id === updated.id ? updated : order)),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update the order.",
      );
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Delete this user account?")) return;

    setError("");
    try {
      await adminService.deleteUser(userId);
      setUsers((current) => current.filter((entry) => entry.id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user.");
    }
  };

  const handleAddCategory = async () => {
    if (!categoryForm.name.trim()) return;

    setError("");
    try {
      const created = await adminService.createCategory(
        categoryForm.name.trim(),
        categoryForm.description.trim() || undefined,
      );
      setCategories((current) => [...current, created]);
      setCategoryForm({ name: "", description: "" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create category.",
      );
    }
  };

  const handleAddBook = async () => {
    if (
      !newBookForm.title ||
      !newBookForm.author ||
      !newBookForm.categoryId ||
      !newBookForm.price ||
      !newBookForm.stock
    )
      return;

    setError("");
    try {
      await adminService.addBook({
        title: newBookForm.title,
        author: newBookForm.author,
        categoryId: newBookForm.categoryId,
        price: Number(newBookForm.price),
        stock: Number(newBookForm.stock),
        description: newBookForm.description,
        image: newBookForm.image || undefined,
      });
      setNewBookForm({
        title: "",
        author: "",
        categoryId: "",
        price: "",
        stock: "",
        description: "",
        image: "",
      });
      setBooks(await adminService.getAllBooks());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add book.");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-72 bg-[var(--color-brand-dark-blue)] text-white flex-shrink-0">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-[var(--color-brand-muted-orange)]" />
          <span className="font-bold text-lg tracking-tight uppercase">
            Admin Panel
          </span>
        </div>
        <nav className="flex-1 py-6 px-3 space-y-1">
          {menu.map((item) => (
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
                className={`w-5 h-5 ${
                  activeTab === item.id
                    ? "text-[var(--color-brand-muted-orange)]"
                    : ""
                }`}
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
              <p className="text-gray-400 text-xs">{user?.role || "ADMIN"}</p>
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

      <main className="flex-1 p-6 md:p-8 w-full">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-brand-dark-blue)] capitalize">
              {activeTab}
            </h1>
            <p className="text-gray-500">Run the marketplace from one place.</p>
          </div>
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  label: "Total sales",
                  value: `$${stats.totalSales.toFixed(2)}`,
                },
                { label: "Total orders", value: stats.totalOrders },
                { label: "Paid orders", value: stats.paidOrders },
                { label: "Total books", value: stats.totalBooks },
                { label: "Pending approvals", value: stats.pendingApproval },
                { label: "Total users", value: stats.totalUsers },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                >
                  <p className="text-sm text-gray-500 mb-2">{stat.label}</p>
                  <h3 className="text-3xl font-black text-[var(--color-brand-dark-blue)]">
                    {stat.value}
                  </h3>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-[var(--color-brand-dark-blue)]">
                    Listings awaiting approval
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("approvals")}
                  >
                    Open queue
                  </Button>
                </div>
                <div className="space-y-4">
                  {pendingBooks.slice(0, 4).map((book) => (
                    <div
                      key={book.id}
                      className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-semibold text-[var(--color-brand-dark-blue)]">
                          {book.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {book.seller?.name || "Unknown seller"} • $
                          {book.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApproveBook(book.id, "REJECTED")}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApproveBook(book.id, "APPROVED")}
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                  {!pendingBooks.length && (
                    <p className="text-sm text-gray-500">
                      No listings are waiting right now.
                    </p>
                  )}
                </div>
              </section>

              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-[var(--color-brand-dark-blue)]">
                    Recent orders
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("orders")}
                  >
                    Open orders
                  </Button>
                </div>
                <div className="space-y-4">
                  {orders.slice(0, 4).map((order) => (
                    <div
                      key={order.id}
                      className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                    >
                      <p className="font-semibold text-[var(--color-brand-dark-blue)]">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.user?.name} • {order.status} • $
                        {order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  ))}
                  {!orders.length && (
                    <p className="text-sm text-gray-500">
                      Orders will appear here as soon as buyers check out.
                    </p>
                  )}
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === "inventory" && (
          <div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6">
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-[var(--color-brand-dark-blue)]">
                  Inventory and marketplace listings
                </h2>
                <span className="text-sm text-gray-500">
                  {books.length} books
                </span>
              </div>
              <div className="space-y-4">
                {books.map((book) => (
                  <div
                    key={book.id}
                    className="border border-gray-100 rounded-2xl p-4"
                  >
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-[var(--color-brand-dark-blue)]">
                            {book.title}
                          </p>
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                            {book.isUsed ? book.condition : "NEW"}
                          </span>
                          {book.approvalStatus && (
                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                              {book.approvalStatus}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {book.author} • {book.category?.name} • Stock{" "}
                          {book.stock}
                        </p>
                        <p className="text-sm text-gray-500">
                          Seller: {book.seller?.name || "Store inventory"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {book.isUsed && book.approvalStatus === "PENDING" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleApproveBook(book.id, "APPROVED")
                            }
                          >
                            Approve
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleDeleteBook(book.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {!books.length && (
                  <p className="text-sm text-gray-500">
                    No books found in inventory yet.
                  </p>
                )}
              </div>
            </section>

            <section className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <PlusCircle className="w-5 h-5 text-emerald-600" />
                  <h2 className="font-bold text-[var(--color-brand-dark-blue)]">
                    Add store inventory
                  </h2>
                </div>
                <div className="space-y-4">
                  <Input
                    label="Title"
                    value={newBookForm.title}
                    onChange={(event) =>
                      setNewBookForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                  />
                  <Input
                    label="Author"
                    value={newBookForm.author}
                    onChange={(event) =>
                      setNewBookForm((current) => ({
                        ...current,
                        author: event.target.value,
                      }))
                    }
                  />
                  <Select
                    label="Category"
                    value={newBookForm.categoryId}
                    onChange={(event) =>
                      setNewBookForm((current) => ({
                        ...current,
                        categoryId: event.target.value,
                      }))
                    }
                    options={categories.map((category) => ({
                      value: category.id,
                      label: category.name,
                    }))}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Price"
                      type="number"
                      value={newBookForm.price}
                      onChange={(event) =>
                        setNewBookForm((current) => ({
                          ...current,
                          price: event.target.value,
                        }))
                      }
                    />
                    <Input
                      label="Stock"
                      type="number"
                      value={newBookForm.stock}
                      onChange={(event) =>
                        setNewBookForm((current) => ({
                          ...current,
                          stock: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <Input
                    label="Image URL"
                    value={newBookForm.image}
                    onChange={(event) =>
                      setNewBookForm((current) => ({
                        ...current,
                        image: event.target.value,
                      }))
                    }
                  />
                  <Textarea
                    label="Description"
                    value={newBookForm.description}
                    onChange={(event) =>
                      setNewBookForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                  />
                  <Button onClick={handleAddBook}>Add book</Button>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "approvals" && (
          <div className="space-y-4">
            {pendingBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[var(--color-brand-dark-blue)]">
                      {book.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {book.author} • {book.category?.name} • $
                      {book.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Seller: {book.seller?.name || "Unknown"}
                    </p>
                    {book.description && (
                      <p className="text-sm text-gray-600 mt-3">
                        {book.description}
                      </p>
                    )}
                    {book.sellerNotes && (
                      <p className="text-sm text-gray-600 mt-2">
                        Notes: {book.sellerNotes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApproveBook(book.id, "REJECTED")}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApproveBook(book.id, "APPROVED")}
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {!pendingBooks.length && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-gray-500">
                There are no used-book approvals waiting right now.
              </div>
            )}
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex flex-col xl:flex-row justify-between gap-6">
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-[var(--color-brand-dark-blue)]">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.user?.name} • {order.user?.email}
                      </p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>
                        Ship to: {order.shippingFullName},{" "}
                        {order.shippingAddressLine1}, {order.shippingCity},{" "}
                        {order.shippingState} {order.shippingPostalCode}
                      </p>
                      <p>
                        Payment: {order.paymentStatus}
                        {order.paymentReference
                          ? ` • ${order.paymentReference}`
                          : ""}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <p key={item.id} className="text-sm text-gray-600">
                          {item.quantity}x {item.book?.title} at $
                          {item.price.toFixed(2)}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 min-w-56">
                    <div className="text-right">
                      <p className="text-2xl font-black text-[var(--color-brand-dark-blue)]">
                        ${order.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">{order.status}</p>
                    </div>
                    <Select
                      label="Update Status"
                      value={order.status}
                      onChange={(event) =>
                        handleUpdateOrderStatus(
                          order.id,
                          event.target.value as Order["status"],
                        )
                      }
                      options={ORDER_STATUS_OPTIONS}
                    />
                  </div>
                </div>
              </div>
            ))}
            {!orders.length && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-gray-500">
                Orders will appear here after checkout activity.
              </div>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-4">
            {users.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-[var(--color-brand-dark-blue)]">
                        {entry.name}
                      </p>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          entry.role === "ADMIN"
                            ? "bg-[var(--color-brand-dark-blue)]/10 text-[var(--color-brand-dark-blue)]"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {entry.role}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{entry.email}</p>
                    <p className="text-sm text-gray-500">
                      Orders: {entry._count?.orders || 0} • Reviews:{" "}
                      {entry._count?.reviews || 0} • Listings:{" "}
                      {entry._count?.listedBooks || 0}
                    </p>
                  </div>
                  {entry.role !== "ADMIN" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleDeleteUser(entry.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete user
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="grid xl:grid-cols-2 gap-6">
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Layers3 className="w-5 h-5 text-[var(--color-brand-muted-orange)]" />
                <h2 className="font-bold text-[var(--color-brand-dark-blue)]">
                  Categories
                </h2>
              </div>
              <div className="space-y-4 mb-6">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="rounded-2xl border border-gray-100 p-4"
                  >
                    <p className="font-semibold text-[var(--color-brand-dark-blue)]">
                      {category.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {category.description || "No description"}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                <h2 className="font-bold text-[var(--color-brand-dark-blue)]">
                  Create category
                </h2>
              </div>
              <div className="space-y-4">
                <Input
                  label="Name"
                  value={categoryForm.name}
                  onChange={(event) =>
                    setCategoryForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
                <Textarea
                  label="Description"
                  value={categoryForm.description}
                  onChange={(event) =>
                    setCategoryForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                />
                <Button onClick={handleAddCategory}>Create category</Button>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
