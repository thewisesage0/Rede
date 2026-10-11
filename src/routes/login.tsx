import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ensureAEUser } from "@/lib/ae-seed.functions";
import { AE_NAME } from "@/lib/site-config";
import { KyefBunny } from "@/components/site/KyefBunny";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "AE Sign In — Kyef" },
      { name: "description", content: "Private Acquisition Editor portal." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate({ to: "/dashboard" });
    });
    ensureAEUser().catch(() => {});
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Welcome back.");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-20 bg-background">
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-accent blur-3xl -z-10" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 rounded-full bg-[oklch(0.90_0.10_20/0.20)] blur-3xl -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md glass rounded-[32px] p-10"
      >
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <KyefBunny size={40} />
          <span className="text-xl font-bold tracking-tight">Kyef</span>
        </Link>

        <div className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-primary">
          <Lock className="w-3 h-3" /> Private AE portal
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-center mt-3">Welcome back</h1>
        <p className="text-center text-sm text-muted-foreground mt-2">
          {AE_NAME}'s private portal · Acquisition Editor access only.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl bg-secondary border border-transparent px-4 py-3 outline-none focus:border-primary/40 focus:bg-white transition-colors"
              placeholder="ae@kyef.co"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl bg-secondary border border-transparent px-4 py-3 outline-none focus:border-primary/40 focus:bg-white transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2 py-3.5 disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Author? <Link to="/submit" className="text-primary font-medium hover:underline">Submit your manuscript →</Link>
        </p>
      </motion.div>
    </div>
  );
}
