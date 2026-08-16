import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Leaf, Heart, ArrowRight, Sparkles, ShieldCheck, Truck, Star } from "lucide-react";
import { subscribeToProducts, getFallbackProducts } from "../lib/productStore";
import { addToCart as addProductToCart, getCart } from "../lib/cartStore";
import { toggleFavorite, isFavorite } from "../lib/favoritesStore";

const FEATURES = [
  {
    icon: "🌿",
    title: "Organic materials",
    body: "Every toy is filled with hypoallergenic certified organic cotton, gentle on sensitive skin from day one.",
  },
  {
    icon: "🧵",
    title: "Stitched to last",
    body: "Reinforced seams and non-toxic dyes mean your child's best friend survives every adventure and wash cycle.",
  },
  {
    icon: "🤝",
    title: "Ethical crafting",
    body: "We believe in happy makers. All companions are crafted in small certified batches under fair conditions.",
  },
];

const MARQUEE_ITEMS = [
  "🌿 Organic cotton",
  "🛡️ Child safe",
  "🧼 Machine washable",
  "🎁 Gift wrapping",
  "🚚 Free shipping over $50",
  "🧵 Handcrafted",
];

const FEATURED_IDS = ["p1", "p8", "p13"];

function getFeaturedProducts(products) {
  return FEATURED_IDS.map((id) => products.find((product) => product.id === id)).filter(Boolean);
}

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
        <p className="text-sm text-stone-400 mb-4">{product.desc}</p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg text-stone-900">
            ${product.price.toFixed(2)}
          </span>
          <button
            onClick={() => onAddToCart(product)}
            className="flex items-center gap-2 bg-stone-900 text-white rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-orange-500"
          >
            <ShoppingCart size={14} /> Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState(() => getFeaturedProducts(getFallbackProducts()));
  const [cartCount, setCartCount] = useState(() =>
    getCart().reduce((sum, item) => sum + item.qty, 0)
  );
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToProducts(
      (products) => setFeaturedProducts(getFeaturedProducts(products)),
      (error) => console.error("Home products Firebase error:", error)
    );
    const refreshCart = () => setCartCount(getCart().reduce((sum, item) => sum + item.qty, 0));
    window.addEventListener("littlebear-cart-updated", refreshCart);
    window.addEventListener("storage", refreshCart);
    return () => {
      unsubscribe?.();
      window.removeEventListener("littlebear-cart-updated", refreshCart);
      window.removeEventListener("storage", refreshCart);
    };
  }, []);

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
    <div
      style={{ backgroundColor: "#fcfbfa", color: "#3c322c" }}
      className="min-h-screen font-sans"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .lb-heading { font-family: 'Fredoka', sans-serif; }
        .lb-body { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes lb-marquee {
          0% { transform: translate3d(0,0,0); }
          100% { transform: translate3d(-50%,0,0); }
        }
        .lb-marquee-track { animation: lb-marquee 25s linear infinite; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-stone-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* Hero */}
      <header
        className="relative overflow-hidden px-6 py-10 md:py-14 lb-body"
        style={{
          backgroundColor: "#fcfbfa",
        }}
      >

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.02fr_.98fr]">
          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-orange-700 shadow-sm backdrop-blur">
              <Sparkles size={14} />
              Handcrafted with love
            </div>

            <h1 className="lb-heading text-5xl font-semibold leading-[1.02] tracking-tight text-stone-900 md:text-6xl lg:text-7xl">
              Little friends.
              <br />
              <span style={{ color: "#f47b20" }}>Big memories.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-8 text-stone-500 md:text-lg">
              Discover soft, lovable companions made for cuddles, adventures,
              and special moments that stay with you.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="group inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3.5 font-semibold text-white shadow-lg shadow-stone-900/10 transition hover:-translate-y-0.5 hover:bg-orange-500"
              >
                Explore collection
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-6 py-3.5 font-semibold text-stone-800 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:text-orange-600"
              >
                Our story
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-stone-500">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={17} className="text-orange-500" /> Child-safe
              </span>
              <span className="inline-flex items-center gap-2">
                <Leaf size={17} className="text-green-600" /> Organic cotton
              </span>
              <span className="inline-flex items-center gap-2">
                <Truck size={17} className="text-orange-500" /> Free shipping $50+
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[560px]">
            <div className="absolute inset-5 rounded-[3rem] bg-orange-200/50 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2.5rem] border-[10px] border-white bg-[#f3e7d1] shadow-[0_20px_55px_-28px_rgba(93,64,40,.25)]">
              <img
                src="https://img.alicdn.com/bao/uploaded/i3/4013853594/O1CN01RxvzAC1cQ65zn942M_!!4013853594.jpg"
                alt="Cute LittleBear teddy bear"
                className="h-[390px] w-full object-cover md:h-[500px]"
              />

              <div className="absolute right-5 top-5 rounded-full bg-white/90 px-4 py-2.5 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-stone-700">
                  <span className="text-orange-500">★ ★ ★ ★ ★</span>
                  <span> Loved by families</span>
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 px-5 pb-4 pt-5 text-left bg-gradient-to-t from-black/35 via-black/10 to-transparent">
                <p
                  className="max-w-[80%] text-[0.72rem] font-black uppercase tracking-[0.12em] text-[#f5e3d0] md:text-[0.9rem]"
                  style={{ fontFamily: "'Fredoka', 'Arial Rounded MT Bold', sans-serif" }}
                >
                  LITTLEBEAR COLLECTION
                </p>
                <p
                  className="mt-1 max-w-[100%] text-[1.2rem] font-semibold leading-[0.82] tracking-[-0.075em] text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.28)] md:text-[2.2rem]"
                  style={{ fontFamily: "'Fredoka', 'Arial Rounded MT Bold', sans-serif" }}
                >
                  Made for every cuddle.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-stone-200 bg-white/90 p-4 shadow-sm">
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-stone-500">
                Our promise
              </p>
              <p className="mt-2 text-lg font-semibold text-stone-800 md:text-xl">
                Soft. Safe. Made to last.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Marquee */}
      <div
        className="overflow-hidden whitespace-nowrap border-y border-orange-100/80 py-3.5"
        style={{ backgroundColor: "#fff8ef" }}
      >
        <div className="inline-block lb-marquee-track text-sm font-semibold text-stone-500">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="mx-4">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="lb-body bg-white px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
                Why LittleBear
              </p>
              <h2 className="lb-heading text-3xl font-semibold text-stone-900 md:text-4xl">
                Tiny details. Lots of love.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-stone-400">
              Thoughtful materials, careful stitching, and gift-ready details
              make every companion extra special.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: "🌿", title: "Organic materials", body: "Soft, gentle materials chosen for everyday cuddles." },
              { icon: "🧵", title: "Stitched to last", body: "Strong seams made for playtime, naps, and adventures." },
              { icon: "🤝", title: "Made with care", body: "Small-batch crafting with quality at every step." },
            ].map((f, index) => (
              <div
                key={f.title}
                className="group rounded-[1.75rem] border border-stone-100 bg-[#fffdfa] p-6 transition duration-300 hover:-translate-y-1 hover:border-orange-100 hover:shadow-[0_20px_45px_-25px_rgba(244,123,32,.5)]"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-2xl transition group-hover:scale-105">
                    {f.icon}
                  </div>
                  <span className="text-xs font-bold text-stone-300">0{index + 1}</span>
                </div>
                <h3 className="text-lg font-bold text-stone-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-400">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collection */}
      <main className="lb-body bg-[#fffaf5] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
                Shop favorites
              </p>
              <h2 className="lb-heading text-3xl font-semibold text-stone-900 md:text-4xl">
                Meet the collection
              </h2>
            </div>
            <Link
              to="/shop"
              className="group hidden items-center gap-2 text-sm font-bold text-orange-500 sm:inline-flex"
            >
              See all toys
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
          <Link
            to="/shop"
            className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-orange-500 sm:hidden"
          >
            See all toys <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    </div>
  );
}
