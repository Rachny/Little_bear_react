const FAVORITES_KEY = "littlebear_favorites";

export function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  window.dispatchEvent(new Event("littlebear-favorites-updated"));
}

function sameProduct(item, product) {
  if (!item || !product) return false;

  // Firebase products can have a Firestore document ID while fallback
  // products use p1, p2, etc. Match by ID first, then by product name.
  return (
    (item.id && product.id && item.id === product.id) ||
    (item.name && product.name && item.name === product.name)
  );
}

export function isFavorite(product) {
  return getFavorites().some((item) => sameProduct(item, product));
}

export function toggleFavorite(product) {
  const favorites = getFavorites();
  const exists = favorites.some((item) => sameProduct(item, product));

  const nextFavorites = exists
    ? favorites.filter((item) => !sameProduct(item, product))
    : [
        ...favorites,
        {
          id: product.id || `favorite-${Date.now()}`,
          name: product.name,
          img: product.img || product.image,
          price: Number(product.price || 0),
          tag: product.tag || product.badge || "Favorite",
        },
      ];

  saveFavorites(nextFavorites);
  return nextFavorites;
}

export function removeFavorite(productId) {
  const nextFavorites = getFavorites().filter((item) => item.id !== productId);
  saveFavorites(nextFavorites);
  return nextFavorites;
}
