import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, BookOpen } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { AE_NAME } from "@/lib/site-config";
import { PolaroidSlot, JkStar } from "@/components/site/JkStickers";

export const Route = createFileRoute("/platforms/")({
  head: () => ({
    meta: [
      { title: "Publishing Platforms — Kyef" },
      { name: "description", content: "Browse the curated list of webnovel publishing platforms we partner with. Filter by genre, contract type, and more." },
    ],
  }),
  component: PlatformsPage,
});

type Platform = {
  id: string; name: string; slug: string; tagline: string | null; description: string | null; logo_url: string | null;
  genres: string[]; contract_types: string[]; min_word_count: number | null;
  signing_bonus_requirements: string | null;
};

function PlatformsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["platforms-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platforms").select("id,name,slug,tagline,description,logo_url,genres,contract_types,min_word_count,signing_bonus_requirements")
        .eq("archived", false).order("name");
      if (error) throw error;
      return (data ?? []) as Platform[];
    },
  });

  const [q, setQ] = useState("");
  const [genre, setGenre] = useState<string>("");
  const [contract, setContract] = useState<string>("");

  const allGenres = useMemo(() => Array.from(new Set((data ?? []).flatMap((p) => p.genres ?? []))).sort(), [data]);
  const allContracts = useMemo(() => Array.from(new Set((data ?? []).flatMap((p) => p.contract_types ?? []))).sort(), [data]);

  const filtered = useMemo(() => {
    return (data ?? []).filter((p) => {
      const matchQ = !q || `${p.name} ${p.tagline ?? ""} ${(p.genres ?? []).join(" ")}`.toLowerCase().includes(q.toLowerCase());
      const matchG = !genre || (p.genres ?? []).includes(genre);
      const matchC = !contract || (p.contract_types ?? []).includes(contract);
      return matchQ && matchG && matchC;
    });
  }, [data, q, genre, contract]);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-[1280px] px-4 md:px-8 py-20">
        <Reveal className="text-center max-w-2xl mx-auto relative">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-2">
            <PolaroidSlot size="sm" rotate={-9} seed={0} caption="platform hop" />
            <JkStar size={24} className="self-center" />
            <PolaroidSlot size="sm" rotate={7} seed={1} caption="bookshelf" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">The library</p>
          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">
            Publishing <span className="rose-text">platforms</span>
          </h1>
          <p className="mt-5 text-muted-foreground text-lg">
            Every platform we represent — curated, vetted, and ready for your manuscript.
          </p>
        </Reveal>

        {/* Search & filters */}
        <Reveal delay={0.1}>
          <div className="mt-12 glass rounded-3xl p-4 md:p-5 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Search platforms, genres, contracts…"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-secondary border border-transparent text-sm focus:outline-none focus:border-primary/40"
              />
            </div>
            <select value={genre} onChange={(e) => setGenre(e.target.value)} className="px-4 py-3 rounded-2xl bg-secondary border border-transparent text-sm">
              <option value="">All genres</option>
              {allGenres.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <select value={contract} onChange={(e) => setContract(e.target.value)} className="px-4 py-3 rounded-2xl bg-secondary border border-transparent text-sm">
              <option value="">All contracts</option>
              {allContracts.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </Reveal>

        {/* Grid */}
        <div className="mt-12">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass rounded-3xl p-6 h-64 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass rounded-3xl p-16 text-center">
              <BookOpen className="w-10 h-10 text-primary mx-auto" />
              <p className="mt-4 text-xl font-bold">No platforms yet</p>
              <p className="text-muted-foreground mt-2 text-sm">The acquisition desk is curating the next wave. Check back soon, or contact us directly.</p>
              <Link to="/contact" className="btn-primary mt-6 px-6 py-3 inline-flex">Contact {AE_NAME}</Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Link to="/platforms/$slug" params={{ slug: p.slug }} className="block group">
                    <div className="glass rounded-3xl p-7 h-full hover-lift">
                      <div className="flex items-center gap-3 mb-4">
                        {p.logo_url ? (
                          <img src={p.logo_url} alt={p.name} className="w-12 h-12 rounded-2xl object-cover" loading="lazy" decoding="async" width={48} height={48} />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-accent grid place-items-center text-lg font-bold text-primary">
                            {p.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-bold">{p.name}</h3>
                          {p.tagline && <p className="text-xs text-muted-foreground">{p.tagline}</p>}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{p.description ?? "A curated platform on the Kyef roster."}</p>
                      <div className="mt-5 flex flex-wrap gap-1.5">
                        {(p.genres ?? []).slice(0, 4).map((g) => <span key={g} className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary">{g}</span>)}
                      </div>
                      <div className="mt-5 pt-5 border-t border-border flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest">Signing bonus</p>
                          <p className="text-base font-bold text-foreground mt-0.5">
                            {p.signing_bonus_requirements ? "Available" : "On request"}
                          </p>
                        </div>
                        <span className="w-9 h-9 rounded-full bg-accent grid place-items-center group-hover:translate-x-0.5 transition-transform">
                          <ArrowRight className="w-4 h-4 text-primary" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
