import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Feather, BookOpen, Heart, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { AE_NAME } from "@/lib/site-config";
import { PolaroidSlot, JkStar, JkMoon, JkHeart } from "@/components/site/JkStickers";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: `About ${AE_NAME}, the Acquisition Editor — Kyef` }, { name: "description", content: `The story behind Kyef and ${AE_NAME}, the editor who reads every manuscript.` }] }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-4 md:px-8 py-20 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Meet {AE_NAME}</p>
        <h1 className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight">A reader, <span className="rose-text">first.</span></h1>
        <p className="mt-6 text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
          Kyef began as a quiet promise between an editor and a circle of authors: that every
          manuscript would be read — properly, slowly, with attention to its sentences and its soul.
        </p>

        <div className="mt-8 flex justify-center items-end gap-4">
          <PolaroidSlot size="sm" rotate={-7} seed={1} caption="desk snap" />
          <JkMoon size={26} className="mb-3" />
          <PolaroidSlot size="md" rotate={5} seed={2} caption={`${AE_NAME}'s corner`} />
          <JkStar size={22} className="mb-4" />
          <PolaroidSlot size="sm" rotate={8} seed={3} caption="tbd" />
          <JkHeart size={20} className="mb-2 hidden sm:inline-block" />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 md:px-8 py-12 grid md:grid-cols-3 gap-6">
        {[
          { icon: Feather, title: "Curate", body: "We hand-pick platforms whose terms, audiences, and aesthetics deserve your work." },
          { icon: BookOpen, title: "Guide", body: "From query letter to royalty statement, we translate the publishing industry into plain English." },
          { icon: Heart, title: "Advocate", body: "We negotiate on your behalf, push for better bonuses, and stand beside you in every contract conversation." },
        ].map((b, i) => (
          <Reveal key={b.title} delay={i * 0.08}>
            <div className="glass rounded-3xl p-8 h-full hover-lift">
              <div className="w-12 h-12 rounded-2xl bg-accent grid place-items-center"><b.icon className="w-5 h-5 text-primary" /></div>
              <h3 className="text-xl font-bold mt-5">{b.title}</h3>
              <p className="text-muted-foreground mt-3 leading-relaxed">{b.body}</p>
            </div>
          </Reveal>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-4 md:px-8 py-24">
        <Reveal>
          <div className="rounded-[32px] bg-accent p-10 md:p-14 text-center">
            <motion.div initial={{ scale: 0.9 }} whileInView={{ scale: 1 }} viewport={{ once: true }}>
              <Sparkles className="w-9 h-9 text-primary mx-auto" />
              <p className="mt-6 text-2xl md:text-3xl font-semibold leading-relaxed">
                "Publishing isn't a transaction. It's the moment a writer trusts their pages to a stranger and asks — gently — if they're worth keeping."
              </p>
              <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-primary">— {AE_NAME}, Acquisition Editor</p>
            </motion.div>
          </div>
        </Reveal>
      </section>
    </SiteLayout>
  );
}
