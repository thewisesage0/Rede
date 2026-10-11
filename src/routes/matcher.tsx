import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowLeft, Sparkles, Trophy, RefreshCw } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { AE_NAME } from "@/lib/site-config";

export const Route = createFileRoute("/matcher")({
  head: () => ({ meta: [{ title: "AI Platform Matcher — Kyef" }, { name: "description", content: "Answer six questions and discover the platform that fits your manuscript best." }] }),
  component: MatcherPage,
});

type Platform = { id: string; name: string; slug: string; genres: string[]; contract_types: string[]; exclusive_bonus: number; nonexclusive_bonus: number; min_word_count: number | null; tagline: string | null };

const questions = [
  { key: "genre", label: "What genre fits your manuscript best?", options: ["Billionaire Romance", "Mafia", "Werewolf", "Fantasy", "Cultivation", "LitRPG", "Academy Fantasy", "Dark Romance"] },
  { key: "cadence", label: "What's your daily writing capacity?", options: ["<1000 words", "1000–2500 words", "2500–5000 words", "5000+ words"] },
  { key: "consistency", label: "How consistent are your updates?", options: ["Occasionally", "Weekly", "Multiple times a week", "Daily"] },
  { key: "goal", label: "What's your publishing goal?", options: ["Side income", "Replace day job", "Career author", "Build IP catalogue"] },
  { key: "contract", label: "Preferred contract type?", options: ["Exclusive", "Non-exclusive", "Either, depending on terms"] },
  { key: "experience", label: "Your experience level?", options: ["First novel", "Published before", "Multiple published works"] },
];

function MatcherPage() {
  const { data: platforms = [] } = useQuery({
    queryKey: ["platforms-matcher"],
    queryFn: async () => {
      const { data, error } = await supabase.from("platforms").select("id,name,slug,genres,contract_types,exclusive_bonus,nonexclusive_bonus,min_word_count,tagline").eq("archived", false);
      if (error) throw error;
      return (data ?? []) as Platform[];
    },
  });

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const pick = (val: string) => {
    const key = questions[step].key;
    const next = { ...answers, [key]: val };
    setAnswers(next);
    if (step < questions.length - 1) setStep(step + 1);
    else finalize(next);
  };

  const reset = () => { setAnswers({}); setStep(0); setDone(false); };

  const [result, setResult] = useState<{ platform: Platform | null; score: number; reason: string }>({ platform: null, score: 0, reason: "" });

  const finalize = async (a: Record<string, string>) => {
    let best: Platform | null = null;
    let bestScore = 0;
    let reason = "";
    for (const p of platforms) {
      let s = 50;
      if (p.genres?.includes(a.genre)) s += 25;
      if (a.contract === "Exclusive" && p.contract_types?.includes("exclusive")) s += 15;
      if (a.contract === "Non-exclusive" && p.contract_types?.includes("non-exclusive")) s += 15;
      if (a.contract === "Either, depending on terms") s += 8;
      if (a.cadence === "5000+ words" || a.cadence === "2500–5000 words") s += 6;
      if (a.consistency === "Daily" || a.consistency === "Multiple times a week") s += 6;
      if (a.goal === "Career author" || a.goal === "Replace day job") s += 4;
      if (s > bestScore) { bestScore = s; best = p; }
    }
    if (best) {
      reason = `${best.name} aligns with your ${a.genre} focus, your ${a.cadence.toLowerCase()} writing pace, and your preference for ${a.contract.toLowerCase()} contracts. Their onboarding fits authors at the "${a.experience.toLowerCase()}" stage.`;
    } else {
      reason = `No platforms in the roster yet. Contact ${AE_NAME} for a hand-curated recommendation.`;
    }
    setResult({ platform: best, score: Math.min(99, bestScore), reason });
    setDone(true);
    try {
      await supabase.from("recommendations").insert({
        answers: a, recommended_platform: best?.id ?? null, suitability_score: bestScore, recommendation_reason: reason,
      });
    } catch (e) { console.error(e); }
  };

  const progress = ((step + (done ? 1 : 0)) / questions.length) * 100;

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 md:px-8 py-20">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">The Oracle</p>
          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">AI platform <span className="rose-text">matcher</span></h1>
          <p className="mt-4 text-muted-foreground">Six questions. One recommendation.</p>
        </div>

        <div className="mt-10 h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div className="h-full bg-primary" animate={{ width: `${progress}%` }} transition={{ duration: 0.6 }} />
        </div>

        <div className="mt-10">
          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4 }}
                className="glass rounded-[32px] p-10">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">Question {step + 1} of {questions.length}</p>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-4">{questions[step].label}</h2>
                <div className="mt-8 grid sm:grid-cols-2 gap-3">
                  {questions[step].options.map((o) => (
                    <button key={o} onClick={() => pick(o)} className="text-left p-5 rounded-2xl bg-secondary hover:bg-accent transition-colors group">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{o}</span>
                        <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
                {step > 0 && (
                  <button onClick={() => setStep(step - 1)} className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-4 h-4" /> Previous question
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-[32px] p-10 text-center">
                <span className="w-16 h-16 rounded-full bg-accent grid place-items-center mx-auto">
                  <Trophy className="w-7 h-7 text-primary" />
                </span>
                <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-primary">Your match</p>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-3">{result.platform?.name ?? "Awaiting roster"}</h2>
                <div className="mt-6 inline-block">
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Suitability score</div>
                  <div className="text-6xl md:text-7xl font-extrabold text-primary mt-2">{result.score}%</div>
                </div>
                <p className="mt-6 text-muted-foreground max-w-xl mx-auto leading-relaxed">{result.reason}</p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  {result.platform && (
                    <a href={`/platforms/${result.platform.slug}`} className="btn-primary px-6 py-3">
                      <Sparkles className="w-4 h-4" /> View platform
                    </a>
                  )}
                  <button onClick={reset} className="btn-secondary px-6 py-3">
                    <RefreshCw className="w-4 h-4" /> Retake quiz
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </SiteLayout>
  );
}
