// Data layer for Aasha Textile.
// Pulls from Google Sheet CSV + window.DIRECT_SITE_UPDATES.
// IMPORTANT: same data semantics as original app.js — do not change.

import { useEffect, useState } from "react";

export const SHEET_ID = "1pgfaOmB_ViznJNkWn3eJa_YXNE5H3r8n_ue6mngChSc";
export const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;
export const WHATSAPP_NUMBER = "917043830602";

export type StockStatus = "available" | "limited" | "out";

export interface Product {
  id: string | number;
  date?: string;
  name: string;
  nameEn?: string;
  variety?: string;
  rate?: string;
  cut?: string;
  panna?: string;
  info?: string;
  image?: string;
  category: string;
  stock_status: StockStatus;
  is_featured?: boolean;
}

export const CATEGORIES = ["All", "Cotton", "Silk", "Rayon", "Satin", "Readymade", "Curtain", "Other"] as const;
export type Category = (typeof CATEGORIES)[number];

export function inferCategory(name = "", variety = ""): string {
  const t = `${name} ${variety}`.toLowerCase();
  if (/cotton|कॉटन|cambric|कैमरिक|चिकन|lining|अस्तर/.test(t)) return "Cotton";
  if (/silk|सिल्क|georgette|जोर्जेट|chiffon|शिफॉन/.test(t)) return "Silk";
  if (/rayon|रेयॉन/.test(t)) return "Rayon";
  if (/satin|साटन|जापान/.test(t)) return "Satin";
  if (/kurti|कुर्ती|readymade|रेडीमेड|विस्कोस/.test(t)) return "Readymade";
  if (/curtain|पर्दा|बेडशीट/.test(t)) return "Curtain";
  return "Other";
}

function parseCsv(csv: string): Record<string, string>[] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let val = "";
  let inQ = false;
  for (let i = 0; i < csv.length; i++) {
    const c = csv[i];
    if (inQ) {
      if (c === '"' && csv[i + 1] === '"') { val += '"'; i++; }
      else if (c === '"') inQ = false;
      else val += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ",") { cur.push(val); val = ""; }
      else if (c === "\n") { cur.push(val); rows.push(cur); cur = []; val = ""; }
      else if (c === "\r") { /* skip */ }
      else val += c;
    }
  }
  if (val.length || cur.length) { cur.push(val); rows.push(cur); }
  if (!rows.length) return [];
  const header = rows[0].map(h => h.trim().toLowerCase());
  return rows.slice(1).filter(r => r.some(v => v && v.trim())).map(r => {
    const o: Record<string, string> = {};
    header.forEach((h, i) => { o[h] = (r[i] || "").trim(); });
    return o;
  });
}

function normalizeStock(s?: string): StockStatus {
  const v = (s || "").toLowerCase().trim();
  if (/out|खत्म|nahi|nahin|stop|0/.test(v)) return "out";
  if (/limit|कम|low/.test(v)) return "limited";
  return "available";
}

function rowToProduct(r: Record<string, string>, idx: number): Product | null {
  const name = r.name || r["product"] || r["कपड़ा"] || r["item"] || "";
  if (!name) return null;
  const variety = r.variety || r["प्रकार"] || "";
  return {
    id: r.id || `sheet-${idx}`,
    date: r.date || r["तारीख"] || "",
    name,
    nameEn: r.nameen || r["name_en"] || "",
    variety,
    rate: r.rate || r["भाव"] || r.price || "",
    cut: r.cut || r["कट"] || "",
    panna: r.panna || r["पन्ना"] || r.width || "",
    info: r.info || r["जानकारी"] || r.note || "",
    image: r.image || r.img || r.photo || "",
    category: inferCategory(name, variety),
    stock_status: normalizeStock(r.stock_status || r.status || r["स्टॉक"]),
    is_featured: /yes|true|1|featured/i.test(r.is_featured || r.featured || ""),
  };
}

interface DirectProduct extends Partial<Product> {
  name: string;
  category?: string;
}
interface DirectUpdates {
  youtubeChannelUrl?: string;
  products?: DirectProduct[];
  youtube?: string[];
}

declare global {
  interface Window { DIRECT_SITE_UPDATES?: DirectUpdates; }
}

function getDirectProducts(): Product[] {
  const d = (typeof window !== "undefined" ? window.DIRECT_SITE_UPDATES : undefined) || {};
  return (d.products || []).map((p, i) => ({
    id: p.id ?? `direct-${i}`,
    date: p.date,
    name: p.name,
    nameEn: p.nameEn,
    variety: p.variety,
    rate: p.rate,
    cut: p.cut,
    panna: p.panna,
    info: p.info,
    image: p.image,
    category: p.category || inferCategory(p.name, p.variety),
    stock_status: (p.stock_status as StockStatus) || "available",
    is_featured: !!p.is_featured,
  }));
}

function dedupe(items: Product[]): Product[] {
  const seen = new Set<string>();
  const out: Product[] = [];
  for (const p of items) {
    const key = `${(p.name || "").toLowerCase().trim()}|${p.date || ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(getDirectProducts());
  const [loading, setLoading] = useState(true);
  const [sheetError, setSheetError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // 1) Try Cloud DB first (admin-managed)
        const { supabase } = await import("@/integrations/supabase/client");
        const { data: cloudRows, error: cloudErr } = await supabase
          .from("products")
          .select("*")
          .order("sort_order", { ascending: false })
          .order("created_at", { ascending: false });

        if (!cloudErr && cloudRows && cloudRows.length > 0 && active) {
          const mapped: Product[] = cloudRows.map((r) => ({
            id: r.id,
            name: r.name,
            nameEn: r.name_en || undefined,
            variety: r.variety || undefined,
            rate: r.rate || undefined,
            cut: r.cut || undefined,
            panna: r.panna || undefined,
            info: r.info || undefined,
            image: r.image_url || undefined,
            category: r.category || inferCategory(r.name, r.variety || ""),
            stock_status: (r.stock_status as StockStatus) || "available",
            is_featured: !!r.is_featured,
            date: r.created_at,
          }));
          setProducts(mapped);
          setLoading(false);
          return;
        }

        // 2) Fallback: Google Sheet
        const res = await fetch(SHEET_CSV_URL, { cache: "no-store" });
        if (!res.ok) throw new Error(`Sheet HTTP ${res.status}`);
        const csv = await res.text();
        const rows = parseCsv(csv);
        const sheetItems = rows.map(rowToProduct).filter(Boolean) as Product[];
        if (!active) return;
        const merged = dedupe([...sheetItems, ...getDirectProducts()]);
        setProducts(merged.length ? merged : getDirectProducts());
      } catch (err) {
        if (!active) return;
        setSheetError(err instanceof Error ? err.message : String(err));
        setProducts(getDirectProducts());
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return { products, loading, sheetError };
}

export function waLink(message?: string) {
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${WHATSAPP_NUMBER}${text}`;
}

export function waOrderLink(productName: string) {
  return waLink(`नमस्ते, मुझे ${productName} के बारे में जानकारी चाहिए`);
}
