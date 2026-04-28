import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { CATEGORIES, useProducts, waOrderLink, type Product } from "@/lib/aashaData";
import { LazyImage } from "./LazyImage";
import { ProductLightbox } from "./ProductLightbox";

const INITIAL_VISIBLE = 8;
const STEP = 8;

const FabricPlaceholder = () => (
  <div
    className="flex h-full w-full items-center justify-center bg-card text-3xl"
    style={{
      backgroundImage:
        "repeating-linear-gradient(45deg, hsl(38 74% 47% / 0.06) 0 1px, transparent 1px 14px), repeating-linear-gradient(-45deg, hsl(38 74% 47% / 0.06) 0 1px, transparent 1px 14px)",
    }}
    aria-label="No image"
  >
    🧵
  </div>
);

// Days since a YYYY-MM-DD string
const daysAgo = (date?: string): number | null => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  const diff = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  return diff < 0 ? 0 : diff;
};

const freshnessLabel = (date?: string) => {
  const d = daysAgo(date);
  if (d === null) return null;
  if (d === 0) return "आज का stock";
  if (d === 1) return "कल का stock";
  if (d <= 7) return `${d} दिन पहले`;
  return null;
};

const StockBadge = ({ p }: { p: Product }) => {
  if (p.stock_status === "out")
    return (
      <span className="font-deva pill absolute left-2 top-2 bg-destructive text-destructive-foreground shadow-card">
        खत्म
      </span>
    );
  if (p.stock_status === "limited")
    return (
      <span className="font-deva pill absolute left-2 top-2 bg-saffron text-primary-foreground text-[10px] font-bold shadow-card">
        🔥 Limited
      </span>
    );
  // Featured → "Fast Moving", recent (≤2d) → "नया Lot", else nothing
  const d = daysAgo(p.date);
  if (p.is_featured)
    return (
      <span className="pill absolute left-2 top-2 bg-maroon text-foreground text-[10px] font-bold uppercase shadow-card">
        🔥 Fast Moving
      </span>
    );
  if (d !== null && d <= 2)
    return (
      <span className="pill absolute left-2 top-2 gradient-gold text-[10px] font-bold uppercase text-primary-foreground shadow-card">
        नया Lot
      </span>
    );
  return null;
};

// Build a stable, real-looking product code from id
const productCode = (p: Product) => {
  const raw = String(p.id || "");
  const digits = raw.replace(/\D/g, "");
  const code = digits ? digits.slice(-6).padStart(6, "0") : raw.toUpperCase().slice(0, 6);
  return `AT-${code}`;
};

// Extract numeric price + unit from rate string e.g. "₹350/KG"
const parseRate = (rate?: string) => {
  if (!rate) return { price: "", unit: "" };
  const m = rate.match(/([₹]?\s*[\d,.]+)\s*\/?\s*(\w+)?/i);
  if (!m) return { price: rate, unit: "" };
  const priceRaw = m[1].replace(/\s/g, "");
  return {
    price: priceRaw.startsWith("₹") ? priceRaw : `₹${priceRaw}`,
    unit: m[2] ? `/${m[2].toUpperCase()}` : "",
  };
};

const ProductCard = ({ p, onOpen }: { p: Product; onOpen: (p: Product) => void }) => {
  const out = p.stock_status === "out";
  const { price, unit } = parseRate(p.rate);
  const fresh = freshnessLabel(p.date);
  const code = productCode(p);

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-primary/15 bg-card transition-all hover:border-primary/40 hover:shadow-gold ${
        out ? "opacity-60" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => onOpen(p)}
        className="relative aspect-square overflow-hidden bg-background text-left"
        aria-label={`View ${p.name}`}
      >
        {p.image ? (
          <LazyImage src={p.image} alt={p.name} className="h-full w-full" />
        ) : (
          <FabricPlaceholder />
        )}
        <StockBadge p={p} />
      </button>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {/* Code + Variety */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[9.5px] uppercase tracking-wider text-muted-foreground/70">
            {code}
          </span>
          {p.variety && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary truncate">
              {p.variety}
            </span>
          )}
        </div>

        {/* Name */}
        <h3 className="font-display text-[0.95rem] font-semibold leading-tight text-foreground line-clamp-2">
          {p.name}
        </h3>
        {p.nameEn && p.nameEn !== p.name && (
          <div className="text-[10.5px] text-muted-foreground/80 -mt-0.5 line-clamp-1">{p.nameEn}</div>
        )}

        {/* Spec grid */}
        <div className="mt-1 grid grid-cols-2 gap-1 rounded-lg border border-primary/10 bg-background/40 p-1.5">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70">Panna</span>
            <span className="text-[11px] font-semibold text-foreground">{p.panna || "—"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70">Cut</span>
            <span className="text-[11px] font-semibold text-foreground">{p.cut || "Standard"}</span>
          </div>
        </div>

        {/* Description */}
        {p.info && (
          <p className="font-deva mt-0.5 text-[11px] leading-snug text-muted-foreground line-clamp-2">
            {p.info}
          </p>
        )}

        {/* Price block */}
        <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
          <span className="font-display text-lg font-bold text-primary leading-none">
            {price || p.rate || "—"}
          </span>
          {unit && <span className="text-[10px] font-medium text-muted-foreground">{unit}</span>}
          <span className="text-[9.5px] font-medium text-muted-foreground/80">+ GST</span>
        </div>

        {/* Bulk + freshness line */}
        <div className="font-deva flex items-center justify-between gap-2 text-[10px] text-muted-foreground/90">
          <span>📦 Bulk rate available</span>
          {fresh && <span className="text-primary/90 font-semibold">• {fresh}</span>}
        </div>

        {/* CTA */}
        <div className="mt-auto pt-2">
          {out ? (
            <span className="font-deva flex h-10 w-full items-center justify-center rounded-full bg-muted text-[12px] font-semibold text-muted-foreground">
              उपलब्ध नहीं
            </span>
          ) : (
            <a
              href={waOrderLink(p.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-whatsapp text-[12px] font-bold text-whatsapp-foreground shadow-card transition-transform active:scale-95 hover:brightness-110"
            >
              <span aria-hidden>📲</span> WhatsApp पर Order करें
            </a>
          )}
        </div>
      </div>
    </article>
  );
};

export const Products = () => {
  const { products, loading } = useProducts();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const [visible, setVisible] = useState(INITIAL_VISIBLE);
  const [openProduct, setOpenProduct] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (cat !== "All" && p.category !== cat) return false;
      if (!q) return true;
      return [p.name, p.nameEn, p.variety, p.info, p.category]
        .filter(Boolean)
        .some((s) => (s as string).toLowerCase().includes(q));
    });
  }, [products, query, cat]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisible(INITIAL_VISIBLE);
  }, [query, cat]);

  const shown = filtered.slice(0, visible);
  const remaining = Math.max(0, filtered.length - visible);

  return (
    <section id="products" className="border-b border-primary/15 py-10 md:py-16">
      <div className="mx-auto max-w-6xl px-3 md:px-4">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground md:text-4xl">
              आज का स्टॉक
            </h2>
            <p className="mt-1 text-xs text-muted-foreground md:text-sm">
              Daily curated wholesale fabrics — direct from Surat
            </p>
          </div>
          <span className="hidden text-xs text-muted-foreground md:block">
            {filtered.length} items
          </span>
        </div>

        {/* Trust strip — wholesale credibility */}
        <div className="-mx-3 mb-4 flex gap-2 overflow-x-auto px-3 pb-1 scrollbar-hide md:mx-0 md:px-0">
          <span className="font-deva pill shrink-0 border border-primary/20 bg-card text-[10.5px] text-foreground/80">
            ✓ GST Registered
          </span>
          <span className="font-deva pill shrink-0 border border-primary/20 bg-card text-[10.5px] text-foreground/80">
            ✓ Surat से सीधा mill rate
          </span>
          <span className="font-deva pill shrink-0 border border-primary/20 bg-card text-[10.5px] text-foreground/80">
            ✓ UPI / NEFT / RTGS
          </span>
          <span className="font-deva pill shrink-0 border border-primary/20 bg-card text-[10.5px] text-foreground/80">
            ✓ All India delivery
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="कपड़ा खोजें..."
            className="font-deva h-12 w-full rounded-full border border-primary/20 bg-card pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-primary"
          />
        </div>

        {/* Category pills */}
        <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-3 scrollbar-hide md:mx-0 md:px-0">
          {CATEGORIES.map((c) => {
            const active = cat === c;
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-primary/25 bg-transparent text-foreground/80 hover:border-primary/60"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {loading && products.length === 0 ? (
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl border border-primary/10 bg-card" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-primary/15 bg-card p-10 text-center">
            <div className="text-3xl">🧵</div>
            <p className="font-deva mt-3 text-sm text-muted-foreground">
              कोई कपड़ा नहीं मिला। दूसरी category try करें।
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-4">
              {shown.map((p) => (
                <ProductCard key={String(p.id)} p={p} onOpen={setOpenProduct} />
              ))}
            </div>

            {remaining > 0 && (
              <div className="mt-6 flex flex-col items-center gap-2">
                <button
                  onClick={() => setVisible((v) => v + STEP)}
                  className="font-deva inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card px-6 py-2.5 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary/5 md:text-sm"
                >
                  और {remaining} देखें <ChevronDown size={14} />
                </button>
                <span className="text-[10.5px] text-muted-foreground/80">
                  {shown.length} / {filtered.length} दिखाए जा रहे हैं
                </span>
              </div>
            )}
            {remaining === 0 && filtered.length > INITIAL_VISIBLE && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setVisible(INITIAL_VISIBLE)}
                  className="font-deva text-xs font-semibold text-muted-foreground hover:text-primary"
                >
                  ↑ कम दिखाएँ
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <ProductLightbox product={openProduct} onClose={() => setOpenProduct(null)} />
    </section>
  );
};
