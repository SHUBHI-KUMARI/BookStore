import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "ADMIN">("CUSTOMER");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ name, email, password, role });
      navigate("/login");
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

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-bold text-[var(--color-brand-dark-blue)]">
                Account Type
              </label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="CUSTOMER"
                    checked={role === "CUSTOMER"}
                    onChange={() => setRole("CUSTOMER")}
                    className="h-4 w-4 text-[var(--color-brand-muted-orange)] border-gray-300 focus:ring-[var(--color-brand-dark-blue)]"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Customer (Buy/Sell Books)
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="ADMIN"
                    checked={role === "ADMIN"}
                    onChange={() => setRole("ADMIN")}
                    className="h-4 w-4 text-[var(--color-brand-muted-orange)] border-gray-300 focus:ring-[var(--color-brand-dark-blue)]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Admin</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2 italic">
                Note: Admin selection is visible for demo purposes only.
              </p>
            </div>
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
