import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CATEGORIES, useProducts, waOrderLink, type Product } from "@/lib/aashaData";

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

const StockBadge = ({ status }: { status: Product["stock_status"] }) => {
  if (status === "out")
    return (
      <span className="font-deva pill absolute left-2 top-2 bg-destructive text-destructive-foreground shadow-card">
        खत्म
      </span>
    );
  if (status === "limited")
    return (
      <span className="font-deva pill absolute left-2 top-2 bg-saffron text-primary-foreground shadow-card">
        Limited
      </span>
    );
  return (
    <span className="pill absolute left-2 top-2 gradient-gold text-[10px] font-bold uppercase text-primary-foreground shadow-card">
      New
    </span>
  );
};

const ProductCard = ({ p }: { p: Product }) => {
  const out = p.stock_status === "out";
  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-primary/15 bg-card transition-all hover:border-primary/40 hover:shadow-gold ${
        out ? "opacity-60" : ""
      }`}
    >
      <div className="relative aspect-square overflow-hidden bg-background">
        {p.image ? (
          <img
            src={p.image}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <FabricPlaceholder />
        )}
        <StockBadge status={p.stock_status} />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {p.variety && (
          <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">
            {p.variety}
          </div>
        )}
        <h3 className="font-display text-[0.95rem] font-semibold leading-tight text-foreground line-clamp-2">
          {p.name}
        </h3>

        <div className="mt-0.5 flex flex-wrap gap-1">
          {p.panna && (
            <span className="pill border border-primary/20 bg-background/50 text-[10px] text-muted-foreground">
              {p.panna}
            </span>
          )}
          {p.cut && (
            <span className="pill border border-primary/20 bg-background/50 text-[10px] text-muted-foreground">
              {p.cut}
            </span>
          )}
        </div>

        {p.info && (
          <p className="font-deva text-[11px] leading-snug text-muted-foreground line-clamp-2">
            {p.info}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2.5">
          <div className="font-display text-base font-bold text-primary">
            {p.rate || "—"}
          </div>
          {out ? (
            <span className="font-deva inline-flex h-9 items-center rounded-full bg-muted px-3 text-[11px] font-medium text-muted-foreground">
              उपलब्ध नहीं
            </span>
          ) : (
            <a
              href={waOrderLink(p.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1 rounded-full bg-whatsapp px-3 text-[11px] font-bold text-whatsapp-foreground transition-transform active:scale-95"
            >
              <span aria-hidden>📲</span> Order
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
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-4">
            {filtered.map((p) => (
              <ProductCard key={String(p.id)} p={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
