import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, UserRound } from "lucide-react";
import { useAuth } from "../context/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from || "/";
  const message = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const account = await login({ email, password });
      navigate(account.role === "admin" ? "/admin" : from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-[75vh] bg-[#fcfbfa] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white border border-stone-200 shadow-xl p-8">
        <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center mb-5">
          <UserRound className="text-orange-500" size={30} />
        </div>
        <p className="text-xs uppercase tracking-[0.2em] font-bold text-orange-500">LittleBear Account</p>
        <h1 className="text-3xl font-bold text-stone-900 mt-2">Welcome back</h1>
        <p className="text-stone-500 mt-2 mb-7">Log in to continue shopping and checkout.</p>

        {message && (
          <div className="mb-5 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 text-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" autoComplete="off"
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Password</label>
            <input
              type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="Your password"
              autoComplete="new-password"
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />
          </div>

          <button disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 text-white px-5 py-3 font-bold hover:bg-orange-500 transition disabled:opacity-60">
            <LogIn size={18} /> {submitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          Don't have an account?{" "}
          <Link to="/register" state={{ from }} className="font-bold text-orange-500 hover:underline">Create one</Link>
        </p>

        <div className="mt-6 rounded-xl bg-stone-50 p-3 text-xs text-stone-500">
          Admin can still use the existing admin login from this page.
        </div>
      </div>
    </main>
  );
}
