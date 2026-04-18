import { useState } from "react";
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
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";

const STATS = [
  { title: "Total Sales", value: "$12,450", percent: "+14%", icon: BarChart3 },
  { title: "Active Users", value: "1,245", percent: "+8%", icon: Users },
  { title: "Total Books", value: "8,412", percent: "+2%", icon: BookOpen },
  { title: "Pending Approval", value: "24", percent: "-5%", icon: CheckCircle },
];

const RECENT_ORDERS = [
  {
    id: "#ORD-001",
    user: "Mike Ross",
    date: "Oct 14",
    total: "$45.00",
    status: "Shipped",
  },
  {
    id: "#ORD-002",
    user: "Rachel Zane",
    date: "Oct 14",
    total: "$22.50",
    status: "Processing",
  },
  {
    id: "#ORD-003",
    user: "Harvey Specter",
    date: "Oct 13",
    total: "$110.00",
    status: "Delivered",
  },
];

const PENDING_LISTINGS = [
  {
    id: "LST-99",
    title: "Calculus Early Transcendentals",
    user: "Tom A.",
    condition: "Good",
    price: "$40.00",
  },
  {
    id: "LST-100",
    title: "The Pragmatic Programmer",
    user: "Anna B.",
    condition: "Mint",
    price: "$25.00",
  },
];

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, logout } = useAuth();

  const MENU = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "books", label: "Manage Books", icon: BookOpen },
    { id: "approvals", label: "Listing Approvals", icon: CheckCircle },
    { id: "orders", label: "Orders", icon: PackageOpen },
    { id: "users", label: "Users", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ];

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
              {STATS.map((stat, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-brand-cream)] flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-[var(--color-brand-muted-orange)]" />
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${stat.percent.startsWith("+") ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
                    >
                      {stat.percent}
                    </span>
                  </div>
                  <p className="text-gray-500 font-medium text-sm mb-1">
                    {stat.title}
                  </p>
                  <h3 className="text-3xl font-black text-[var(--color-brand-dark-blue)] tracking-tight">
                    {stat.value}
                  </h3>
                </div>
              ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Approvals */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-[var(--color-brand-dark-blue)]">
                    Needs Approval
                  </h3>
                  <button className="text-xs font-bold text-[var(--color-brand-muted-orange)] hover:underline">
                    View All
                  </button>
                </div>
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50/50 text-gray-500 font-medium text-xs uppercase">
                      <tr>
                        <th className="px-5 py-3">Book</th>
                        <th className="px-5 py-3">User</th>
                        <th className="px-5 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {PENDING_LISTINGS.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/50">
                          <td className="px-5 py-4">
                            <p className="font-semibold text-[var(--color-brand-dark-blue)] line-clamp-1">
                              {item.title}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {item.condition} • {item.price}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-gray-600">
                            {item.user}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 text-xs w-auto"
                              >
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                className="h-8 px-3 text-xs w-auto bg-emerald-600 hover:bg-emerald-700"
                              >
                                Approve
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-[var(--color-brand-dark-blue)]">
                    Recent Orders
                  </h3>
                  <button className="text-xs font-bold text-[var(--color-brand-muted-orange)] hover:underline">
                    View All
                  </button>
                </div>
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50/50 text-gray-500 font-medium text-xs uppercase">
                      <tr>
                        <th className="px-5 py-3">Order ID</th>
                        <th className="px-5 py-3">Total</th>
                        <th className="px-5 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {RECENT_ORDERS.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50/50">
                          <td className="px-5 py-4">
                            <p className="font-semibold text-[var(--color-brand-dark-blue)]">
                              {order.id}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {order.user}
                            </p>
                          </td>
                          <td className="px-5 py-4 font-medium">
                            {order.total}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold inline-block ${
                                order.status === "Delivered"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : order.status === "Shipped"
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
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fallback for other tabs (Mocked for brevity) */}
        {activeTab !== "overview" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center animate-in fade-in duration-500">
            <MoreVertical className="w-12 h-12 text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-[var(--color-brand-dark-blue)] mb-2">
              Module Not Configured
            </h2>
            <p className="text-gray-500 max-w-md">
              The {activeTab} management module is part of the expanded admin
              functionality. Select Overview to see the dashboard.
            </p>
            <Button className="mt-6" onClick={() => setActiveTab("overview")}>
              Back to Overview
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
