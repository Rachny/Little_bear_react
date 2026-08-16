import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useAuth } from "../context/useAuth";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) return setError("Passwords don't match.");
    if (!agreed) return setError("Please agree to the Terms and Privacy Policy.");

    setSubmitting(true);
    try {
      await register({ name, email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-[75vh] bg-[#fcfbfa] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-3xl bg-[#fffdf8] border border-[#e6d8c4] shadow-xl p-8">
        <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center mb-5">
          <UserPlus className="text-orange-500" size={30} />
        </div>
        <p className="text-xs uppercase tracking-[0.2em] font-bold text-orange-500">LittleBear Account</p>
        <h1 className="text-3xl font-bold text-stone-900 mt-2">Create an account</h1>
        <p className="text-stone-500 mt-2 mb-7">Register to save your cart and buy your favorite companions.</p>

        {error && <div className="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Full name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Your name" autoComplete="name"
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" autoComplete="email"
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Password</label>
            <input type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters"
              autoComplete="new-password"
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Confirm password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} required value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 pr-11 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100" />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-500 hover:text-orange-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <label className="flex items-start gap-2 text-sm text-stone-500">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1" />
            <span>I agree to the Terms and Privacy Policy.</span>
          </label>

          <button disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 text-white px-5 py-3 font-bold hover:bg-orange-500 transition disabled:opacity-60">
            <UserPlus size={18} /> {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          Already have an account? <Link to="/login" state={{ from }} className="font-bold text-orange-500 hover:underline">Log in</Link>
        </p>
      </div>
    </main>
  );
}
