import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { CATEGORIES, useProducts, waOrderLink, type Product } from "@/lib/aashaData";
import { LazyImage } from "./LazyImage";
import { ProductLightbox } from "./ProductLightbox";

/* ---------------- Category meta (Hindi + English + emoji) ---------------- */
const CATEGORY_META: Record<
  string,
  { hi: string; en: string; emoji: string; tagline: string; gradient: string }
> = {
  Cotton: {
    hi: "कॉटन",
    en: "Cotton",
    emoji: "🌾",
    tagline: "Pure & breathable",
    gradient: "from-amber-500/20 to-orange-500/10",
  },
  Silk: {
    hi: "सिल्क",
    en: "Silk",
    emoji: "✨",
    tagline: "Luxury & shine",
    gradient: "from-pink-500/20 to-rose-500/10",
  },
  Rayon: {
    hi: "रेयॉन",
    en: "Rayon",
    emoji: "💧",
    tagline: "Soft & flowy",
    gradient: "from-sky-500/20 to-blue-500/10",
  },
  Satin: {
    hi: "साटन",
    en: "Satin",
    emoji: "🌟",
    tagline: "Smooth & glossy",
    gradient: "from-purple-500/20 to-fuchsia-500/10",
  },
  Readymade: {
    hi: "रेडीमेड",
    en: "Readymade",
    emoji: "👗",
    tagline: "Ready to wear",
    gradient: "from-emerald-500/20 to-teal-500/10",
  },
  Curtain: {
    hi: "पर्दा",
    en: "Curtain",
    emoji: "🪟",
    tagline: "Home decor",
    gradient: "from-indigo-500/20 to-violet-500/10",
  },
  Other: {
    hi: "अन्य",
    en: "Other Fabrics",
    emoji: "🧵",
    tagline: "Special varieties",
    gradient: "from-slate-500/20 to-zinc-500/10",
  },
};

const FabricPlaceholder = () => (
  <div
    className="flex h-full w-full items-center justify-center bg-card text-2xl"
    style={{
      backgroundImage:
        "repeating-linear-gradient(45deg, hsl(38 74% 47% / 0.06) 0 1px, transparent 1px 14px), repeating-linear-gradient(-45deg, hsl(38 74% 47% / 0.06) 0 1px, transparent 1px 14px)",
    }}
    aria-label="No image"
  >
    🧵
  </div>
);

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

const productCode = (p: Product) => {
  const raw = String(p.id || "");
  const digits = raw.replace(/\D/g, "");
  const code = digits ? digits.slice(-6).padStart(6, "0") : raw.toUpperCase().slice(0, 6);
  return `AT-${code}`;
};

/* ---------------- Compact product card (used inside each category row) ---------------- */
const MiniCard = ({ p, onOpen }: { p: Product; onOpen: (p: Product) => void }) => {
  const out = p.stock_status === "out";
  const { price, unit } = parseRate(p.rate);
  const code = productCode(p);

  return (
    <article
      className={`group relative flex w-[160px] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-primary/15 bg-card transition-all hover:border-primary/40 hover:shadow-gold md:w-[200px] ${
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
        {out && (
          <span className="font-deva pill absolute left-2 top-2 bg-destructive text-destructive-foreground shadow-card">
            खत्म
          </span>
        )}
        {p.is_featured && !out && (
          <span className="pill absolute left-2 top-2 bg-maroon text-foreground text-[9px] font-bold uppercase shadow-card">
            🔥 Hot
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col gap-1 p-2">
        <span className="font-mono text-[8.5px] uppercase tracking-wider text-muted-foreground/70">
          {code}
        </span>
        <h3 className="font-display text-[12.5px] font-semibold leading-tight text-foreground line-clamp-2">
          {p.name}
        </h3>
        {p.nameEn && p.nameEn !== p.name && (
          <div className="text-[10px] text-muted-foreground/80 -mt-0.5 line-clamp-1">
            {p.nameEn}
          </div>
        )}

        <div className="mt-0.5 flex items-baseline gap-1">
          <span className="font-display text-base font-bold text-primary leading-none">
            {price || p.rate || "—"}
          </span>
          {unit && <span className="text-[9px] font-medium text-muted-foreground">{unit}</span>}
        </div>

        <div className="mt-auto pt-1.5">
          {out ? (
            <span className="font-deva flex h-8 w-full items-center justify-center rounded-full bg-muted text-[10.5px] font-semibold text-muted-foreground">
              उपलब्ध नहीं
            </span>
          ) : (
            <a
              href={waOrderLink(p.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-full items-center justify-center gap-1 rounded-full bg-whatsapp text-[10.5px] font-bold text-whatsapp-foreground shadow-card transition-transform active:scale-95 hover:brightness-110"
            >
              📲 Order
            </a>
          )}
        </div>
      </div>
    </article>
  );
};

/* ---------------- Horizontal scroller with arrows ---------------- */
const HScroller = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: "l" | "r") => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir === "l" ? -el.clientWidth * 0.8 : el.clientWidth * 0.8, behavior: "smooth" });
  };
  return (
    <div className="relative -mx-3 md:mx-0">
      <button
        onClick={() => scroll("l")}
        aria-label="Scroll left"
        className="absolute left-1 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-primary/20 bg-background/90 p-2 shadow-card backdrop-blur transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground md:flex"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => scroll("r")}
        aria-label="Scroll right"
        className="absolute right-1 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-primary/20 bg-background/90 p-2 shadow-card backdrop-blur transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground md:flex"
      >
        <ChevronRight size={18} />
      </button>
      <div
        ref={ref}
        className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-smooth px-3 pb-2 scrollbar-hide md:gap-4 md:px-12"
      >
        {children}
      </div>
    </div>
  );
};

/* ---------------- Category icon strip (Myntra/Flipkart style) ---------------- */
const CategoryStrip = ({
  active,
  onSelect,
  counts,
}: {
  active: string;
  onSelect: (c: string) => void;
  counts: Record<string, number>;
}) => {
  const items = ["All", ...CATEGORIES.filter((c) => c !== "All" && (counts[c] || 0) > 0)];
  return (
    <div className="-mx-3 flex gap-3 overflow-x-auto px-3 pb-3 scrollbar-hide md:mx-0 md:gap-5 md:px-0">
      {items.map((c) => {
        const meta = CATEGORY_META[c] || { hi: c, en: c, emoji: "🧶", tagline: "", gradient: "from-primary/20 to-primary/5" };
        const isAll = c === "All";
        const isActive = active === c;
        return (
          <button
            key={c}
            onClick={() => {
              onSelect(c);
              if (!isAll) {
                document.getElementById(`cat-${c}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
              } else {
                document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
            className="group flex w-[78px] shrink-0 flex-col items-center gap-1.5 md:w-[96px]"
          >
            <div
              className={`flex h-[78px] w-[78px] items-center justify-center rounded-full border-2 bg-gradient-to-br text-3xl transition-all md:h-[96px] md:w-[96px] md:text-4xl ${
                meta.gradient
              } ${
                isActive
                  ? "border-primary shadow-gold scale-105"
                  : "border-primary/15 group-hover:border-primary/50 group-hover:scale-105"
              }`}
            >
              {isAll ? "🛍️" : meta.emoji}
            </div>
            <span
              className={`text-center text-[11px] font-semibold leading-tight md:text-[12.5px] ${
                isActive ? "text-primary" : "text-foreground/85"
              }`}
            >
              {isAll ? "सभी" : meta.hi}
            </span>
            <span className="text-center text-[9.5px] text-muted-foreground -mt-1">
              {isAll ? "All" : meta.en}
            </span>
          </button>
        );
      })}
    </div>
  );
};

/* ---------------- Single category section (header + horizontal row) ---------------- */
const CategorySection = ({
  cat,
  items,
  onOpen,
  onViewAll,
}: {
  cat: string;
  items: Product[];
  onOpen: (p: Product) => void;
  onViewAll: (cat: string) => void;
}) => {
  const meta = CATEGORY_META[cat] || { hi: cat, en: cat, emoji: "🧶", tagline: "", gradient: "from-primary/15 to-primary/5" };
  if (!items.length) return null;
  return (
    <section
      id={`cat-${cat}`}
      className="scroll-mt-24 border-t border-primary/10 py-7 md:py-10"
    >
      <div className="mx-auto max-w-6xl px-3 md:px-4">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-2xl md:h-14 md:w-14 md:text-3xl ${meta.gradient}`}
            >
              {meta.emoji}
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground md:text-3xl leading-tight">
                {meta.hi} <span className="text-primary">·</span>{" "}
                <span className="text-foreground/70">{meta.en}</span>
              </h2>
              <p className="font-deva text-[11px] text-muted-foreground md:text-xs">
                {meta.tagline} · {items.length} items
              </p>
            </div>
          </div>
          <button
            onClick={() => onViewAll(cat)}
            className="hidden shrink-0 rounded-full border border-primary/30 bg-card px-4 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground md:inline-flex"
          >
            View All →
          </button>
        </div>

        <HScroller>
          {items.map((p) => (
            <MiniCard key={String(p.id)} p={p} onOpen={onOpen} />
          ))}
        </HScroller>

        <div className="mt-3 flex justify-center md:hidden">
          <button
            onClick={() => onViewAll(cat)}
            className="rounded-full border border-primary/30 bg-card px-5 py-2 text-xs font-semibold text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground"
          >
            View All {meta.en} →
          </button>
        </div>
      </div>
    </section>
  );
};

/* ---------------- Filtered grid view (when search active or "View All") ---------------- */
const FilteredGrid = ({
  items,
  onOpen,
  query,
  cat,
  onClear,
}: {
  items: Product[];
  onOpen: (p: Product) => void;
  query: string;
  cat: string;
  onClear: () => void;
}) => (
  <div className="mx-auto max-w-6xl px-3 md:px-4 py-6">
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="font-display text-lg font-bold text-foreground md:text-2xl">
        {query
          ? `Search: "${query}"`
          : cat !== "All"
          ? `${CATEGORY_META[cat]?.hi || cat} · ${CATEGORY_META[cat]?.en || cat}`
          : "All Products"}
        <span className="ml-2 text-sm font-normal text-muted-foreground">({items.length})</span>
      </h3>
      <button
        onClick={onClear}
        className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary"
      >
        <X size={14} /> Clear
      </button>
    </div>
    {items.length === 0 ? (
      <div className="rounded-2xl border border-primary/15 bg-card p-10 text-center">
        <div className="text-3xl">🧵</div>
        <p className="font-deva mt-3 text-sm text-muted-foreground">
          कोई कपड़ा नहीं मिला।
        </p>
      </div>
    ) : (
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-4">
        {items.map((p) => (
          <MiniCard key={String(p.id)} p={p} onOpen={onOpen} />
        ))}
      </div>
    )}
  </div>
);

/* ---------------- Main exported component ---------------- */
export const CategoryShowcase = () => {
  const { products, loading } = useProducts();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [openProduct, setOpenProduct] = useState<Product | null>(null);
  const [viewAll, setViewAll] = useState<string | null>(null); // category name when "View All" pressed

  // Group by category, preserving CATEGORIES order
  const grouped = useMemo(() => {
    const map: Record<string, Product[]> = {};
    for (const p of products) {
      const c = p.category || "Other";
      (map[c] ||= []).push(p);
    }
    return map;
  }, [products]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const k of Object.keys(grouped)) c[k] = grouped[k].length;
    return c;
  }, [grouped]);

  const orderedCats = useMemo(
    () => CATEGORIES.filter((c) => c !== "All" && (grouped[c]?.length || 0) > 0),
    [grouped]
  );

  // Filtered list (used when searching or "View All" pressed)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const targetCat = viewAll || (cat !== "All" ? cat : null);
      if (targetCat && p.category !== targetCat) return false;
      if (!q) return true;
      return [p.name, p.nameEn, p.variety, p.info, p.category]
        .filter(Boolean)
        .some((s) => (s as string).toLowerCase().includes(q));
    });
  }, [products, query, cat, viewAll]);

  const showFiltered = !!query.trim() || !!viewAll;

  // Reset viewAll when user changes pill back to All
  useEffect(() => {
    if (cat === "All") setViewAll(null);
  }, [cat]);

  return (
    <section id="products" className="border-b border-primary/15 py-8 md:py-12">
      <div className="mx-auto max-w-6xl px-3 md:px-4">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground md:text-4xl">
              Shop by Category
            </h2>
            <p className="font-deva mt-1 text-xs text-muted-foreground md:text-sm">
              श्रेणी अनुसार खरीदें — Surat से सीधा wholesale rate
            </p>
          </div>
          <span className="hidden text-xs text-muted-foreground md:block">
            {products.length} items · {orderedCats.length} categories
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="कपड़ा खोजें... (Cotton, Silk, Rayon)"
            className="font-deva h-12 w-full rounded-full border border-primary/20 bg-card pl-11 pr-10 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-primary"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category icon strip */}
        <CategoryStrip active={viewAll || cat} onSelect={setCat} counts={counts} />
      </div>

      {/* Loading skeleton */}
      {loading && products.length === 0 ? (
        <div className="mx-auto mt-4 max-w-6xl px-3 md:px-4">
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-2xl border border-primary/10 bg-card"
              />
            ))}
          </div>
        </div>
      ) : showFiltered ? (
        <FilteredGrid
          items={filtered}
          onOpen={setOpenProduct}
          query={query}
          cat={viewAll || cat}
          onClear={() => {
            setQuery("");
            setViewAll(null);
            setCat("All");
          }}
        />
      ) : (
        <div className="mt-2">
          {orderedCats.map((c) => (
            <CategorySection
              key={c}
              cat={c}
              items={grouped[c] || []}
              onOpen={setOpenProduct}
              onViewAll={(cc) => {
                setViewAll(cc);
                setCat(cc);
                window.scrollTo({ top: document.getElementById("products")?.offsetTop || 0, behavior: "smooth" });
              }}
            />
          ))}
        </div>
      )}

      <ProductLightbox product={openProduct} onClose={() => setOpenProduct(null)} />
    </section>
  );
};
