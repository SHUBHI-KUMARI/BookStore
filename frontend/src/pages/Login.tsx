import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { DEMO_ACCOUNTS } from "../constants/demoAccounts";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const navigateAfterLogin = () => {
    const role = JSON.parse(localStorage.getItem("user") || "{}")?.role;
    navigate(role === "ADMIN" ? "/admin" : "/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigateAfterLogin();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (demo: (typeof DEMO_ACCOUNTS)[number]) => {
    setError("");
    setEmail(demo.email);
    setPassword(demo.password);
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
            Welcome back
          </h2>
          <p className="mt-4 text-center text-sm text-gray-500">
            Sign in to access your account, orders, and saved books.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900 mb-3">
            Reviewer demo access
          </p>
          <div className="grid gap-3">
            {DEMO_ACCOUNTS.map((demo) => (
              <button
                key={demo.email}
                type="button"
                onClick={() => void handleDemoLogin(demo)}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-left transition-colors hover:bg-amber-100 disabled:opacity-60"
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
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[var(--color-brand-muted-orange)] focus:ring-[var(--color-brand-muted-orange)] border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700"
              >
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <a
                href="#"
                className="font-bold text-[var(--color-brand-muted-orange)] hover:underline"
              >
                Forgot password?
              </a>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isSubmitting}
          >
            Sign in
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-bold text-[var(--color-brand-dark-blue)] hover:underline hover:text-[var(--color-brand-muted-orange)] transition-colors"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
