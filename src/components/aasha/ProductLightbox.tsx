import { useEffect } from "react";
import { X } from "lucide-react";
import { waOrderLink, type Product } from "@/lib/aashaData";

interface Props {
  product: Product | null;
  onClose: () => void;
}

export const ProductLightbox = ({ product, onClose }: Props) => {
  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [product, onClose]);

  if (!product) return null;
  const out = product.stock_status === "out";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-card/90 text-foreground shadow-card hover:bg-card"
        aria-label="Close"
      >
        <X size={20} />
      </button>

      <div
        className="relative flex w-full max-w-5xl max-h-[92vh] flex-col overflow-hidden rounded-2xl border border-primary/20 bg-card md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image side */}
        <div className="relative flex-1 bg-background min-h-[45vh] md:min-h-[60vh] md:max-w-[60%]">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl">🧵</div>
          )}
        </div>

        {/* Details side */}
        <div className="flex flex-col gap-3 overflow-y-auto p-5 md:w-[40%] md:p-6">
          {product.variety && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              {product.variety}
            </span>
          )}
          <h3 className="font-display text-2xl font-bold leading-tight text-foreground md:text-3xl">
            {product.name}
          </h3>
          {product.nameEn && product.nameEn !== product.name && (
            <p className="-mt-2 text-sm text-muted-foreground">{product.nameEn}</p>
          )}

          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-primary">
              {product.rate || "—"}
            </span>
            <span className="text-xs text-muted-foreground">+ GST</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-primary/15 bg-background/40 p-2.5">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Panna</div>
              <div className="text-sm font-semibold text-foreground">{product.panna || "—"}</div>
            </div>
            <div className="rounded-lg border border-primary/15 bg-background/40 p-2.5">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Cut</div>
              <div className="text-sm font-semibold text-foreground">{product.cut || "Standard"}</div>
            </div>
            <div className="rounded-lg border border-primary/15 bg-background/40 p-2.5">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Category</div>
              <div className="text-sm font-semibold text-foreground">{product.category}</div>
            </div>
            <div className="rounded-lg border border-primary/15 bg-background/40 p-2.5">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Stock</div>
              <div className="text-sm font-semibold text-foreground capitalize">
                {product.stock_status === "out" ? "खत्म" : product.stock_status === "limited" ? "Limited" : "Available"}
              </div>
            </div>
          </div>

          {product.info && (
            <p className="font-deva text-sm leading-relaxed text-muted-foreground">{product.info}</p>
          )}

          <div className="mt-auto space-y-2 pt-3">
            {out ? (
              <div className="font-deva flex h-12 w-full items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                उपलब्ध नहीं
              </div>
            ) : (
              <a
                href={waOrderLink(product.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-whatsapp text-sm font-bold text-whatsapp-foreground shadow-card transition-transform active:scale-95 hover:brightness-110"
              >
                📲 WhatsApp पर Order करें
              </a>
            )}
            <p className="text-center text-[10.5px] text-muted-foreground">
              Bulk rate पर discount available
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
