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
              LittleBear began in a small workshop, when founder Rachny HON couldn't find a toy soft enough, safe
              enough, and beautiful enough for her newborn. So she made one herself — and everything grew from
              there.
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
              What started as a single homemade bear for a nursery quickly caught the attention of friends and
              neighbors. Rachny prioritized strict quality rules: zero plastics, 100% traceably-sourced organic
              cotton threads, and natural plant extracts for rich safe coloring dyes.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <h2 className="font-bold text-lg text-stone-900 mb-3">Eco-friendly &amp; conscious</h2>
            <p className="text-sm text-stone-500 leading-relaxed">
              Today, our collection has grown, but our process remains remarkably unchanged. We work entirely
              alongside local suppliers to minimize transport footprints and donate a portion of all proceeds
              directly to children's health and nature preservation foundations.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}