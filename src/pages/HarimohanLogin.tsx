import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lock, User } from "lucide-react";

// Internal mapping: username -> Supabase email
const USERNAME_TO_EMAIL: Record<string, string> = {
  dev787799: "dev787799@aasha.local",
};

const HarimohanLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/harimohan", { replace: true });
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const email = USERNAME_TO_EMAIL[username.trim().toLowerCase()];
      if (!email) throw new Error("गलत Username या Password");
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error("गलत Username या Password");
      toast.success("Login सफल");
      navigate("/harimohan", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Login fail");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-2xl border border-primary/20 bg-card p-6 md:p-8 shadow-gold">
        <h1 className="font-display text-2xl font-bold text-foreground text-center">
          Aasha Admin Login
        </h1>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          Management Panel
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              required
              autoComplete="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-11 w-full rounded-lg border border-primary/20 bg-background pl-9 pr-4 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-lg border border-primary/20 bg-background pl-9 pr-4 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-card transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "..." : "Login"}
          </button>
        </form>
        <a href="/" className="mt-4 block text-center text-xs text-muted-foreground hover:text-primary">
          ← Home पर वापस
        </a>
      </div>
    </div>
  );
};

export default HarimohanLogin;
