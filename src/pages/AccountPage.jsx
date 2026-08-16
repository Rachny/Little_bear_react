import { Link, Navigate, useNavigate } from "react-router-dom";
import { Mail, UserRound, ShieldCheck, LogOut, ShoppingBag } from "lucide-react";
import { useAuth } from "../context/useAuth";

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) return <main className="min-h-[70vh] flex items-center justify-center text-stone-500">Loading account...</main>;
  if (!user) return <Navigate to="/login" replace />;

  const initials = (user.name || user.email || "U").charAt(0).toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <main className="min-h-[75vh] bg-[#fcfbfa] px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-orange-500">LittleBear Account</p>
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mt-1">My Account</h1>
          <p className="text-stone-500 mt-2">Your account information is connected directly to Firebase Authentication.</p>
        </div>

        <section className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 md:px-8 py-8 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="h-20 w-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold">{initials}</div>
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-stone-900 truncate">{user.name}</h2>
              <p className="flex items-center gap-2 text-stone-600 mt-1 break-all"><Mail size={16} /> {user.email}</p>
              <span className="inline-flex items-center gap-1 mt-3 rounded-full bg-white border border-stone-200 px-3 py-1 text-xs font-bold text-stone-600">
                <ShieldCheck size={14} /> {user.role === "admin" ? "Administrator" : "Customer"}
              </span>
            </div>
          </div>

          <div className="p-6 md:p-8 grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-stone-200 p-5">
              <div className="flex items-center gap-3 mb-3"><UserRound className="text-orange-500" size={20} /><h3 className="font-bold">Name</h3></div>
              <p className="text-stone-600">{user.name}</p>
            </div>
            <div className="rounded-2xl border border-stone-200 p-5">
              <div className="flex items-center gap-3 mb-3"><Mail className="text-orange-500" size={20} /><h3 className="font-bold">Gmail / Email</h3></div>
              <p className="text-stone-600 break-all">{user.email}</p>
            </div>
          </div>

          <div className="px-6 md:px-8 pb-8 flex flex-col sm:flex-row gap-3">
            <Link to="/shop" className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 text-white px-5 py-3 font-bold hover:bg-orange-500 no-underline">
              <ShoppingBag size={18} /> Continue shopping
            </Link>
            {user.role === "admin" && (
              <Link to="/admin" className="inline-flex items-center justify-center rounded-xl border border-stone-200 px-5 py-3 font-bold text-stone-700 hover:bg-stone-50 no-underline">
                Admin Dashboard
              </Link>
            )}
            <button onClick={handleLogout} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 text-red-600 px-5 py-3 font-bold hover:bg-red-50">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
