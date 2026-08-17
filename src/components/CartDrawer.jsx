import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, Trash2, X, ShoppingBag, ArrowRight } from "lucide-react";
import { getCart, saveCart, clearCart } from "../lib/cartStore";
import { useNavigate } from "react-router-dom";

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState(() => getCart());
  const navigate = useNavigate();

  useEffect(() => {
    const refresh = () => setCart(getCart());
    const openDrawer = () => { refresh(); setOpen(true); };
    window.addEventListener("littlebear-cart-updated", refresh);
    window.addEventListener("littlebear-open-cart", openDrawer);
    return () => {
      window.removeEventListener("littlebear-cart-updated", refresh);
      window.removeEventListener("littlebear-open-cart", openDrawer);
    };
  }, []);

  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0), [cart]);
  const shipping = subtotal === 0 ? 0 : subtotal >= 50 ? 0 : 5;
  const total = subtotal + shipping;

  function updateQty(id, delta) {
    const next = cart.map(item => item.id === id ? { ...item, qty: item.qty + delta } : item)
      .filter(item => item.qty > 0);
    saveCart(next);
    setCart(next);
  }

  function remove(id) {
    const next = cart.filter(item => item.id !== id);
    saveCart(next);
    setCart(next);
  }

  function checkout() {
    setOpen(false);
    navigate("/cart");
  }

  return (
    <>
      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 bg-black/30 z-[70]" />}
      <aside className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[80] shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b">
            <div>
              <h2 className="text-xl font-bold text-stone-900">Your cart</h2>
              <p className="text-sm text-stone-400">{totalItems} item{totalItems === 1 ? "" : "s"}</p>
            </div>
            <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-stone-100"><X /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <ShoppingBag size={48} className="text-stone-300 mb-4" />
                <h3 className="font-bold text-stone-800">Your cart is empty</h3>
                <p className="text-sm text-stone-400 mt-1">Add a cute companion to get started.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-3 border-b border-stone-100 pb-5">
                    <img src={item.img} alt={item.name} className="w-20 h-20 rounded-xl object-cover bg-stone-50" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <h3 className="font-semibold text-sm text-stone-800 truncate">{item.name}</h3>
                        <button onClick={() => remove(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
                      </div>
                      <p className="text-sm text-orange-500 font-bold mt-1">${Number(item.price).toFixed(2)}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 border rounded-full px-1 py-1">
                          <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded-full hover:bg-orange-100 flex items-center justify-center"><Minus size={12}/></button>
                          <span className="w-5 text-center text-sm font-semibold">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded-full hover:bg-orange-100 flex items-center justify-center"><Plus size={12}/></button>
                        </div>
                        <span className="font-bold text-sm">${(Number(item.price) * item.qty).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t bg-stone-50 p-6">
            {shipping > 0 && <p className="text-xs text-stone-500 mb-3 text-center">Spend ${(50 - subtotal).toFixed(2)} more for free shipping.</p>}
            <div className="flex justify-between text-sm text-stone-500"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm text-stone-500 mt-2"><span>Shipping</span><span>{shipping === 0 ? "FREE" : "$5.00"}</span></div>
            <div className="flex justify-between text-lg font-bold text-stone-900 mt-3 pt-3 border-t"><span>Total</span><span>${total.toFixed(2)}</span></div>
            <button onClick={checkout} disabled={!cart.length} className="mt-4 w-full rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-stone-300 text-white py-3 font-bold flex items-center justify-center gap-2">
              View cart & checkout <ArrowRight size={17}/>
            </button>
            <button onClick={() => setOpen(false)} className="mt-2 w-full rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-600 py-3 font-semibold">
              Cancel
            </button>
            {cart.length > 0 && <button onClick={() => { clearCart(); setCart([]); }} className="w-full mt-2 py-2 text-sm text-stone-400 hover:text-red-500">Clear cart</button>}
          </div>
        </div>
      </aside>
    </>
  );
}
