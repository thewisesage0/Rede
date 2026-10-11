import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  FileText,
  Sparkles,
  TrendingUp,
  Crown,
  Hourglass,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { AE_NAME } from "@/lib/site-config";
import { KyefBunny } from "@/components/site/KyefBunny";
import { PolaroidSlot } from "@/components/site/JkStickers";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

type Stat = { label: string; value: string | number; icon: any };

// recharts is a sizeable library and only the AE ever sees these charts, so
// the chart section itself (src/routes/_authenticated/DashboardCharts.tsx)
// is a separate chunk that only loads when isAdmin is true — see <Suspense>
// below. Authors downloading their own dashboard never fetch it.
const DashboardCharts = lazy(() => import("./DashboardCharts"));

const CHEERS = [
  "Every signed author is a tiny golden moment ✨",
  "Borahae! That means “I purple you” 💜",
  "One more contract, one more happy dance 🕺",
  "Hwaiting! You're doing amazing 💪",
  "Sparkle first, paperwork second ⭐",
];

function AeHero({ pending }: { pending: number | null }) {
  const [greeting, setGreeting] = useState("Annyeong");
  const [cheer, setCheer] = useState(CHEERS[0]);
  const [hearts, setHearts] = useState<{ id: number; dx: number; emoji: string }[]>([]);

  // Time-of-day greeting + daily cheer are picked after mount so SSR and the
  // client always render the same markup first.
  useEffect(() => {
    const now = new Date();
    const h = now.getHours();
    setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
    const day = Math.floor(now.getTime() / 86_400_000);
    setCheer(CHEERS[day % CHEERS.length]);
  }, []);

  const burst = () => {
    const base = Date.now();
    const emojis = ["💜", "💗", "✨", "⭐", "💜", "🐰"];
    const batch = emojis.map((emoji, i) => ({
      id: base + i,
      dx: (i - 2.5) * 22 + Math.round(Math.random() * 10 - 5),
      emoji,
    }));
    setHearts((prev) => [...prev, ...batch]);
    setTimeout(() => setHearts((prev) => prev.filter((x) => !batch.some((b) => b.id === x.id))), 1400);
    toast.success(`Borahae, ${AE_NAME}! 💜`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="jk-hero glass rounded-[2rem] p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6"
    >
      <div className="relative shrink-0">
        <KyefBunny size={132} onClick={burst} className="jk-hop" />
        {hearts.map((h) => (
          <span key={h.id} className="jk-heart" style={{ ["--dx" as any]: `${h.dx}px` }} aria-hidden="true">
            {h.emoji}
          </span>
        ))}
        <div className="absolute -bottom-3 -right-4 hidden sm:block">
          <PolaroidSlot size="sm" rotate={9} seed={0} caption="OOTD" />
        </div>
      </div>

      <div className="text-center sm:text-left">
        <span className="jk-sticker">Jungkook-approved desk 💜</span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-3">
          {greeting}, <span className="rose-text">{AE_NAME}!</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          {pending === null
            ? "Fetching your desk…"
            : pending === 0
              ? "Your desk is all caught up. Time for a snack break! 🍓"
              : `${pending} manuscript${pending === 1 ? " is" : "s are"} waiting for you today.`}
        </p>
        <p className="mt-3 text-sm font-semibold text-primary">{cheer}</p>
        <p className="mt-1 text-xs text-muted-foreground">Psst… tap the bunny!</p>
      </div>
    </motion.div>
  );
}

function DashboardPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stat[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [earningsSeries, setEarningsSeries] = useState<{ month: string; earnings: number }[]>([]);
  const [platformSeries, setPlatformSeries] = useState<{ name: string; contracts: number }[]>([]);
  const [genreSeries, setGenreSeries] = useState<{ name: string; value: number }[]>([]);
  const [contractMix, setContractMix] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    if (!user || authLoading) return;
    (async () => {
      if (isAdmin) {
        const [{ data: subs }, { count: plats }, { data: contracts }] = await Promise.all([
          supabase.from("submissions").select("*, platforms(name)").order("created_at", { ascending: false }),
          supabase.from("platforms").select("*", { count: "exact", head: true }).eq("archived", false),
          supabase.from("contracts").select("ae_earning, final_contract_type, signed_at, submission_id"),
        ]);

        const subsList = subs ?? [];
        const conList = contracts ?? [];
        const earnings = conList.reduce((s, c: any) => s + Number(c.ae_earning ?? 0), 0);
        const pending = subsList.filter((s: any) =>
          ["pending", "under_review", "contacted", "forwarded"].includes(s.status),
        ).length;
        const exclusive = conList.filter((c: any) => c.final_contract_type === "exclusive").length;
        const nonexclusive = conList.filter((c: any) => c.final_contract_type === "non-exclusive").length;

        setStats([
          { label: "Submissions", value: subsList.length, icon: FileText },
          { label: "Exclusive Contracts", value: exclusive, icon: Crown },
          { label: "Non-Exclusive", value: nonexclusive, icon: Sparkles },
          { label: "Pending Onboarding", value: pending, icon: Hourglass },
          { label: "Active Platforms", value: plats ?? 0, icon: BookOpen },
          { label: "AE Earnings (USD)", value: `$${earnings.toLocaleString()}`, icon: TrendingUp },
        ]);

        // Monthly earnings (last 6 months)
        const months: Record<string, number> = {};
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const k = d.toLocaleString("en", { month: "short" });
          months[k] = 0;
        }
        conList.forEach((c: any) => {
          if (!c.signed_at) return;
          const d = new Date(c.signed_at);
          const k = d.toLocaleString("en", { month: "short" });
          if (k in months) months[k] += Number(c.ae_earning ?? 0);
        });
        setEarningsSeries(Object.entries(months).map(([month, earnings]) => ({ month, earnings })));

        // Contracts by platform
        const platMap: Record<string, number> = {};
        subsList.forEach((s: any) => {
          if (String(s.status).includes("signed") && s.platforms?.name) {
            platMap[s.platforms.name] = (platMap[s.platforms.name] || 0) + 1;
          }
        });
        setPlatformSeries(
          Object.entries(platMap)
            .map(([name, contracts]) => ({ name, contracts }))
            .sort((a, b) => b.contracts - a.contracts)
            .slice(0, 6),
        );

        // Genre popularity
        const genreMap: Record<string, number> = {};
        subsList.forEach((s: any) => {
          if (s.genre) genreMap[s.genre] = (genreMap[s.genre] || 0) + 1;
        });
        setGenreSeries(
          Object.entries(genreMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5),
        );

        setContractMix([
          { name: "Exclusive", value: exclusive },
          { name: "Non-Exclusive", value: nonexclusive },
        ]);
        setRecent(subsList.slice(0, 8));
      } else {
        const { data: subs } = await supabase
          .from("submissions")
          .select("*, platforms(name)")
          .eq("email", user.email!)
          .order("created_at", { ascending: false });
        setStats([
          { label: "Your Submissions", value: subs?.length ?? 0, icon: FileText },
          { label: "In Review", value: subs?.filter((s) => s.status === "pending").length ?? 0, icon: Sparkles },
          { label: "Signed", value: subs?.filter((s) => String(s.status).includes("signed")).length ?? 0, icon: TrendingUp },
        ]);
        setRecent(subs ?? []);
      }
    })();
  }, [user, isAdmin, authLoading]);

  return (
    <div className="max-w-7xl mx-auto">
      {authLoading ? null : isAdmin ? (
        <AeHero
          pending={
            stats.length ? Number(stats.find((x) => x.label === "Pending Onboarding")?.value ?? 0) : null
          }
        />
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Author Portal</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2">
            Welcome back, <span className="rose-text">{user?.email?.split("@")[0]}</span>
          </h1>
          <p className="text-muted-foreground mt-2">Your manuscripts and contract status.</p>
        </motion.div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3 }}
              className={`glass rounded-2xl p-6 ${isAdmin ? `jk-tint-${i % 6}` : ""}`}
            >
              <div className="w-10 h-10 grid place-items-center rounded-xl bg-accent">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div className="mt-5 text-3xl font-extrabold">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-2 uppercase tracking-widest">
                {s.label}
              </div>
            </motion.div>
          );
        })}
      </div>

      {isAdmin && (
        <Suspense
          fallback={
            <div className="mt-10 glass rounded-2xl p-16 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          }
        >
          <DashboardCharts
            earningsSeries={earningsSeries}
            contractMix={contractMix}
            platformSeries={platformSeries}
            genreSeries={genreSeries}
          />
        </Suspense>
      )}

      {/* Recent submissions */}
      <div className="mt-10 glass rounded-2xl p-6 md:p-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-bold">Recent submissions</h2>
          <span className="text-xs text-muted-foreground">{recent.length} total</span>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground border-b border-border">
                <th className="py-3 pr-4">Novel</th>
                <th className="py-3 pr-4">Author</th>
                <th className="py-3 pr-4">Platform</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r.id} className="border-b border-border/60 hover:bg-secondary/50">
                  <td className="py-3 pr-4 font-medium">{r.novel_title}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{r.pen_name || r.author_name}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{r.platforms?.name ?? "—"}</td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-accent text-primary">
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-muted-foreground">
                    No submissions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
