import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { ChevronDown } from "lucide-react";
import { AE_NAME } from "@/lib/site-config";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQ — Kyef" }] }),
  component: FAQPage,
});

const faqs = [
  { q: "What is an acquisition editor?", a: "An AE scouts and represents authors, matches manuscripts with the right publishing platform, and walks the author through onboarding and contract negotiation." },
  { q: "What is an exclusive contract?", a: "Exclusive contracts grant a single platform the right to publish your novel for a defined window in exchange for higher royalties, marketing support, and a signing bonus." },
  { q: "What genres are popular?", a: `Right now: billionaire romance, werewolf/mafia romance, cultivation, LitRPG, academy fantasy, and dark academia. Trends shift quarterly—${AE_NAME}, your AE, will guide you.` },
  { q: "How much word count is needed?", a: "Most platforms expect a minimum of 3,000–5,000 words to apply for a contract." },
  { q: "How do bonuses work?", a: "Onboarding bonuses are paid by the platform when an author signs and meets the requirement. Kyef is compensated separately by the platform—you keep your full bonus." },
  { q: "Can beginners apply?", a: "Yes. We sign first-time authors regularly. Talent and consistency matter more than past publications." },
  { q: "How long does review take?", a: "Most submissions hear back in 3–7 days. Exclusive contracts may take up to two weeks while terms are negotiated." },
  { q: "Can I publish on multiple platforms?", a: "Non-exclusive contracts allow simultaneous publication. Exclusive contracts restrict you to one platform for the contract window." },
];

function FAQPage() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 md:px-8 py-20">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Questions</p>
          <h1 className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight">Frequently <span className="rose-text">asked.</span></h1>
        </div>
        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.04}>
              <details className="glass rounded-2xl p-6 group">
                <summary className="text-base font-semibold cursor-pointer list-none flex justify-between items-center gap-4">
                  {f.q}<ChevronDown className="w-5 h-5 text-primary shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-4 text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
