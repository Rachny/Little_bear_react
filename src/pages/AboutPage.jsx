import { ShoppingCart } from "lucide-react";

export default function About({ cartCount = 0 }) {
  return (
    <div style={{ backgroundColor: "#fcfbfa", color: "#3c322c" }} className="min-h-screen font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .lb-heading { font-family: 'Fredoka', sans-serif; }
        .lb-body { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      

      {/* Hero */}
      <header className="max-w-6xl mx-auto px-6 py-16 lb-body">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="uppercase tracking-wide text-sm font-bold mb-2" style={{ color: "#fd7e14" }}>
              Our story
            </p>
            <h1 className="lb-heading text-4xl md:text-5xl font-semibold leading-tight mb-4 text-stone-900">
              Born from a
              <br />
              mother's wish
            </h1>
            <p className="text-stone-500 text-lg leading-relaxed max-w-md">
              LittleBear began with a simple dream: to create soft, adorable, and comforting toys that bring happiness 
              to everyone. What started as a small idea grew into a cozy little world filled with cuddly bears, 
              bunnies, kitties, and special gifts. Today, LittleBear is all about sharing warmth, joy, and a 
              little bit of magic through every toy we offer.
            </p>
          </div>
          <div className="flex justify-center">
            <img
              src="https://img.alicdn.com/bao/uploaded/i2/2029774751/O1CN01GmJXRM1ky0Ec1uI9L_!!2029774751.jpg"
              alt="Our workshop"
              className="rounded-[2rem] shadow-xl w-full object-cover"
              style={{ maxHeight: "380px", border: "6px solid #fff" }}
            />
          </div>
        </div>
      </header>

      {/* Details */}
      <section className="max-w-6xl mx-auto px-6 pb-20 lb-body">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <h2 className="font-bold text-lg text-stone-900 mb-3">A small stitch at a time</h2>
            <p className="text-sm text-stone-500 leading-relaxed">
              What started as a simple idea to create adorable and comforting soft toys quickly grew into LittleBear. 
              Each toy is chosen with care, from its soft materials to its cute details, so every little bear, bunny, 
              and friend can bring warmth and happiness to someone special. At LittleBear, we believe that even the 
              smallest toy can create a big smile and a lasting memory.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <h2 className="font-bold text-lg text-stone-900 mb-3">Eco-friendly &amp; conscious</h2>
            <p className="text-sm text-stone-500 leading-relaxed">
              As LittleBear grows, our goal stays the same: to bring soft, adorable, and joyful toys to every customer. 
              We carefully choose our products and focus on quality, comfort, and beautiful designs. From a tiny gift to 
              a special companion, every LittleBear toy is made to bring a little more happiness into your day.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}