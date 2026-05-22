import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Textarea } from "../components/ui/Textarea";
import { DEMO_ACCOUNTS } from "../constants/demoAccounts";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const navigateAfterLogin = () => {
    const role = JSON.parse(localStorage.getItem("user") || "{}")?.role;
    navigate(role === "ADMIN" ? "/admin" : "/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ name, email, password, phone, address });
      navigate("/login");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (demo: (typeof DEMO_ACCOUNTS)[number]) => {
    setError("");
    setIsSubmitting(true);

    try {
      await login({ email: demo.email, password: demo.password });
      navigateAfterLogin();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl ring-1 ring-black/5">
        <div>
          <h2 className="mt-2 text-center text-3xl font-black text-[var(--color-brand-dark-blue)] tracking-tight">
            Join ReBook
          </h2>
          <p className="mt-4 text-center text-sm text-gray-500">
            Create an account to track orders and sell your used books.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-900 mb-3">
            Reviewer shortcut
          </p>
          <p className="text-xs text-emerald-800 mb-3">
            Skip registration and enter the seeded demo accounts in one click.
          </p>
          <div className="grid gap-3">
            {DEMO_ACCOUNTS.map((demo) => (
              <button
                key={demo.email}
                type="button"
                onClick={() => void handleDemoLogin(demo)}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-left transition-colors hover:bg-emerald-100 disabled:opacity-60"
              >
                <div className="font-semibold text-[var(--color-brand-dark-blue)]">
                  {demo.label}
                </div>
                <div className="text-xs text-gray-500">{demo.roleHint}</div>
                <div className="text-xs text-gray-500 mt-1">{demo.email}</div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
            />
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
            />
            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
            />
            <Input
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Optional, for delivery updates"
            />
            <Textarea
              label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Optional, you can also add this later in your dashboard"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isSubmitting}
          >
            Create Account
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold text-[var(--color-brand-dark-blue)] hover:underline hover:text-[var(--color-brand-muted-orange)] transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
