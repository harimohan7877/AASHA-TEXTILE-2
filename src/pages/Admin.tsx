import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Plus, Youtube, LogOut, Upload, Star } from "lucide-react";

type Product = {
  id: string;
  name: string;
  name_en: string | null;
  variety: string | null;
  rate: string | null;
  cut: string | null;
  panna: string | null;
  info: string | null;
  image_url: string | null;
  category: string;
  stock_status: string;
  is_featured: boolean;
  sort_order: number;
};

type Video = {
  id: string;
  video_id: string;
  title: string;
  thumbnail_url: string | null;
};

const CATEGORIES = ["Cotton", "Silk", "Rayon", "Satin", "Readymade", "Curtain", "Other"];
const STOCK = ["available", "limited", "out"];

const emptyProduct = {
  name: "",
  name_en: "",
  variety: "",
  rate: "",
  cut: "Standard",
  panna: "",
  info: "",
  image_url: "",
  category: "Rayon",
  stock_status: "available",
  is_featured: false,
};

const AdminPage = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [form, setForm] = useState({ ...emptyProduct });
  const [uploading, setUploading] = useState(false);
  const [ytUrl, setYtUrl] = useState("");
  const [ytLoading, setYtLoading] = useState(false);
  const [tab, setTab] = useState<"products" | "videos">("products");

  const checkAuth = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      navigate("/auth");
      return;
    }
    setUserId(data.session.user.id);
    setUserEmail(data.session.user.email || "");
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.session.user.id);
    setIsAdmin(!!roles?.some((r) => r.role === "admin"));
  }, [navigate]);

  useEffect(() => {
    checkAuth();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/auth");
    });
    return () => sub.subscription.unsubscribe();
  }, [checkAuth, navigate]);

  const loadData = useCallback(async () => {
    const [p, v] = await Promise.all([
      supabase.from("products").select("*").order("sort_order", { ascending: false }).order("created_at", { ascending: false }),
      supabase.from("videos").select("*").order("sort_order", { ascending: false }),
    ]);
    if (p.data) setProducts(p.data as Product[]);
    if (v.data) setVideos(v.data as Video[]);
  }, []);

  useEffect(() => {
    if (isAdmin) loadData();
  }, [isAdmin, loadData]);

  const handleUpload = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      return data.publicUrl;
    } catch (e: any) {
      toast.error("Upload fail: " + e.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = await handleUpload(f);
    if (url) setForm((p) => ({ ...p, image_url: url }));
  };

  const addProduct = async () => {
    if (!form.name) return toast.error("Name जरूरी है");
    const { error } = await supabase.from("products").insert([form]);
    if (error) return toast.error(error.message);
    toast.success("Product जोड़ दिया");
    setForm({ ...emptyProduct });
    loadData();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete करें?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Delete हो गया");
    loadData();
  };

  const toggleFeatured = async (p: Product) => {
    await supabase.from("products").update({ is_featured: !p.is_featured }).eq("id", p.id);
    loadData();
  };

  const updateStock = async (p: Product, stock: string) => {
    await supabase.from("products").update({ stock_status: stock }).eq("id", p.id);
    loadData();
  };

  const addVideo = async () => {
    if (!ytUrl) return;
    setYtLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("youtube-meta", {
        body: { url: ytUrl },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const { error: insErr } = await supabase.from("videos").insert([
        {
          video_id: data.video_id,
          title: data.title,
          thumbnail_url: data.thumbnail_url,
        },
      ]);
      if (insErr) throw insErr;
      toast.success("Video जोड़ दिया");
      setYtUrl("");
      loadData();
    } catch (e: any) {
      toast.error(e.message || "Fail");
    } finally {
      setYtLoading(false);
    }
  };

  const deleteVideo = async (id: string) => {
    if (!confirm("Delete video?")) return;
    await supabase.from("videos").delete().eq("id", id);
    loadData();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (isAdmin === null) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="max-w-md rounded-2xl border border-primary/20 bg-card p-6 text-center">
          <h1 className="font-display text-xl font-bold text-foreground">Admin access नहीं है</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            आपका account <b>{userEmail}</b> है। यह पहला admin बनने के लिए, नीचे दिए गए निर्देश follow करें:
          </p>
          <div className="mt-4 rounded-lg bg-background p-3 text-left text-xs text-muted-foreground">
            <div className="font-semibold text-foreground mb-1">User ID:</div>
            <code className="break-all text-[10px]">{userId}</code>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            यह User ID copy करके मुझे (Lovable chat में) भेजो — मैं admin role grant कर दूंगा।
          </p>
          <button onClick={logout} className="mt-4 text-xs text-primary hover:underline">
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-primary/15 bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-3 md:p-4">
          <h1 className="font-display text-lg font-bold text-foreground md:text-xl">
            Aasha Admin
          </h1>
          <div className="flex items-center gap-2">
            <a href="/" className="text-xs text-muted-foreground hover:text-primary">View site</a>
            <button onClick={logout} className="inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-card px-3 py-1.5 text-xs text-foreground hover:border-primary">
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl gap-2 px-3 pb-2 md:px-4">
          <button
            onClick={() => setTab("products")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold ${tab === "products" ? "bg-primary text-primary-foreground" : "border border-primary/20 text-foreground"}`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setTab("videos")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold ${tab === "videos" ? "bg-primary text-primary-foreground" : "border border-primary/20 text-foreground"}`}
          >
            Videos ({videos.length})
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-3 md:p-6">
        {tab === "products" ? (
          <>
            {/* Add form */}
            <div className="rounded-2xl border border-primary/20 bg-card p-4">
              <h2 className="font-display text-base font-bold text-foreground">नया Product जोड़ें</h2>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <input placeholder="Name (Hindi)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-10 rounded-lg border border-primary/15 bg-background px-3 text-sm" />
                <input placeholder="Name (English)" value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} className="h-10 rounded-lg border border-primary/15 bg-background px-3 text-sm" />
                <input placeholder="Variety (e.g. Printed)" value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} className="h-10 rounded-lg border border-primary/15 bg-background px-3 text-sm" />
                <input placeholder="Rate (e.g. ₹350/KG)" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} className="h-10 rounded-lg border border-primary/15 bg-background px-3 text-sm" />
                <input placeholder='Panna (e.g. 60")' value={form.panna} onChange={(e) => setForm({ ...form, panna: e.target.value })} className="h-10 rounded-lg border border-primary/15 bg-background px-3 text-sm" />
                <input placeholder="Cut" value={form.cut} onChange={(e) => setForm({ ...form, cut: e.target.value })} className="h-10 rounded-lg border border-primary/15 bg-background px-3 text-sm" />
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-10 rounded-lg border border-primary/15 bg-background px-3 text-sm">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <select value={form.stock_status} onChange={(e) => setForm({ ...form, stock_status: e.target.value })} className="h-10 rounded-lg border border-primary/15 bg-background px-3 text-sm">
                  {STOCK.map((c) => <option key={c}>{c}</option>)}
                </select>
                <textarea placeholder="Info / description" value={form.info} onChange={(e) => setForm({ ...form, info: e.target.value })} className="md:col-span-2 min-h-[60px] rounded-lg border border-primary/15 bg-background p-3 text-sm" />
                <div className="md:col-span-2 flex items-center gap-2">
                  <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-primary/20 bg-background px-3 text-xs font-semibold">
                    <Upload size={14} />
                    {uploading ? "Uploading..." : "Image Upload"}
                    <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                  </label>
                  {form.image_url && <img src={form.image_url} alt="" className="h-10 w-10 rounded object-cover" />}
                  <input placeholder="या URL paste करें" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="flex-1 h-10 rounded-lg border border-primary/15 bg-background px-3 text-sm" />
                </div>
                <label className="md:col-span-2 inline-flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
                  Featured (Fast Moving badge)
                </label>
              </div>
              <button onClick={addProduct} className="mt-3 inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:brightness-110">
                <Plus size={14} /> Add Product
              </button>
            </div>

            {/* Product list */}
            <div className="mt-4 grid gap-2">
              {products.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl border border-primary/15 bg-card p-2">
                  {p.image_url ? (
                    <img src={p.image_url} alt="" className="h-14 w-14 rounded-lg object-cover" />
                  ) : (
                    <div className="h-14 w-14 rounded-lg bg-muted grid place-items-center text-xl">🧵</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-sm truncate">{p.name}</div>
                      {p.is_featured && <Star size={12} className="fill-primary text-primary shrink-0" />}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{p.variety} • {p.rate} • {p.category}</div>
                  </div>
                  <select value={p.stock_status} onChange={(e) => updateStock(p, e.target.value)} className="h-8 rounded border border-primary/20 bg-background px-2 text-xs">
                    {STOCK.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <button onClick={() => toggleFeatured(p)} className="p-1.5 text-muted-foreground hover:text-primary" title="Featured toggle">
                    <Star size={14} className={p.is_featured ? "fill-primary text-primary" : ""} />
                  </button>
                  <button onClick={() => deleteProduct(p.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {products.length === 0 && (
                <div className="rounded-xl border border-primary/10 bg-card p-6 text-center text-sm text-muted-foreground">
                  कोई product नहीं है। ऊपर से add करें।
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="rounded-2xl border border-primary/20 bg-card p-4">
              <h2 className="font-display text-base font-bold text-foreground">YouTube Video जोड़ें</h2>
              <p className="mt-1 text-xs text-muted-foreground">URL paste करें — title और thumbnail auto fetch हो जाएंगे</p>
              <div className="mt-3 flex flex-col gap-2 md:flex-row">
                <input
                  placeholder="https://youtube.com/watch?v=..."
                  value={ytUrl}
                  onChange={(e) => setYtUrl(e.target.value)}
                  className="flex-1 h-11 rounded-lg border border-primary/15 bg-background px-3 text-sm"
                />
                <button
                  onClick={addVideo}
                  disabled={ytLoading || !ytUrl}
                  className="inline-flex h-11 items-center justify-center gap-1 rounded-lg bg-[#FF0000] px-4 text-sm font-bold text-white disabled:opacity-50"
                >
                  <Youtube size={14} /> {ytLoading ? "Fetching..." : "Add"}
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {videos.map((v) => (
                <div key={v.id} className="flex items-center gap-3 rounded-xl border border-primary/15 bg-card p-2">
                  {v.thumbnail_url && <img src={v.thumbnail_url} alt="" className="h-14 w-24 rounded object-cover" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold line-clamp-2">{v.title}</div>
                    <div className="text-[10px] text-muted-foreground">ID: {v.video_id}</div>
                  </div>
                  <button onClick={() => deleteVideo(v.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {videos.length === 0 && (
                <div className="md:col-span-2 rounded-xl border border-primary/10 bg-card p-6 text-center text-sm text-muted-foreground">
                  कोई video नहीं है।
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
