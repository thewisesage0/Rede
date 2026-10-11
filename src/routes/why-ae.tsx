import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Scroll, Sparkles, Zap, Shield, Trophy } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/why-ae")({
  head: () => ({ meta: [{ title: "Why Work With an Acquisition Editor — Kyef" }] }),
  component: WhyAE,
});

const benefits = [
  { icon: Compass, title: "Publishing guidance", body: "Strategic direction tailored to your genre, voice, and publishing ambitions." },
  { icon: Zap, title: "Faster onboarding", body: "Skip the queue. Authors signed through an AE are typically reviewed within 72 hours." },
  { icon: Sparkles, title: "Platform recommendations", body: "Curated matches with platforms that pay best for your specific niche." },
  { icon: Scroll, title: "Contract understanding", body: "Every clause explained — exclusivity, royalties, bonuses, termination, IP rights." },
  { icon: Shield, title: "Industry support", body: "An advocate on your side when platform negotiations get complicated." },
  { icon: Trophy, title: "Genre direction", body: "Data on what's trending, what's saturating, and where the white space lives." },
];

const timeline = [
  { phase: "Week 1", title: "Discovery", body: "We meet, read your manuscript, and identify the best-fit platforms." },
  { phase: "Week 2", title: "Pitch", body: "We submit your work to chosen platforms with a custom acquisition memo." },
  { phase: "Week 3", title: "Negotiate", body: "Contract terms, bonuses, and exclusivity windows worked out on your behalf." },
  { phase: "Week 4", title: "Onboard", body: "You sign, the platform onboards, and your debut chapter goes live." },
];

function WhyAE() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-4 md:px-8 py-20 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Why an AE</p>
        <h1 className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight">Six reasons writers <span className="rose-text">never go back.</span></h1>
        <p className="mt-6 text-muted-foreground text-lg max-w-2xl mx-auto">An acquisition editor is the quiet difference between submitting cold and being expected.</p>
      </section>

      <section className="mx-auto max-w-6xl px-4 md:px-8 py-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map((b, i) => (
          <Reveal key={b.title} delay={i * 0.06}>
            <div className="glass rounded-3xl p-7 h-full hover-lift">
              <div className="w-12 h-12 rounded-2xl bg-accent grid place-items-center"><b.icon className="w-5 h-5 text-primary" /></div>
              <h3 className="text-lg font-bold mt-5">{b.title}</h3>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{b.body}</p>
            </div>
          </Reveal>
        ))}
      </section>

      <section className="mx-auto max-w-2xl px-4 md:px-8 py-24">
        <Reveal><h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center">The onboarding journey</h2></Reveal>
        <div className="mt-14 space-y-4">
          {timeline.map((t, i) => (
            <Reveal key={t.phase} delay={i * 0.08}>
              <div className="flex gap-5 glass rounded-2xl p-6">
                <div className="w-10 h-10 shrink-0 rounded-full bg-primary text-primary-foreground grid place-items-center font-bold text-sm">
                  {i + 1}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t.phase}</p>
                  <h3 className="text-lg font-bold mt-1">{t.title}</h3>
                  <p className="mt-1.5 text-muted-foreground leading-relaxed">{t.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link to="/submit" className="btn-primary px-7 py-3.5 inline-flex">Begin your journey</Link>
        </div>
      </section>
    </SiteLayout>
  );
}
