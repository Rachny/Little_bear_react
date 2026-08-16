import { useState } from "react";
import { Mail, MessageCircle, Smartphone, MapPin } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

const CONTACT_ITEMS = [
  { icon: Mail, title: "Email us", detail: "hello@littlebear.com" },
  { icon: MessageCircle, title: "Live chat", detail: "Mon–Fri, 9am–5pm" },
  { icon: Smartphone, title: "Follow us", detail: "@LittleBear on X, Instagram, Facebook" },
  { icon: MapPin, title: "Location", detail: "Phnom Penh, Cambodia" },
];

export default function Contact({ cartCount = 0 }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (!name || !email || !message) {
      setError("Please complete all fields.");
      return;
    }

    setSending(true);
    setError("");
    setSent(false);

    try {
      await addDoc(collection(db, "messages"), {
        name,
        email,
        message,
        status: "unread",
        createdAt: serverTimestamp(),
      });

      setForm({ name: "", email: "", message: "" });
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch (firebaseError) {
      console.error("Contact form Firebase error:", firebaseError);
      const code = firebaseError?.code || "";
      if (code === "permission-denied") {
        setError("Firebase denied this message because the Firestore rules in your Firebase project have not been deployed yet. Run DEPLOY_FIRESTORE_RULES.bat, then try again.");
      } else if (code === "failed-precondition") {
        setError("Firestore is not enabled in this Firebase project.");
      } else {
        setError(firebaseError?.message || "We couldn't send your message. Please try again.");
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ backgroundColor: "#fcfbfa", color: "#3c322c" }} className="min-h-screen font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .lb-heading { font-family: 'Fredoka', sans-serif; }
        .lb-body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .lb-input {
          border-radius: 12px;
          border: 1px solid #e4ded7;
          padding: 12px 16px;
          width: 100%;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.95rem;
        }
        .lb-input:focus {
          outline: none;
          border-color: #fd7e14;
          box-shadow: 0 0 0 4px rgba(253, 126, 20, 0.15);
        }
      `}</style>

      

      {/* Contact grid */}
      <section className="max-w-6xl mx-auto px-6 py-16 lb-body">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Info column */}
          <div className="lg:col-span-5">
            <p className="uppercase tracking-wide text-sm font-bold mb-2" style={{ color: "#fd7e14" }}>
              Get in touch
            </p>
            <h1 className="lb-heading text-4xl font-semibold leading-tight mb-4 text-stone-900">
              We'd love to hear from you
            </h1>
            <p className="text-stone-500 leading-relaxed mb-10 max-w-sm">
              Whether you need help choosing a toy, want to arrange a wholesale order, or just want to say hello —
              our small workshop team replies personally.
            </p>

            <div className="space-y-5">
              {CONTACT_ITEMS.map(({ icon: Icon, title, detail }) => (
                <div key={title} className="flex items-center gap-4">
                  <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-white border border-stone-100 rounded-2xl shadow-sm">
                    <Icon size={24} style={{ color: "#fd7e14" }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900">{title}</h3>
                    <p className="text-sm text-stone-400">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form column */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6 md:p-10">
              {sent && (
                <div className="mb-6 bg-green-50 text-green-700 text-sm font-medium rounded-xl px-4 py-3">
                  Message sent! We'll be in touch soon.
                </div>
              )}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl px-4 py-3">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-stone-500 mb-1.5">Your name</label>
                  <input
                    type="text"
                    required
                    placeholder="Hon Rachny"
                    className="lb-input"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-500 mb-1.5">Email address</label>
                  <input
                    type="email"
                    required
                    placeholder="honrachny@example.com"
                    className="lb-input"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-stone-500 mb-1.5">How can we help?</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Write your message here..."
                    className="lb-input resize-none"
                    value={form.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                  />
                </div>
                <div className="md:col-span-2 mt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl font-semibold text-white transition-colors"
                    style={{ backgroundColor: "#3c322c" }}
                    disabled={sending}
                    onMouseEnter={(e) => {
                      if (!sending) e.currentTarget.style.backgroundColor = "#fd7e14";
                    }}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3c322c")}
                  >
                    {sending ? "Sending..." : "Send message"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      
    </div>
  );
}