import { waLink } from "@/lib/aashaData";

const trustItems = [
  "✓ GST Registered",
  "🚚 All India Delivery",
  "📦 500+ Orders",
  "🔄 Daily Stock Updates",
];

export const Hero = () => {
  return (
    <section
      id="hero"
      className="relative flex min-h-[75vh] items-center overflow-hidden border-b border-primary/15 md:min-h-[88vh]"
    >
      <div className="absolute inset-0 texture-weave" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 80% 10%, hsl(38 74% 47% / 0.12), transparent), radial-gradient(40% 40% at 10% 90%, hsl(0 64% 33% / 0.08), transparent)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-14 md:py-24">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-wider text-primary">
          🧵 Surat's Trusted Wholesaler
        </div>

        <h1 className="mt-5 font-display text-[2.4rem] font-bold leading-[1.05] text-foreground text-balance md:text-6xl">
          Premium Fabrics,
          <br />
          <span className="bg-gradient-to-r from-primary-glow via-primary to-primary-dark bg-clip-text text-transparent">
            Wholesale Rates.
          </span>
        </h1>

        <p className="font-deva mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
          सूरत से सीधा कट-पीस कपड़ा — कॉटन, सिल्क, रेयॉन, साटन। हर दिन नया स्टॉक,
          भरोसेमंद रेट, छोटे रिटेलर्स और बुटीक के लिए।
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <a
            href="#products"
            className="font-deva inline-flex h-12 items-center justify-center rounded-full gradient-gold px-6 text-sm font-bold text-primary-foreground shadow-gold transition-transform active:scale-95 md:text-base"
          >
            माल देखें →
          </a>
          <a
            href={waLink("नमस्ते, मुझे आपके fabric के बारे में जानकारी चाहिए")}
            target="_blank"
            rel="noopener noreferrer"
            className="font-deva inline-flex h-12 items-center justify-center gap-2 rounded-full bg-whatsapp px-6 text-sm font-bold text-whatsapp-foreground transition-transform active:scale-95 md:text-base"
          >
            <span aria-hidden>📲</span> WhatsApp करें
          </a>
        </div>

        <div className="mt-8 -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide">
          {trustItems.map((t) => (
            <span
              key={t}
              className="pill shrink-0 border border-primary/20 bg-card/60 text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
