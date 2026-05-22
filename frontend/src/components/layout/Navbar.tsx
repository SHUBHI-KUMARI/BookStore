import { useState } from "react";
import {
  ShoppingCart,
  User,
  Menu,
  Search,
  BookOpen,
  LogOut,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const firstName = user?.name?.trim().split(/\\s+/)[0] || "Reader";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 flex-shrink-0 transition-transform hover:scale-105"
          >
            <BookOpen className="h-8 w-8 text-amber-600" />
            <span className="font-serif text-2xl font-black text-slate-900 tracking-tight">
              ReBook
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/books"
              className="text-slate-600 font-medium hover:text-slate-900 transition-colors"
            >
              New Arrivals
            </Link>
            <Link
              to="/books?isUsed=true"
              className="text-slate-600 font-medium hover:text-slate-900 transition-colors"
            >
              Used Books
            </Link>
            <Link
              to="/sell"
              className="text-amber-600 font-medium hover:text-amber-700 transition-colors flex items-center gap-1"
            >
              Sell Yours
              <span className="flex h-2 w-2 relative ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            </Link>
          </div>

          {/* Desktop Action Icons */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="relative group cursor-pointer p-2 hover:bg-slate-100 rounded-full transition-colors">
              <Search className="h-5 w-5 text-slate-600 hover:text-slate-900" />
            </div>

            <Link
              to="/cart"
              className="relative group p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ShoppingCart className="h-5 w-5 text-slate-600 group-hover:text-slate-900" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center h-4 w-4 rounded-full bg-amber-500 text-[10px] font-bold text-white shadow ring-2 ring-white">
                  {itemCount}
                </span>
              )}
            </Link>

            <div className="h-6 w-px bg-slate-200 mx-2"></div>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  to={user?.role === "ADMIN" ? "/admin" : "/dashboard"}
                  className="text-slate-700 font-medium hover:text-amber-600 hover:underline flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold border border-amber-200">
                    {firstName.substring(0, 1).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline-block">
                    Hi, {firstName}
                  </span>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-slate-500 hover:text-red-500 p-2 hover:bg-red-50 rounded-full"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button
                  size="sm"
                  variant="outline"
                  className="hidden lg:flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-full px-5"
                >
                  <User className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-4">
            <Link to="/cart" className="relative p-2">
              <ShoppingCart className="h-5 w-5 text-slate-700" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center h-4 w-4 rounded-full bg-amber-500 text-xs font-bold text-white shadow">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              className="text-slate-600 hover:text-slate-900 p-2 bg-slate-100 rounded-full"
              onClick={() => setIsMobileMenuOpen((current) => !current)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-slate-100">
            <div className="flex flex-col gap-2 pt-4">
              <Link
                to="/books"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100"
              >
                New Arrivals
              </Link>
              <Link
                to="/books?isUsed=true"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100"
              >
                Used Books
              </Link>
              <Link
                to="/sell"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100"
              >
                Sell Yours
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to={user?.role === "ADMIN" ? "/admin" : "/dashboard"}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100"
                  >
                    {user?.role === "ADMIN" ? "Admin Panel" : "Dashboard"}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-xl text-left text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
