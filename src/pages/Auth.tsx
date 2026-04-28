import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AuthPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/admin");
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Account बन गया! अब login करें।");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Login हो गया");
        navigate("/admin");
      }
    } catch (err: any) {
      toast.error(err.message || "कुछ गड़बड़ हुई");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-2xl border border-primary/20 bg-card p-6 md:p-8 shadow-gold">
        <h1 className="font-display text-2xl font-bold text-foreground text-center">
          Admin {mode === "login" ? "Login" : "Signup"}
        </h1>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          Aasha Textile — Management Panel
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 w-full rounded-lg border border-primary/20 bg-background px-4 text-sm text-foreground outline-none focus:border-primary"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password (min 6)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 w-full rounded-lg border border-primary/20 bg-background px-4 text-sm text-foreground outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-card transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "..." : mode === "login" ? "Login" : "Create Account"}
          </button>
        </form>
        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-4 w-full text-xs text-muted-foreground hover:text-primary"
        >
          {mode === "login" ? "नया account बनाएं" : "पहले से account है? Login"}
        </button>
        <a href="/" className="mt-3 block text-center text-xs text-muted-foreground hover:text-primary">
          ← Home पर वापस
        </a>
      </div>
    </div>
  );
};

export default AuthPage;
