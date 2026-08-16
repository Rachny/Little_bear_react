import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Navigate } from "react-router-dom";

import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Boxes,
  AlertTriangle,
  ShoppingBag,
  Mail,
  Check,
  Trash,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../lib/firebase";

import { useAuth } from "../context/useAuth";

import {
  subscribeToProducts,
  createProduct,
  updateProduct,
  removeProduct,
  seedProducts,
} from "../lib/productStore";

import {
  subscribeToOrders,
  updateOrderStatus,
} from "../lib/orderStore";


const emptyForm = {
  name: "",
  category: "bears",
  tag: "New arrival",
  desc: "",
  price: "",
  stock: "",
  img: "",
};


export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();

  const [products, setProducts] = useState([]);
  const [productsError, setProductsError] = useState("");

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");

  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const [message, setMessage] = useState("");

  const [orders, setOrders] = useState([]);
  const [ordersError, setOrdersError] = useState("");

  const [messages, setMessages] = useState([]);
  const [messagesError, setMessagesError] = useState("");

  const autoSeedStarted = useRef(false);


  /* =========================
     PRODUCTS
  ========================= */

  useEffect(() => {
    if (!isAdmin) return;

    const unsubscribe = subscribeToProducts(
      async (items) => {
        setProducts(items);
        setProductsError("");

        if (
          items.length === 0 &&
          !autoSeedStarted.current
        ) {
          autoSeedStarted.current = true;
          setSaving(true);

          try {
            await seedProducts();

            setMessage(
              "15 starter products were added to Firebase."
            );
          } catch (error) {
            console.error(
              "Could not initialize products:",
              error
            );

            setProductsError(
              `Products could not be initialized: ${
                error?.message ||
                "Firebase write failed."
              }`
            );
          } finally {
            setSaving(false);
          }
        }
      },

      (error) => {
        console.error(
          "Could not load products:",
          error
        );

        setProductsError(
          error?.message ||
            "Could not load products from Firebase."
        );
      }
    );

    return () => unsubscribe?.();
  }, [isAdmin]);


  /* =========================
     ORDERS
  ========================= */

  useEffect(() => {
    if (!isAdmin) return;

    const unsubscribe = subscribeToOrders(
      setOrders,

      (error) => {
        console.error(
          "Could not load orders:",
          error
        );

        setOrdersError(
          error?.message ||
            "Could not load orders from Firebase."
        );
      }
    );

    return () => unsubscribe?.();
  }, [isAdmin]);


  /* =========================
     CUSTOMER MESSAGES
  ========================= */

  useEffect(() => {
    if (!isAdmin) return;

    const messagesQuery = query(
      collection(db, "messages"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      messagesQuery,

      (snapshot) => {
        const items = snapshot.docs.map(
          (messageDoc) => ({
            id: messageDoc.id,
            ...messageDoc.data(),
          })
        );

        setMessages(items);
        setMessagesError("");
      },

      (error) => {
        console.error(
          "Could not load messages:",
          error
        );

        setMessagesError(
          error?.message ||
            "Could not load customer messages."
        );
      }
    );

    return () => unsubscribe();
  }, [isAdmin]);


  /* =========================
     STATS
  ========================= */

  const lowStock = products.filter(
    (p) => Number(p.stock) <= 5
  ).length;

  const totalStock = products.reduce(
    (sum, p) =>
      sum + Number(p.stock || 0),
    0
  );

  const unreadMessages = messages.filter(
    (msg) => msg.status === "unread"
  ).length;

  const filtered = useMemo(() => {
    const matches = products.filter((p) =>
      p.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    if (!sortField) return matches;

    const sorted = [...matches].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "price" || sortField === "stock") {
        valA = Number(valA || 0);
        valB = Number(valB || 0);
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }

      valA = String(valA || "").toLowerCase();
      valB = String(valB || "").toLowerCase();

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [products, search, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };


  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }


  /* =========================
     PRODUCT FORM
  ========================= */

  const updateField = (e) =>
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });


  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };


  const submit = async (e) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      Number(form.price) < 0 ||
      Number(form.stock) < 0
    ) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const product = {
        id:
          editingId ||
          `p-${Date.now()}`,

        name: form.name.trim(),

        category: form.category,

        tag:
          form.tag.trim() ||
          "New arrival",

        desc:
          form.desc.trim(),

        price:
          Number(form.price),

        stock:
          Number(form.stock),

        img:
          form.img.trim() ||
          "https://placehold.co/800x800?text=LittleBear",
      };

      if (editingId) {
        await updateProduct(
          editingId,
          product
        );
      } else {
        await createProduct(product);
      }

      setMessage(
        editingId
          ? "Product updated in Firebase."
          : "Product added to Firebase."
      );

      resetForm();
    } catch (error) {
      console.error(error);

      setMessage(
        `Firebase error: ${error.message}`
      );
    } finally {
      setSaving(false);

      setTimeout(
        () => setMessage(""),
        3000
      );
    }
  };


  const editProduct = (p) => {
    setEditingId(p.id);

    setForm({
      name: p.name,
      category: p.category,
      tag: p.tag || "",
      desc: p.desc || "",
      price: p.price,
      stock: p.stock ?? 0,
      img: p.img || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  const deleteProduct = async (id) => {
    if (
      !window.confirm(
        "Delete this product from Firebase?"
      )
    ) {
      return;
    }

    try {
      await removeProduct(id);

      if (editingId === id) {
        resetForm();
      }

      setMessage(
        "Product deleted from Firebase."
      );
    } catch (error) {
      setMessage(
        `Firebase error: ${error.message}`
      );
    }
  };


  const changeStock = async (
    id,
    amount
  ) => {
    const product = products.find(
      (p) => p.id === id
    );

    if (!product) return;

    try {
      await updateProduct(
        id,
        {
          ...product,
          stock: Math.max(
            0,
            Number(product.stock || 0) +
              amount
          ),
        }
      );
    } catch (error) {
      setMessage(
        `Firebase error: ${error.message}`
      );
    }
  };


  const initializeProducts = async () => {
    setSaving(true);

    try {
      await seedProducts();

      setMessage(
        "Starter products have been added to Firebase."
      );
    } catch (error) {
      setMessage(
        `Firebase error: ${error.message}`
      );
    } finally {
      setSaving(false);
    }
  };


  /* =========================
     ORDERS
  ========================= */

  const changeOrderStatus = async (
    id,
    status
  ) => {
    try {
      await updateOrderStatus(
        id,
        status
      );
    } catch (error) {
      setOrdersError(error.message);
    }
  };


  /* =========================
     MESSAGES
  ========================= */

  const markMessageAsRead = async (
    messageId
  ) => {
    try {
      await updateDoc(
        doc(
          db,
          "messages",
          messageId
        ),
        {
          status: "read",
        }
      );
    } catch (error) {
      console.error(
        "Could not mark message as read:",
        error
      );

      alert(
        "Could not update the message."
      );
    }
  };


  const deleteMessage = async (
    messageId
  ) => {
    if (
      !window.confirm(
        "Delete this customer message?"
      )
    ) {
      return;
    }

    try {
      await deleteDoc(
        doc(
          db,
          "messages",
          messageId
        )
      );
    } catch (error) {
      console.error(
        "Could not delete message:",
        error
      );

      alert(
        "Could not delete the message."
      );
    }
  };


  /* =========================
     UI
  ========================= */

  return (
    <main className="min-h-screen bg-[#fcfbfa] px-4 md:px-8 py-8">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">

          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-bold text-orange-500">
              LittleBear
            </p>

            <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mt-1">
              Admin Dashboard
            </h1>

            <p className="text-stone-500 mt-1">
              Manage products, orders, inventory,
              and customer messages.
            </p>
          </div>


          <div className="flex items-center gap-3">

            <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm min-w-[260px]">

              <div className="h-11 w-11 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                {(
                  user?.name ||
                  user?.email ||
                  "U"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="min-w-0">

                <p className="font-bold text-stone-900 truncate">
                  {user?.name || "User"}
                </p>

                <p
                  className="text-sm text-stone-500 truncate"
                  title={user?.email || ""}
                >
                  {user?.email ||
                    "No email"}
                </p>

                <p className="text-xs text-stone-400 capitalize">
                  {user?.role || "user"}
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* STATS */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">

          <Stat
            icon={<Package />}
            label="Products"
            value={products.length}
          />

          <Stat
            icon={<Boxes />}
            label="Total stock"
            value={totalStock}
          />

          <Stat
            icon={<AlertTriangle />}
            label="Low stock ≤ 5"
            value={lowStock}
          />

          <Stat
            icon={<ShoppingBag />}
            label="Orders"
            value={orders.length}
          />

          <Stat
            icon={<Mail />}
            label="Messages"
            value={unreadMessages}
          />

        </div>


        {/* GLOBAL MESSAGE */}

        {message && (
          <div className="mb-5 rounded-xl bg-green-50 border border-green-200 text-green-700 px-4 py-3">
            {message}
          </div>
        )}


        {/* PRODUCT ERROR */}

        {productsError && (
          <div className="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3">
            Products could not be loaded:
            {" "}
            {productsError}
          </div>
        )}


        {/* STARTER PRODUCTS */}

        {products.length === 0 &&
          !productsError && (
            <div className="mb-5 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

              <div>
                <strong>
                  Loading starter products...
                </strong>

                <p className="text-sm mt-1">
                  LittleBear is syncing
                  the 15 products to Firebase.
                </p>
              </div>

              <button
                onClick={initializeProducts}
                disabled={saving}
                className="rounded-xl bg-orange-500 text-white px-4 py-2.5 font-bold disabled:opacity-50"
              >
                {saving
                  ? "Syncing..."
                  : "Sync products"}
              </button>

            </div>
          )}


        {/* ADD / UPDATE PRODUCT */}

        <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 mb-8">

          <div className="flex items-center justify-between mb-5">

            <h2 className="text-xl font-bold">
              {editingId
                ? "Update product"
                : "Add new product"}
            </h2>

            {editingId && (
              <button
                onClick={resetForm}
                className="text-sm font-semibold text-stone-500 hover:text-stone-900"
              >
                Cancel edit
              </button>
            )}

          </div>


          <form
            onSubmit={submit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >

            <Input
              label="Product name"
              name="name"
              value={form.name}
              onChange={updateField}
              required
            />

            <div>
              <label className="label">
                Category
              </label>

              <select
                name="category"
                value={form.category}
                onChange={updateField}
                className="input"
              >
                <option value="bears">
                  Bears
                </option>

                <option value="bunnies">
                  Bunnies
                </option>

                <option value="cats">
                  Cats
                </option>

                <option value="sets">
                  Gift sets
                </option>
              </select>
            </div>


            <Input
              label="Tag"
              name="tag"
              value={form.tag}
              onChange={updateField}
            />


            <Input
              label="Price ($)"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={updateField}
              required
            />


            <Input
              label="Stock quantity"
              name="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={updateField}
              required
            />


            <Input
              label="Image URL"
              name="img"
              value={form.img}
              onChange={updateField}
            />


            <div className="md:col-span-2 lg:col-span-3">

              <label className="label">
                Description
              </label>

              <textarea
                name="desc"
                value={form.desc}
                onChange={updateField}
                rows="3"
                className="input resize-none"
              />

            </div>


            <div className="md:col-span-2 lg:col-span-3 flex gap-3">

              <button
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-stone-900 text-white px-5 py-3 font-bold hover:bg-orange-500 transition disabled:opacity-50"
              >

                {editingId ? (
                  <Pencil size={17} />
                ) : (
                  <Plus size={18} />
                )}

                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update product"
                  : "Add product"}

              </button>


              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-stone-200 px-5 py-3 font-semibold"
              >
                Clear
              </button>

            </div>

          </form>

        </section>


        {/* ORDERS */}

        <section className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden mb-8">

          <div className="p-5 border-b border-stone-100 flex items-center justify-between">

            <div>
              <h2 className="text-xl font-bold">
                Customer Orders
              </h2>

              <p className="text-sm text-stone-400 mt-1">
                Orders appear here automatically after checkout.
              </p>
            </div>

            <span className="rounded-full bg-orange-100 text-orange-700 px-3 py-1 text-sm font-bold">
              {orders.length} order(s)
            </span>

          </div>


          {ordersError && (
            <div className="m-5 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
              <strong>
                Orders could not be loaded:
              </strong>{" "}
              {ordersError}
            </div>
          )}


          {orders.length === 0 ? (

            <div className="text-center py-12 text-stone-400">

              <ShoppingBag
                className="mx-auto mb-3"
                size={34}
              />

              <p className="font-semibold text-stone-600">
                No customer orders yet.
              </p>

              <p className="text-sm mt-1">
                A successful checkout
                will create an order here.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px] text-sm">

                <thead className="bg-stone-50 text-stone-500">

                  <tr>

                    <th className="text-left p-4">
                      Order
                    </th>

                    <th className="text-left p-4">
                      Customer
                    </th>

                    <th className="text-left p-4">
                      Products
                    </th>

                    <th className="text-left p-4">
                      Total
                    </th>

                    <th className="text-left p-4">
                      Status
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {orders.map((order) => (

                    <tr
                      key={order.id}
                      className="border-t border-stone-100 align-top"
                    >

                      <td className="p-4 font-bold">
                        #
                        {order.id
                          .slice(-6)
                          .toUpperCase()}
                      </td>


                      <td className="p-4">

                        <p className="font-semibold">
                          {order.customerName}
                        </p>

                        <p className="text-xs text-stone-400">
                          {order.customerEmail}
                        </p>

                      </td>


                      <td className="p-4">

                        <div className="space-y-1">

                          {(order.items || []).map(
                            (item, index) => (
                              <p
                                key={`${order.id}-${index}`}
                              >
                                {item.name} ×{" "}
                                {item.qty}
                              </p>
                            )
                          )}

                        </div>

                      </td>


                      <td className="p-4 font-bold">
                        $
                        {Number(
                          order.total || 0
                        ).toFixed(2)}
                      </td>


                      <td className="p-4">

                        <select
                          value={
                            order.status ||
                            "Pending"
                          }
                          onChange={(e) =>
                            changeOrderStatus(
                              order.id,
                              e.target.value
                            )
                          }
                          className="rounded-lg border border-stone-200 px-2 py-1 text-xs font-bold bg-white"
                        >
                          <option>
                            Pending
                          </option>

                          <option>
                            Processing
                          </option>

                          <option>
                            Shipped
                          </option>

                          <option>
                            Completed
                          </option>

                          <option>
                            Cancelled
                          </option>
                        </select>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>


        {/* CUSTOMER MESSAGES */}

        <section className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden mb-8">

          <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

            <div>

              <h2 className="text-xl font-bold">
                Customer Messages
              </h2>

              <p className="text-sm text-stone-400 mt-1">
                Messages submitted from your Contact page.
              </p>

            </div>


            <span className="rounded-full bg-orange-100 text-orange-700 px-3 py-1 text-sm font-bold">
              {unreadMessages} unread
            </span>

          </div>


          {messagesError && (
            <div className="m-5 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
              <strong>
                Messages could not be loaded:
              </strong>{" "}
              {messagesError}
            </div>
          )}


          {messages.length === 0 ? (

            <div className="text-center py-12 text-stone-400">

              <Mail
                className="mx-auto mb-3"
                size={36}
              />

              <p className="font-semibold text-stone-600">
                No customer messages yet.
              </p>

              <p className="text-sm mt-1">
                Messages submitted from the
                Contact page will appear here.
              </p>

            </div>

          ) : (

            <div className="divide-y divide-stone-100">

              {messages.map((msg) => (

                <div
                  key={msg.id}
                  className={`p-5 transition ${
                    msg.status === "unread"
                      ? "bg-orange-50/40"
                      : "hover:bg-stone-50"
                  }`}
                >

                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">

                    <div className="flex gap-4">

                      <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center shrink-0">
                        <Mail size={21} />
                      </div>


                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="font-bold text-stone-900">
                            {msg.name}
                          </h3>

                          {msg.status ===
                            "unread" && (
                            <span className="text-xs font-bold bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                              New
                            </span>
                          )}

                        </div>


                        <a
                          href={`mailto:${msg.email}`}
                          className="text-sm text-orange-600 hover:underline"
                        >
                          {msg.email}
                        </a>


                        <div className="mt-4 rounded-xl bg-white border border-stone-100 p-4">

                          <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">
                            {msg.message}
                          </p>

                        </div>


                        <p className="text-xs text-stone-400 mt-3">

                          {msg.createdAt?.toDate
                            ? msg.createdAt
                                .toDate()
                                .toLocaleString()
                            : "Just now"}

                        </p>

                      </div>

                    </div>


                    <div className="flex gap-2 shrink-0">

                      {msg.status ===
                        "unread" && (

                        <button
                          onClick={() =>
                            markMessageAsRead(
                              msg.id
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-green-50 text-green-700 px-3 py-2 text-sm font-semibold hover:bg-green-100"
                        >
                          <Check size={16} />
                          Mark read
                        </button>

                      )}


                      <button
                        onClick={() =>
                          deleteMessage(
                            msg.id
                          )
                        }
                        className="inline-flex items-center justify-center rounded-xl bg-red-50 text-red-600 px-3 py-2 hover:bg-red-100"
                        title="Delete message"
                      >
                        <Trash2 size={17} />
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>


        {/* INVENTORY */}

        <section className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">

          <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row gap-3 justify-between">

            <h2 className="text-xl font-bold">
              Inventory
            </h2>

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search products..."
              className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 outline-none focus:border-orange-400"
            />

          </div>


          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px] text-sm">

              <thead className="bg-stone-50 text-stone-500">

                <tr>

                  <SortableHeader
                    label="Product"
                    field="name"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />

                  <SortableHeader
                    label="Category"
                    field="category"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />

                  <SortableHeader
                    label="Price"
                    field="price"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />

                  <SortableHeader
                    label="Stock"
                    field="stock"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />

                  <th className="text-right p-4">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {filtered.map((p) => (

                  <tr
                    key={p.id}
                    className="border-t border-stone-100"
                  >

                    <td className="p-4">

                      <div className="flex items-center gap-3">

                        <img
                          src={p.img}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover bg-stone-100"
                        />

                        <div>

                          <p className="font-bold text-stone-900">
                            {p.name}
                          </p>

                          <p className="text-xs text-stone-400">
                            {p.tag}
                          </p>

                        </div>

                      </div>

                    </td>


                    <td className="p-4 capitalize">
                      {p.category}
                    </td>


                    <td className="p-4 font-semibold">
                      $
                      {Number(
                        p.price
                      ).toFixed(2)}
                    </td>


                    <td className="p-4">

                      <div className="flex items-center gap-2">

                        <button
                          onClick={() =>
                            changeStock(
                              p.id,
                              -1
                            )
                          }
                          className="w-8 h-8 rounded-lg border hover:bg-stone-100"
                        >
                          −
                        </button>

                        <span
                          className={`min-w-8 text-center font-bold ${
                            Number(
                              p.stock
                            ) <= 5
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {p.stock}
                        </span>

                        <button
                          onClick={() =>
                            changeStock(
                              p.id,
                              1
                            )
                          }
                          className="w-8 h-8 rounded-lg border hover:bg-stone-100"
                        >
                          +
                        </button>

                      </div>

                    </td>


                    <td className="p-4 text-right">

                      <button
                        onClick={() =>
                          editProduct(p)
                        }
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg mr-1"
                      >
                        <Pencil size={17} />
                      </button>


                      <button
                        onClick={() =>
                          deleteProduct(
                            p.id
                          )
                        }
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={17} />
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>


            {filtered.length === 0 && (
              <p className="text-center text-stone-400 py-10">
                No products found.
              </p>
            )}

          </div>

        </section>

      </div>


      <style>{`

        .label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: #57534e;
          margin-bottom: 7px;
        }

        .input {
          width: 100%;
          border: 1px solid #e7e5e4;
          border-radius: 12px;
          background: #fafaf9;
          padding: 11px 13px;
          outline: none;
        }

        .input:focus {
          border-color: #fb923c;
          box-shadow: 0 0 0 4px #ffedd5;
        }

      `}</style>

    </main>
  );
}


/* =========================
   COMPONENTS
========================= */

function Input({
  label,
  ...props
}) {
  return (
    <div>
      <label className="label">
        {label}
      </label>

      <input
        className="input"
        {...props}
      />
    </div>
  );
}


function SortableHeader({
  label,
  field,
  sortField,
  sortDirection,
  onSort,
}) {
  const isActive = sortField === field;

  return (
    <th className="text-left p-4">
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1.5 font-semibold transition ${
          isActive ? "text-stone-900" : "text-stone-500 hover:text-stone-700"
        }`}
      >
        {label}
        {isActive ? (
          sortDirection === "asc" ? (
            <ArrowUp size={14} />
          ) : (
            <ArrowDown size={14} />
          )
        ) : (
          <ArrowUpDown size={14} className="opacity-40" />
        )}
      </button>
    </th>
  );
}


function Stat({
  icon,
  label,
  value,
}) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">

      <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center">
        {icon}
      </div>

      <div>

        <p className="text-sm text-stone-500">
          {label}
        </p>

        <p className="text-2xl font-bold text-stone-900">
          {value}
        </p>

      </div>

    </div>
  );
}