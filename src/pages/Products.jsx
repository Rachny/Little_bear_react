import { useState, useMemo, useEffect } from "react";
import { ShoppingCart, Heart } from "lucide-react";
import { subscribeToProducts, getFallbackProducts } from "../lib/productStore";
import { addToCart as addProductToCart, getCart } from "../lib/cartStore";
import { toggleFavorite, isFavorite } from "../lib/favoritesStore";

const FILTERS = [
  { key: "all", label: "All companions" },
  { key: "bears", label: "Bears" },
  { key: "bunnies", label: "Bunnies" },
  { key: "cats", label: "Cats" },
  { key: "sets", label: "Gift sets" },
];



function ProductCard({ product, onAddToCart }) {
  const [liked, setLiked] = useState(() => isFavorite(product));

  useEffect(() => {
    const syncLiked = () => setLiked(isFavorite(product));
    window.addEventListener("littlebear-favorites-updated", syncLiked);
    window.addEventListener("storage", syncLiked);

    return () => {
      window.removeEventListener("littlebear-favorites-updated", syncLiked);
      window.removeEventListener("storage", syncLiked);
    };
  }, [product.id]);

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-md">
      <div className="relative overflow-hidden">
        <span className="absolute top-4 left-4 bg-white/90 text-stone-800 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm z-10">
          {product.tag}
        </span>
        <button
          type="button"
          aria-label={liked ? `Unlike ${product.name}` : `Like ${product.name}`}
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(product);
            setLiked(isFavorite(product));
          }}
          className={`absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition ${
            liked
              ? "bg-red-500 border-red-500 text-white"
              : "bg-white/90 border-white/80 text-stone-600 hover:text-red-500"
          }`}
        >
          <Heart size={18} fill={liked ? "currentColor" : "none"} />
        </button>
        <img
          src={product.img}
          alt={product.name}
          className="w-full h-64 object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
      <div className="p-5">
        <h3 className="font-bold text-stone-900 mb-1">{product.name}</h3>
        <p className="text-sm text-stone-400 mb-2">{product.desc}</p>
        <p className={`text-xs font-semibold mb-4 ${Number(product.stock || 0) <= 5 ? "text-red-500" : "text-green-600"}`}>
          {Number(product.stock || 0) > 0 ? `${product.stock} in stock` : "Out of stock"}
        </p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg text-stone-900">${product.price.toFixed(2)}</span>
          <button
            onClick={() => onAddToCart(product)}
            disabled={Number(product.stock || 0) <= 0}
            className="flex items-center gap-2 bg-stone-900 text-white rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-orange-500 disabled:bg-stone-300 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={14} /> Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Shop() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [cartCount, setCartCount] = useState(() => getCart().reduce((sum, item) => sum + item.qty, 0));
  const [toast, setToast] = useState(null);
  const [products, setProducts] = useState(() => getFallbackProducts());
  const [firebaseError, setFirebaseError] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToProducts(
      (items) => {
        setProducts(items);
        setFirebaseError("");
      },
      (error) => {
        console.error("Products Firebase error:", error);
        setFirebaseError("Products are showing starter data because Firestore has not been initialized yet.");
      }
    );
    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    const refreshCart = () => setCartCount(getCart().reduce((sum, item) => sum + item.qty, 0));
    window.addEventListener("littlebear-cart-updated", refreshCart);
    window.addEventListener("storage", refreshCart);
    return () => {
      window.removeEventListener("littlebear-cart-updated", refreshCart);
      window.removeEventListener("storage", refreshCart);
    };
  }, []);

  const visibleProducts = useMemo(
    () => (activeFilter === "all" ? products : products.filter((p) => p.category === activeFilter)),
    [activeFilter]
  );

  function addToCart(product) {
    if (Number(product.stock || 0) <= 0) {
      setToast(`${product.name} is out of stock.`);
      setTimeout(() => setToast(null), 2200);
      return;
    }
    const nextCart = addProductToCart(product);
    setCartCount(nextCart.reduce((sum, item) => sum + item.qty, 0));
    setToast(`${product.name} has been added to your cart!`);
    window.dispatchEvent(new Event("littlebear-open-cart"));
    setTimeout(() => setToast(null), 2200);
  }

  return (
    <div style={{ backgroundColor: "#fcfbfa", color: "#3c322c" }} className="min-h-screen font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .lb-heading { font-family: 'Fredoka', sans-serif; }
        .lb-body { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-stone-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}



      {/* Header */}
      <header className="text-center max-w-3xl mx-auto px-6 py-14 lb-body">
        <p className="uppercase tracking-wide text-sm font-bold mb-2" style={{ color: "#fd7e14" }}>
          Our workshop
        </p>
        <h1 className="lb-heading text-4xl font-semibold mb-3 text-stone-900">All our companions</h1>
        <p className="text-stone-400">Adopt a sustainably made, certified organic lifelong friend today.</p>
      </header>

      {/* Filters */}
      <div className="flex justify-center px-6 mb-10">
        <div className="inline-flex flex-wrap gap-2 justify-center p-2 bg-white rounded-full shadow-sm border border-stone-100">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className="rounded-full px-5 py-2 text-sm font-medium transition-colors"
              style={
                activeFilter === f.key
                  ? { backgroundColor: "#3c322c", color: "#fff" }
                  : { backgroundColor: "#fff", color: "#6b5d52", border: "1px solid #e4ded7" }
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {firebaseError && (
        <div className="max-w-6xl mx-auto px-6 mb-5">
          <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 text-sm">{firebaseError}</div>
        </div>
      )}

      {/* Products */}
      <main className="max-w-6xl mx-auto px-6 pb-20 lb-body">
        {visibleProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🧸</div>
            <h3 className="text-lg font-bold text-stone-900 mb-1">No companions found</h3>
            <p className="text-sm text-stone-400">We are busy restitching this batch right now.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </main>

    </div>
  );
}