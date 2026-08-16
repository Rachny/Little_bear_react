import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { toggleFavorite, isFavorite } from "../lib/favoritesStore";

export default function ProductCard({ product, onAdd }) {
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

  const image = product.img || product.image;

  const handleFavorite = (e) => {
    e.preventDefault();
    toggleFavorite(product);
    setLiked(isFavorite(product));
  };

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-pink-100 bg-white shadow-[0_20px_50px_-28px_rgba(244,114,182,0.45)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_-24px_rgba(244,114,182,0.55)]">
      <div className="relative h-60 w-full bg-pink-50">
        <img src={image} alt={product.name} className="h-full w-full object-cover" />

        {product.badge && (
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-pink-600">
            {product.badge}
          </span>
        )}

        <button
          type="button"
          onClick={handleFavorite}
          aria-label={liked ? `Unlike ${product.name}` : `Like ${product.name}`}
          className={`absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition ${
            liked
              ? "border-red-500 bg-red-500 text-white"
              : "border-white/80 bg-white/90 text-slate-600 hover:text-red-500"
          }`}
        >
          <Heart size={19} fill={liked ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="p-5 text-left">
        <h3 className="text-xl font-semibold text-slate-900">{product.name}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Soft plush comfort made for cozy playtime and treasured keepsakes.
        </p>

        <div className="mt-5 flex items-center justify-between">
          <div>
            <p className="font-bold text-pink-500">${product.price}</p>
            <p className="text-sm text-slate-500">Free shipping over $50</p>
          </div>
          <button
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-600"
            onClick={() => onAdd && onAdd(product)}
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
