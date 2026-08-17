import { NavLink, Link, useLocation } from "react-router-dom";
import { User, LogOut, Menu, X, Heart } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { getCart } from "../lib/cartStore";
import { getFavorites, removeFavorite } from "../lib/favoritesStore";
import { useEffect, useState } from "react";

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [cartCount, setCartCount] = useState(() =>
    getCart().reduce((sum, item) => sum + item.qty, 0)
  );
  const [favorites, setFavorites] = useState(() => getFavorites());

  useEffect(() => {
    const refresh = () =>
      setCartCount(getCart().reduce((sum, item) => sum + item.qty, 0));
    window.addEventListener("littlebear-cart-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("littlebear-cart-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    const refreshFavorites = () => setFavorites(getFavorites());
    window.addEventListener("littlebear-favorites-updated", refreshFavorites);
    window.addEventListener("storage", refreshFavorites);
    return () => {
      window.removeEventListener("littlebear-favorites-updated", refreshFavorites);
      window.removeEventListener("storage", refreshFavorites);
    };
  }, []);

  // Close the mobile menu whenever the user changes pages.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Prevent the page from scrolling behind the open mobile menu.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const navClass = ({ isActive }) =>
    isActive
      ? "rounded-full bg-orange-200 text-slate-900 px-6 py-2 font-semibold shadow-sm transition hover:bg-orange-300 underline decoration-slate-900 decoration-2 underline-offset-2 no-underline"
      : "rounded-full bg-orange-50 text-slate-900 px-6 py-2 font-medium shadow-sm transition hover:bg-orange-100 no-underline";

  const mobileNavClass = ({ isActive }) =>
    `block rounded-xl px-4 py-3 font-semibold no-underline transition ${
      isActive
        ? "bg-orange-100 text-orange-600"
        : "text-slate-800 hover:bg-orange-50"
    }`;

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
  };

  return (
    <nav className="bg-[#f7f5f0] border-b border-slate-200 sticky top-0 z-[100] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 sm:gap-3 font-bold text-2xl md:text-3xl text-gray-900 no-underline shrink-0"
        >
          <span className="text-3xl">🧸</span>
          <span
            style={{
              fontFamily: "Fredoka, system-ui, sans-serif",
              letterSpacing: "-0.5px",
            }}
          >
            Little<span className="text-orange-500">Bear</span>
          </span>
        </Link>

        {/* Desktop navigation - hidden on admin pages */}
        {!isAdminPage && (
          <div className="hidden lg:flex items-center justify-center flex-1">
            <ul className="flex items-center gap-3 xl:gap-4 text-sm md:text-base">
              <li><NavLink to="/" className={navClass}>HOME</NavLink></li>
              <li><NavLink to="/shop" className={navClass}>SERVICES & SHOP</NavLink></li>
              <li><NavLink to="/about" className={navClass}>ABOUT US</NavLink></li>
              <li><NavLink to="/contact" className={navClass}>CONTACT US</NavLink></li>
            </ul>
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Favorites (heart) - hidden on admin pages */}
          {!isAdminPage && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFavorites((open) => !open)}
                aria-label="View favorites"
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-100 transition"
              >
                <Heart
                  size={18}
                  className={favorites.length ? "fill-red-500 text-red-500" : "text-slate-700"}
                />
                {favorites.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-sm">
                    {favorites.length}
                  </span>
                )}
              </button>

              {showFavorites && (
                <div className="absolute right-0 top-full mt-3 w-[360px] rounded-[22px] border border-stone-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.10)] p-4 z-[120]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[15px] font-bold text-slate-800">Favorites</h3>
                    <button
                      type="button"
                      onClick={() => setShowFavorites(false)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
                      aria-label="Cancel favorites panel"
                      title="Cancel"
                    >
                      <X size={18} strokeWidth={2.2} />
                    </button>
                  </div>

                  {favorites.length === 0 ? (
                    <p className="text-sm text-stone-500 py-2">No favorites yet. Tap the heart on a toy to save it.</p>
                  ) : (
                    <div className="space-y-3">
                      {favorites.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-stone-50 p-2">
                          <img src={item.img} alt={item.name} className="h-14 w-14 object-cover rounded-xl border border-stone-200" />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-base font-semibold text-slate-800">{item.name}</div>
                            <div className="text-xs text-stone-500">{item.tag || "Popular choice"}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-base font-bold text-slate-800">${Number(item.price || 0).toFixed(2)}</div>
                            <button
                              type="button"
                              onClick={() => removeFavorite(item.id)}
                              aria-label={`Remove ${item.name} from favorites`}
                              title="Cancel"
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
                            >
                              <X size={15} strokeWidth={2.2} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Desktop account controls */}
          {user ? (
            <div className="hidden lg:flex items-center gap-2">
              <Link
                to={user.role === "admin" ? "/admin" : "/account"}
                className="flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-2 hover:bg-slate-50 no-underline max-w-[240px]"
              >
                <span className="h-8 w-8 shrink-0 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  {(user.name || user.email || "U").charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 text-left leading-tight">
                  <span className="block text-sm font-semibold text-stone-800 truncate">
                    {user.name}
                  </span>
                  {!isAdminPage && (
                    <span className="block text-[11px] text-stone-400 truncate">
                      {user.email}
                    </span>
                  )}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                title="Log out"
                className="h-10 px-3 rounded-full bg-white border border-slate-200 text-stone-700 hover:bg-stone-100 flex items-center gap-1"
              >
                <LogOut size={17} />
                <span className="text-xs">Logout</span>
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className="hidden lg:inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-100"
              aria-label="Login"
            >
              <User className="h-5 w-5" />
            </NavLink>
          )}

          {/* Cart - hidden on admin pages */}
          {!isAdminPage && (
            <NavLink
              to="/cart"
              aria-label={cartCount > 0 ? `Cart with ${cartCount} items` : "Cart"}
              className={({ isActive }) =>
                `relative inline-flex items-center gap-2 rounded-full px-4 sm:px-5 py-2 font-medium shadow-sm no-underline ${
                  isActive
                    ? "bg-black text-white"
                    : "bg-white text-slate-900 hover:bg-slate-100"
                }`
              }
            >
              <span className="text-lg">🛒</span>
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-1 sm:-right-2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </NavLink>
          )}

          {/* Mobile/tablet hamburger button - hidden on admin pages (no links to show) */}
          {!isAdminPage && (
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              className="lg:hidden h-11 w-11 flex items-center justify-center rounded-xl bg-white border border-slate-300 text-slate-700 hover:border-orange-400 hover:text-orange-500 transition"
            >
              {menuOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile/tablet dropdown menu - never shown on admin pages */}
      {menuOpen && !isAdminPage && (
        <div
          id="mobile-navigation"
          className="lg:hidden border-t border-slate-200 bg-white shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <ul className="space-y-1">
              <li><NavLink to="/" className={mobileNavClass}>HOME</NavLink></li>
              <li><NavLink to="/shop" className={mobileNavClass}>SERVICES & SHOP</NavLink></li>
              <li><NavLink to="/about" className={mobileNavClass}>ABOUT US</NavLink></li>
              <li><NavLink to="/contact" className={mobileNavClass}>CONTACT US</NavLink></li>
            </ul>

            <div className="mt-4 pt-4 border-t border-slate-200">
              {user ? (
                <>
                  <Link
                    to={user.role === "admin" ? "/admin" : "/account"}
                    className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 no-underline"
                  >
                    <span className="h-11 w-11 shrink-0 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                      {(user.name || user.email || "U").charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0 leading-tight">
                      <span className="block font-semibold text-slate-800 truncate">
                        {user.name || "User"}
                      </span>
                      <span className="block text-sm text-slate-500 truncate">
                        {user.email}
                      </span>
                      <span className="block text-xs text-slate-400 mt-1 capitalize">
                        {user.role || "user"}
                      </span>
                    </span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-red-50 text-red-600 px-4 py-3 font-semibold hover:bg-red-100 transition"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 text-white px-4 py-3 font-semibold hover:bg-orange-600 transition no-underline"
                >
                  <User size={18} />
                  Login / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
