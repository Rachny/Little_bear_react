import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

export const PRODUCTS_COLLECTION = "products";

export const INITIAL_PRODUCTS = [
  { id: "p1", category: "bears", tag: "Classic collection", name: "Classic Teddy Bear", desc: "Our signature organic heirloom companion bear.", price: 15.99, stock: 10, img: "https://down-my.img.susercontent.com/file/my-11134207-7qul2-lj7uosub5s2rfa" },
  { id: "p2", category: "bears", tag: "Giant love series", name: "Giant Teddy Bear Plush Soft Toy", desc: "Cute teddy bear, loveable and huggable.", price: 29.99, stock: 8, img: "https://img.alicdn.com/bao/uploaded/i4/2700635316/O1CN01O8j8f11p8mXAJUWxg_!!2700635316.jpg" },
  { id: "p3", category: "bears", tag: "New arrival", name: "Panda Polar Bear Plush Doll", desc: "Loveable and huggable.", price: 18, stock: 12, img: "https://img.alicdn.com/imgextra/i4/2240527233/O1CN01KoaJSF23IleOzoiFE_!!2240527233.jpg" },
  { id: "p4", category: "bears", tag: "Cozy friends", name: "Honey Velvet Bear", desc: "Golden extra-soft plant-dyed velour coat.", price: 9.99, stock: 15, img: "https://img.alicdn.com/bao/uploaded/i3/2005884984/O1CN01Nz8OEe1mgiumwWgCe_!!2005884984.jpg" },
  { id: "p5", category: "bears", tag: "Sweet meadow", name: "Flora Meadow Teddy Bear", desc: "Plush coat, cuddly form, and cozy knitted heart-motif sweater.", price: 7.99, stock: 20, img: "https://img.alicdn.com/bao/uploaded/i1/2211671149264/O1CN01CosOUp2IIyC396Jlg_!!2211671149264.jpg" },
  { id: "p6", category: "bears", tag: "Woodland fleece", name: "Brown Color Fur Teddy Bear", desc: "Cute teddy bear, loveable and huggable.", price: 6.99, stock: 18, img: "https://img.alicdn.com/bao/uploaded/i2/4044516069/O1CN015BDqKu1uheojjuAOr_!!4044516069.jpg" },
  { id: "p7", category: "bunnies", tag: "Latest style", name: "Lattice Plush Stuffed Animal Toy", desc: "Long floppy ears lined with pure organic flax linen.", price: 4.99, stock: 25, img: "https://img.nihaojewelry.com/fit-in/800x800/product/2026/6/2/2061873435147112448/Lattice-Plush-Stuffed-Animal-Toy-Keychain-In-Cute-Style-Available-In-Green-Color.jpg" },
  { id: "p8", category: "bunnies", tag: "Best seller", name: "Strawberry Bunny Plush", desc: "Our signature organic heirloom companion bear.", price: 10.99, stock: 14, img: "https://floralsupplies.com/cdn/shop/files/5500d77357a4434b176fe4e7f4cecc7a.jpg?v=1706352521" },
  { id: "p9", category: "bunnies", tag: "Fan favourite", name: "Flora Meadow Bunny", desc: "Long floppy ears lined with pure organic flax linen.", price: 12.99, stock: 11, img: "https://i.ebayimg.com/images/g/Ql8AAeSwR2dpjlmG/s-l1600.webp" },
  { id: "p10", category: "bunnies", tag: "Dreamy plush", name: "Honey Velvet Bunny", desc: "Plush, soft and cuddly beige bunny.", price: 9.99, stock: 15, img: "https://img.alicdn.com/bao/uploaded/i4/O1CN01hJSUwQ1WkMKURMaz2_!!4611686018427383722-0-item_pic.jpg" },
  { id: "p11", category: "cats", tag: "Limited edition", name: "White Fluffy Plush Cat", desc: "Soft white fur, elegant pink ruffle, and shiny eyes.", price: 15.99, stock: 10, img: "https://img.alicdn.com/bao/uploaded/i2/2642895360/O1CN01hVFVcb1pSw1m4RDlR_!!2642895360.jpg" },
  { id: "p12", category: "cats", tag: "Popular choice", name: "Cuddly Cream Cat", desc: "Cute cream and ginger plush for endless cuddles.", price: 8.5, stock: 16, img: "https://img.alicdn.com/bao/uploaded/i2/2219158965612/O1CN01EYMlkz1rKLoG2Jb6D_!!2219158965612.jpg" },
  { id: "p13", category: "cats", tag: "Premium blend", name: "Lucifer Cat Plush Toys", desc: "Soft black-and-white cat plush with a charming frown.", price: 14.99, stock: 9, img: "https://i.pinimg.com/736x/8d/7c/ba/8d7cbaffefdc3ba907e764aafcd836c5.jpg" },
  { id: "p14", category: "sets", tag: "Newborn gift", name: "Welcome Little One Set", desc: "Includes a pocket cub, rattle ring, and blanket.", price: 25, stock: 7, img: "https://img.alicdn.com/bao/uploaded/O1CN01u2CYih1hnz3UknFL7_!!2206770214323.jpg" },
  { id: "p15", category: "sets", tag: "Premium gift box", name: "Premium Welcome Gift Box Set", desc: "Includes a premium pocket cub, deluxe rattle ring, and extra soft blanket.", price: 28, stock: 6, img: "https://img.alicdn.com/bao/uploaded/O1CN011FpUAQ1hnyvwfs6vi_!!2206770214323.jpg" },
];

function normalizeProduct(id, data) {
  return {
    id,
    name: data.name || "Unnamed product",
    category: data.category || "bears",
    tag: data.tag || "New arrival",
    desc: data.desc || "",
    price: Number(data.price || 0),
    stock: Number(data.stock || 0),
    img: data.img || "https://placehold.co/800x800?text=LittleBear",
  };
}

export function subscribeToProducts(onChange, onError) {
  const productsQuery = query(collection(db, PRODUCTS_COLLECTION), orderBy("name", "asc"));
  return onSnapshot(
    productsQuery,
    (snapshot) => onChange(snapshot.docs.map((d) => normalizeProduct(d.id, d.data()))),
    (error) => onError?.(error)
  );
}

export async function getProductsFromFirebase() {
  const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
  return snapshot.docs.map((d) => normalizeProduct(d.id, d.data()));
}

export async function createProduct(product) {
  const id = product.id || `p-${Date.now()}`;
  await setDoc(doc(db, PRODUCTS_COLLECTION, id), {
    name: product.name.trim(),
    category: product.category,
    tag: product.tag?.trim() || "New arrival",
    desc: product.desc?.trim() || "",
    price: Number(product.price),
    stock: Number(product.stock),
    img: product.img?.trim() || "https://placehold.co/800x800?text=LittleBear",
  });
  return id;
}

export async function updateProduct(id, product) {
  return createProduct({ ...product, id });
}

export async function removeProduct(id) {
  await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
}

export async function seedProducts() {
  await Promise.all(INITIAL_PRODUCTS.map((product) => createProduct(product)));
  return INITIAL_PRODUCTS;
}

// Kept only as a safe UI fallback while the admin initializes Firestore.
export function getFallbackProducts() {
  return INITIAL_PRODUCTS;
}
