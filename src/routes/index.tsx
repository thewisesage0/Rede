import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Compass, Scroll, Quote, ChevronDown, Award, Target } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { AE_NAME } from "@/lib/site-config";
import { PolaroidSlot, JkStar, JkHeart } from "@/components/site/JkStickers";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kyef — Helping Writers Get Signed By Top Publishing Platforms" },
      { name: "description", content: "Discover the right platform, understand publishing contracts, and begin your journey as a professional webnovel author." },
    ],
  }),
  component: HomePage,
});

const genres = ["Billionaire Romance", "Mafia", "Werewolf", "Fantasy", "Cultivation", "LitRPG", "Academy Fantasy", "Dark Romance"];
const metrics = [
  { value: "120+", label: "Authors Signed" },
  { value: "18", label: "Partner Platforms" },
  { value: "$2.4M", label: "Author Earnings Routed" },
  { value: "94%", label: "Acceptance Rate" },
];

function HomePage() {
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-accent/60 blur-3xl" />
        <div className="absolute top-40 -left-32 w-[320px] h-[320px] rounded-full bg-[oklch(0.90_0.10_20/0.20)] blur-3xl" />

        <div className="relative mx-auto max-w-[1280px] px-4 md:px-8 pt-40 pb-24 md:pt-48 md:pb-32 grid lg:grid-cols-2 gap-16 items-center min-h-[720px]">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-xs font-semibold uppercase tracking-widest text-primary mb-8">
              <Sparkles className="w-3.5 h-3.5" /> {AE_NAME}'s Acquisition Desk
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-[68px] font-extrabold leading-[1.02] tracking-tight text-foreground">
              Helping writers get{" "}
              <span className="rose-text">signed</span> by top publishing platforms
            </h1>

            <p className="mt-7 text-lg text-muted-foreground max-w-lg leading-relaxed">
              Discover the right platform, understand publishing contracts, and begin your
              journey as a professional webnovel author — guided by {AE_NAME}, an acquisition
              editor who reads every chapter.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/platforms" className="btn-primary px-7 py-4">
                Explore platforms <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/matcher" className="btn-secondary px-7 py-4">
                <Compass className="w-4 h-4" /> Find your best platform
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-8">
              {metrics.slice(0, 2).map((m) => (
                <div key={m.label}>
                  <p className="text-2xl font-extrabold text-foreground">{m.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Mobile-only sticker row — the desktop "visual composition" panel
                is hidden below lg, so this keeps the cute touch on phones too. */}
            <div className="mt-8 flex lg:hidden items-end gap-3">
              <PolaroidSlot size="sm" rotate={-6} seed={0} caption="soon 💜" />
              <PolaroidSlot size="sm" rotate={4} seed={1} caption="your fit check" />
              <JkStar size={22} className="mb-2" />
              <JkHeart size={20} className="mb-4" />
            </div>
          </motion.div>

          {/* Visual composition */}
          <div className="relative h-[460px] hidden lg:block">
            {/* floating sticker cluster, purely decorative */}
            <div className="absolute -top-6 left-6 z-20">
              <PolaroidSlot size="sm" rotate={-8} seed={2} caption="pin me" />
            </div>
            <div className="absolute bottom-10 -left-10 z-20">
              <PolaroidSlot size="md" rotate={6} seed={3} caption="swap me!" />
            </div>
            <JkStar size={30} className="absolute top-12 right-8 z-20" />
            <JkHeart size={24} className="absolute bottom-4 right-20 z-20" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-0 right-0 w-[380px] glass-strong rounded-3xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm font-semibold">Match overview</p>
                <span className="text-xs text-muted-foreground">This week</span>
              </div>
              <div className="rounded-2xl bg-primary p-5 text-primary-foreground">
                <p className="text-xs uppercase tracking-widest opacity-80">Match score</p>
                <p className="text-4xl font-extrabold mt-1">96.4%</p>
                <p className="text-xs mt-2 opacity-80">Cultivation × DreamWords</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-secondary p-4">
                  <p className="text-xs text-muted-foreground">Platforms matched</p>
                  <p className="text-xl font-bold mt-1">6</p>
                </div>
                <div className="rounded-xl bg-secondary p-4">
                  <p className="text-xs text-muted-foreground">Est. bonus</p>
                  <p className="text-xl font-bold mt-1">$200</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-0 left-0 w-64 glass-strong rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <Scroll className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Contract signed</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Exclusive · 250k words · $200 onboarding bonus</p>
            </motion.div>

            <motion.span
              className="absolute top-24 left-6 w-14 h-14 rounded-2xl bg-[oklch(0.90_0.10_20/0.55)] grid place-items-center animate-float"
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
            >
              <Award className="w-6 h-6 text-[oklch(0.55_0.16_20)]" />
            </motion.span>
            <motion.span
              className="absolute bottom-32 right-10 w-14 h-14 rounded-2xl bg-accent grid place-items-center animate-float"
              style={{ animationDelay: "1.4s" }}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.65 }}
            >
              <Target className="w-6 h-6 text-primary" />
            </motion.span>
          </div>
        </div>
      </section>

      {/* METRICS */}
      <section className="mx-auto max-w-[1280px] px-4 md:px-8">
        <Reveal>
          <div className="glass rounded-[28px] p-8 md:p-10 grid grid-cols-2 md:grid-cols-4 gap-8">
            {metrics.map((m) => (
              <div key={m.label} className="text-center md:text-left">
                <p className="text-3xl md:text-4xl font-extrabold text-foreground">{m.value}</p>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mt-2">{m.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* WHY WORK WITH AN AE */}
      <section className="mx-auto max-w-[1280px] px-4 md:px-8 py-28 md:py-36">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Why work with an AE</p>
          <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight">
            A dedicated desk for every stage of your publishing journey.
          </h2>
        </Reveal>

        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {[
            { icon: Compass, title: "Platform curation", body: "We match your manuscript with the platforms that pay best for your genre, voice, and pace." },
            { icon: Scroll, title: "Contract clarity", body: "Exclusive vs. non-exclusive, royalties, bonuses — decoded in plain English before you sign." },
            { icon: Sparkles, title: "Onboarding care", body: "Step-by-step guidance from first chapter to first paycheck, with a human you can actually message." },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 0.08}>
              <div className="glass rounded-3xl p-8 h-full hover-lift">
                <div className="w-12 h-12 grid place-items-center rounded-2xl bg-accent mb-6">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* AI MATCHER TEASER */}
      <section className="mx-auto max-w-[1280px] px-4 md:px-8 pb-28 md:pb-36">
        <Reveal>
          <div className="rounded-[32px] bg-primary p-10 md:p-16 grid md:grid-cols-2 gap-10 items-center text-primary-foreground">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-80">The Kyef Oracle</p>
              <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight">
                Find your platform in 90 seconds.
              </h2>
              <p className="mt-5 opacity-85 leading-relaxed max-w-md">
                Answer six questions about your genre, pace, and ambitions. Our recommendation
                engine surfaces the platform that fits your manuscript best — with a suitability
                score and the reason why.
              </p>
              <Link to="/matcher" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white text-primary px-7 py-4 text-sm font-semibold hover:-translate-y-0.5 transition-transform">
                Begin the quiz <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {["Genre", "Cadence", "Goal", "Experience"].map((q, i) => (
                <motion.div
                  key={q}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  viewport={{ once: true }}
                  className={`rounded-2xl p-5 ${i === 1 ? "bg-[oklch(0.74_0.15_20)]" : "bg-white/10"}`}
                >
                  <p className="text-xs uppercase tracking-widest opacity-70">{`0${i + 1}`}</p>
                  <p className="text-lg font-bold mt-2">{q}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* TRENDING GENRES */}
      <section className="mx-auto max-w-[1280px] px-4 md:px-8 pb-28 md:pb-32">
        <Reveal>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center">
            Trending genres this season
          </h2>
        </Reveal>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {genres.map((g, i) => (
            <Reveal key={g} delay={i * 0.03}>
              <Link to="/platforms" className="px-5 py-2.5 rounded-full glass text-sm font-medium hover:border-primary/40 transition-colors inline-block">
                {g}
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-[1280px] px-4 md:px-8 pb-28 md:pb-32">
        <Reveal className="text-center max-w-xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Voices from the desk</p>
          <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight">Authors who turned the page.</h2>
        </Reveal>
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {[
            { q: "Within three weeks I was signed, onboarded, and earning. The AE walked me through every clause.", a: "Mira A.", g: "Werewolf Romance" },
            { q: "I had no idea exclusive bonuses even existed. Kyef changed my entire publishing trajectory.", a: "Rohan V.", g: "Cultivation" },
            { q: "It feels less like a CRM and more like a real partner. Everything is considered and clear.", a: "Lena F.", g: "Dark Academia" },
          ].map((t, i) => (
            <Reveal key={t.a} delay={i * 0.08}>
              <div className="glass rounded-3xl p-8 h-full hover-lift">
                <Quote className="w-7 h-7 text-primary/50 mb-4" />
                <p className="text-lg leading-relaxed">"{t.q}"</p>
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="font-semibold">{t.a}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t.g}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ PREVIEW */}
      <section className="mx-auto max-w-3xl px-4 md:px-8 pb-28 md:pb-32">
        <Reveal>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center">Common questions</h2>
        </Reveal>
        <div className="mt-12 space-y-3">
          {[
            { q: "What is an acquisition editor?", a: "An AE is a publishing professional who scouts manuscripts, matches them with the right platform, and shepherds authors through onboarding and contract negotiation." },
            { q: "Can beginners apply?", a: "Absolutely. Many of our signed authors started with their first novel. Talent matters more than tenure." },
            { q: "How long does review take?", a: "Most submissions hear back within 3–7 days. Exclusive contracts may take a fortnight as we negotiate the best terms." },
          ].map((f, i) => (
            <Reveal key={f.q} delay={i * 0.06}>
              <details className="glass rounded-2xl p-6 group">
                <summary className="text-base font-semibold cursor-pointer list-none flex justify-between items-center">
                  {f.q}
                  <ChevronDown className="w-5 h-5 text-primary transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-4 text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            </Reveal>
          ))}
          <div className="text-center pt-4">
            <Link to="/faq" className="text-sm font-medium text-primary hover:underline">Read all questions →</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1280px] px-4 md:px-8 pb-28 md:pb-36">
        <Reveal>
          <div className="relative overflow-hidden rounded-[32px] bg-accent p-12 md:p-20 text-center">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[oklch(0.90_0.10_20/0.35)] blur-3xl" />
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                Your next chapter <span className="rose-text">starts here.</span>
              </h2>
              <p className="mt-5 text-muted-foreground max-w-xl mx-auto text-lg">
                Submit your manuscript to {AE_NAME}'s desk and let's begin the conversation.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Link to="/submit" className="btn-primary px-8 py-4">Submit application</Link>
                <Link to="/contact" className="btn-secondary px-8 py-4">Talk to {AE_NAME}</Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </SiteLayout>
  );
}
