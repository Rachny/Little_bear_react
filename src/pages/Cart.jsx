import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Trash2, Gift, ShoppingBag, UserRound } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { clearCart as clearStoredCart, getCart, saveCart } from "../lib/cartStore";
import { createOrder } from "../lib/orderStore";

export default function Cart() {
  const { user, loading, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cart, setCart] = useState(() => getCart());
  const [sendAsGift, setSendAsGift] = useState(false);
  const [giftNote, setGiftNote] = useState("");
  const [message, setMessage] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    const refresh = () => setCart(getCart());
    window.addEventListener("littlebear-cart-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("littlebear-cart-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.qty, 0), [cart]);
  const shippingFee = subtotal >= 50 || subtotal === 0 ? 0 : 5;
  const finalTotal = subtotal + shippingFee;

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-stone-500">Loading account...</div>;
  }

  if (!isLoggedIn) {
    return (
      <main className="min-h-[65vh] bg-[#fcfbfa] flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 shadow-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 flex items-center justify-center mb-5">
            <UserRound className="text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Log in to checkout</h1>
          <p className="text-stone-500 mt-2 mb-6">
            Please create a LittleBear account or log in before buying your products.
          </p>
          <button onClick={() => navigate("/login", {
            state: { from: location.pathname, message: "Please log in to continue to checkout." }
          })} className="w-full rounded-xl bg-stone-900 text-white py-3 font-bold hover:bg-orange-500">
            Log in to continue
          </button>
          <button onClick={() => navigate("/register", { state: { from: location.pathname } })}
            className="w-full mt-3 rounded-xl border border-stone-200 py-3 font-bold text-stone-700 hover:bg-stone-50">
            Create an account
          </button>
        </div>
      </main>
    );
  }

  function changeQty(id, delta) {
    const next = cart.map((item) => item.id === id
      ? { ...item, qty: Math.max(0, item.qty + delta) } : item
    ).filter((item) => item.qty > 0);
    setCart(next);
    saveCart(next);
  }

  function removeItem(id) {
    const next = cart.filter((item) => item.id !== id);
    setCart(next);
    saveCart(next);
  }

  function emptyCart() {
    clearStoredCart();
    setCart([]);
    setSendAsGift(false);
    setGiftNote("");
  }

  async function executeCheckout() {
    if (!cart.length || checkoutLoading) return;

    setCheckoutLoading(true);
    setCheckoutError("");
    setMessage("");

    try {
      const order = await createOrder({
        user,
        items: cart,
        subtotal,
        shippingFee,
        total: finalTotal,
        sendAsGift,
        giftNote,
      });

      setMessage(`Order #${order.id.slice(-6).toUpperCase()} placed successfully! Total: $${finalTotal.toFixed(2)}.`);
      emptyCart();
    } catch (error) {
      console.error("Checkout failed:", error);
      setCheckoutError(error?.message || "Unable to place your order. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <div style={{ backgroundColor: "#fcfbfa", color: "#3c322c" }} className="min-h-screen font-sans">
      <header className="text-center py-10 px-6">
        <p className="text-sm font-bold text-orange-500 uppercase tracking-wide">Welcome, {user.name}</p>
        <h1 className="text-3xl md:text-4xl font-bold mb-1">Your shopping cart</h1>
        <p className="text-sm text-stone-400">Review your chosen companions before checkout.</p>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-16">
        {message && <div className="mb-6 rounded-xl bg-green-50 border border-green-200 text-green-700 px-4 py-3">{message}</div>}
        {checkoutError && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3">
            <p className="font-semibold">Checkout could not be completed.</p>
            <p className="mt-1">{checkoutError}</p>
            <p className="mt-2 text-sm">Your cart has not been deleted, so you can fix the Firebase setup and try again.</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h2 className="text-lg font-bold">Selected companions</h2>
              <span className="text-sm text-stone-400">{cart.length} product(s) · {totalItems} piece(s)</span>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🧸</div>
                <h3 className="text-lg font-bold mb-2">Your basket is empty</h3>
                <p className="text-sm text-stone-400 mb-6">Explore our workshop and find your perfect companion.</p>
                <button onClick={() => navigate("/shop")} className="bg-stone-900 text-white rounded-full px-6 py-2.5 text-sm font-bold">
                  Browse workshop
                </button>
              </div>
            ) : cart.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4 mb-4 last:border-0">
                <div className="flex items-center gap-4">
                  <img src={item.img} alt={item.name} className="w-[90px] h-[90px] rounded-2xl object-cover" />
                  <div>
                    <h3 className="font-semibold text-stone-800">{item.name}</h3>
                    <p className="text-sm text-stone-400">${item.price.toFixed(2)} each</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="flex items-center gap-1 border border-stone-200 rounded-full p-1">
                    <button onClick={() => changeQty(item.id, -1)} className="w-7 h-7 rounded-full hover:bg-orange-500 hover:text-white">−</button>
                    <span className="min-w-[30px] text-center font-semibold">{item.qty}</span>
                    <button onClick={() => changeQty(item.id, 1)} className="w-7 h-7 rounded-full hover:bg-orange-500 hover:text-white">+</button>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <span className="font-bold block">${(item.price * item.qty).toFixed(2)}</span>
                    <button onClick={() => removeItem(item.id)} className="text-red-500 text-xs font-medium hover:underline flex items-center gap-1 ml-auto">
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-bold border-b pb-3 mb-3">Order summary</h2>
            <div className="flex justify-between text-sm text-stone-500 mb-2"><span>Subtotal</span><span className="font-medium text-stone-800">${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm text-stone-500 mb-3 border-b pb-3"><span>Shipping</span><span className="font-medium text-stone-800">{subtotal === 0 ? "—" : shippingFee === 0 ? "FREE" : "$5.00"}</span></div>
            {shippingFee > 0 && <div className="bg-stone-50 rounded-xl text-center text-stone-500 text-xs p-2 mb-3">Spend <strong>${(50 - subtotal).toFixed(2)}</strong> more for free shipping.</div>}
            <div className="flex justify-between font-bold text-xl mb-4"><span>Total</span><span>${finalTotal.toFixed(2)}</span></div>

            <label className="flex items-center gap-2 text-sm font-medium text-stone-600 cursor-pointer mb-3">
              <input type="checkbox" checked={sendAsGift} onChange={(e) => setSendAsGift(e.target.checked)} />
              <Gift size={14} /> Send as a special gift order
            </label>
            {sendAsGift && <textarea value={giftNote} onChange={(e) => setGiftNote(e.target.value)} rows={2} placeholder="Gift note..." className="w-full mb-3 rounded-lg border border-orange-200 p-2 text-sm resize-none" />}

            <button onClick={executeCheckout} disabled={!cart.length || checkoutLoading} className="w-full py-3 rounded-xl font-semibold text-white mb-2 disabled:opacity-40 bg-orange-500 hover:bg-orange-600">
              {checkoutLoading ? "Placing order..." : "Proceed to secure checkout"}
            </button>
            <button onClick={emptyCart} disabled={!cart.length} className="w-full py-2 text-sm text-stone-400 hover:underline disabled:opacity-40">Empty entire bag</button>
          </div>
        </div>
      </main>
    </div>
  );
}
