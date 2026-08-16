import { Globe, MessageCircle, Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const LINK_COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "All toys", to: "/shop" },
      { label: "New arrivals", to: "/shop" },
      { label: "Gift sets", to: "/shop" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Our story", to: "/about" },
      { label: "Sustainability", to: "/about" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "FAQ", to: "/contact" },
      { label: "Contact us", to: "/contact" },
      { label: "Shopping cart", to: "/cart" },
    ],
  },
];

const SOCIALS = [
  { icon: Globe, label: "Home", to: "/" },
  { icon: MessageCircle, label: "Contact", to: "/contact" },
  { icon: Heart, label: "About us", to: "/about" },
];

function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();

    if (!email.trim() || !email.includes("@")) {
      return;
    }

    setIsSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="bg-[#f7f5f0] border-t border-slate-200 shadow-sm mt-auto">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600&display=swap');
      `}</style>

      <div className="max-w-7xl mx-auto px-6 md:px-4 py-8 text-sm text-stone-500 relative overflow-hidden">
        <span
          className="absolute bottom-20 left-6 text-[220px] leading-none opacity-10 pointer-events-none select-none"
          aria-hidden="true"
        >
          🧸
        </span>

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
          <div className="max-w-xl">
            <Link to="/" onClick={scrollToTop} className="flex items-center gap-3 mb-3 w-fit no-underline">
              <span className="text-3xl">🧸</span>
              <span
                className="font-bold text-3xl text-slate-900"
                style={{ fontFamily: "Fredoka, system-ui, sans-serif", letterSpacing: "-0.5px" }}
              >
                Little<span className="text-orange-500">Bear</span>
              </span>
            </Link>

            <p className="text-sm text-stone-500 leading-6 mb-4">
              Handcrafted soft toys made from organic materials, designed to be a child's most treasured companion.
            </p>

            <form
              onSubmit={handleSubscribe}
              className="flex flex-col gap-2 mb-5 max-w-sm"
            >
              <div className="flex items-center bg-white rounded-full border border-slate-200 p-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-transparent px-3 py-1.5 text-sm text-slate-700 placeholder-stone-400 outline-none flex-1 min-w-0"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1 text-white text-xs font-semibold rounded-full px-4 py-2 flex-shrink-0 bg-orange-500 hover:bg-orange-600 transition-colors duration-150"
                >
                  Subscribe <ArrowRight size={12} />
                </button>
              </div>

              {isSubscribed && (
                <p className="text-xs text-green-600 font-medium">Thank you! You are subscribed.</p>
              )}
            </form>

            <div className="flex items-center gap-3">
              {SOCIALS.map(({ icon: Icon, label, to }) => (
                <Link
                  key={label}
                  to={to}
                  onClick={scrollToTop}
                  aria-label={label}
                  title={label}
                  className="w-8 h-8 rounded-full border border-stone-300/40 flex items-center justify-center text-stone-500 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors duration-150 no-underline"
                >
                  <Icon size={14} />
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-12 justify-end flex-1">
            {LINK_COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold mb-4 text-slate-900 text-lg">{col.title}</h4>
                <ul className="space-y-3 text-stone-500 text-base">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        onClick={scrollToTop}
                        className="inline-block px-2 py-0.5 rounded-full hover:bg-orange-50 hover:text-orange-600 transition-colors duration-150 text-sm no-underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 mt-8 pt-5">
          <div className="max-w-7xl mx-auto px-6 md:px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-stone-400">
            <p>© 2026 LittleBear. All rights reserved.</p>
            <p className="text-stone-400">
              Handmade with <span className="text-orange-500">❤</span> in Phnom Penh
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
