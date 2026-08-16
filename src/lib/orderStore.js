import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  doc,
  runTransaction,
} from "firebase/firestore";
import { db } from "./firebase";

const ORDERS_COLLECTION = "orders";
const PRODUCTS_COLLECTION = "products";

function firebaseErrorMessage(error) {
  const code = error?.code || "";
  if (code === "permission-denied") return "Firebase denied this request. Deploy the included firestore.rules to the same Firebase project and make sure the customer is logged in.";
  if (code === "failed-precondition") return "Firestore is not enabled. Firebase Console → Firestore Database → Create database.";
  if (code === "unavailable") return "Firebase is unavailable. Check your internet connection.";
  if (code === "unauthenticated") return "Your Firebase login session expired. Please log in again.";
  if (code === "not-found") return "The Firebase project or Firestore database could not be found. Check VITE_FIREBASE_PROJECT_ID.";
  return error?.message || "Firebase request failed.";
}

export async function createOrder({ user, items, subtotal, shippingFee, total, sendAsGift, giftNote }) {
  if (!user?.uid) throw new Error("You must be logged in before checkout.");
  if (!items?.length) throw new Error("Your cart is empty.");

  const order = {
    customerId: user.uid,
    customerName: user.name || "Customer",
    customerEmail: user.email || "",
    items: items.map((item) => ({
      productId: item.id,
      name: item.name,
      price: Number(item.price),
      qty: Number(item.qty),
      img: item.img || "",
    })),
    subtotal: Number(subtotal.toFixed(2)),
    shippingFee: Number(shippingFee.toFixed(2)),
    total: Number(total.toFixed(2)),
    sendAsGift: Boolean(sendAsGift),
    giftNote: giftNote?.trim() || "",
    status: "Pending",
    createdAt: serverTimestamp(),
  };

  try {
    const orderRef = doc(collection(db, ORDERS_COLLECTION));

    await runTransaction(db, async (transaction) => {
      // Read current stock for every product in the cart first
      // (Firestore transactions require all reads before any writes).
      const productRefs = order.items.map((item) =>
        doc(db, PRODUCTS_COLLECTION, item.productId)
      );

      const productSnaps = await Promise.all(
        productRefs.map((ref) => transaction.get(ref))
      );

      // Validate stock is sufficient before committing anything.
      productSnaps.forEach((snap, index) => {
        const item = order.items[index];
        if (!snap.exists()) return; // product may have been removed; skip stock check
        const currentStock = Number(snap.data().stock || 0);
        if (currentStock < item.qty) {
          throw new Error(
            `Not enough stock for "${item.name}" (only ${currentStock} left).`
          );
        }
      });

      // Decrement stock for each product.
      productSnaps.forEach((snap, index) => {
        if (!snap.exists()) return;
        const item = order.items[index];
        const currentStock = Number(snap.data().stock || 0);
        transaction.update(productRefs[index], {
          stock: Math.max(0, currentStock - item.qty),
        });
      });

      // Create the order document.
      transaction.set(orderRef, order);
    });

    return { id: orderRef.id, ...order };
  } catch (error) {
    console.error("createOrder:", error);
    throw new Error(firebaseErrorMessage(error) || error.message);
  }
}

export function subscribeToOrders(onChange, onError) {
  const q = query(collection(db, ORDERS_COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    onChange(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, (error) => onError?.(new Error(firebaseErrorMessage(error))));
}

export async function updateOrderStatus(id, status) {
  try {
    await updateDoc(doc(db, ORDERS_COLLECTION, id), { status });
  } catch (error) {
    throw new Error(firebaseErrorMessage(error));
  }
}
