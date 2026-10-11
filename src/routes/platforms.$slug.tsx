import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Copy,
  BookOpen,
  Coins,
  Scroll,
  User,
  Sparkles,
  FileText,
  Clock,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { Lightbox } from "@/components/site/Lightbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { AE_NAME } from "@/lib/site-config";

export const Route = createFileRoute("/platforms/$slug")({
  component: PlatformDetail,
  notFoundComponent: PlatformNotFound,
  errorComponent: ({ error }) => <PlatformError message={(error as Error).message} />,
});

function PlatformNotFound() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-32 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">404 · Not found</p>
          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">Platform not found</h1>
          <p className="mt-5 text-muted-foreground">
            This platform isn't in our library yet. It may have been renamed or archived.
          </p>
          <Link to="/platforms" className="btn-primary mt-8 px-6 py-3 inline-flex">
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to all platforms
          </Link>
        </motion.div>
      </div>
    </SiteLayout>
  );
}

function PlatformError({ message }: { message: string }) {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-32 text-center">
        <h1 className="text-3xl font-extrabold">Something went wrong</h1>
        <p className="mt-3 text-muted-foreground text-sm">{message}</p>
        <Link to="/platforms" className="mt-6 inline-block text-primary font-medium">
          ← Back to platforms
        </Link>
      </div>
    </SiteLayout>
  );
}

function CinematicLoader() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 md:px-8 py-16">
        <div className="glass rounded-3xl p-10 md:p-16">
          <div className="grid md:grid-cols-[auto_1fr] gap-8">
            <div className="w-28 h-28 rounded-3xl bg-secondary animate-pulse" />
            <div className="space-y-4">
              <div className="h-3 w-32 bg-secondary rounded-full animate-pulse" />
              <div className="h-10 w-3/4 bg-secondary rounded-xl animate-pulse" />
              <div className="h-3 w-full bg-secondary rounded-full animate-pulse" />
              <div className="h-3 w-5/6 bg-secondary rounded-full animate-pulse" />
            </div>
          </div>
        </div>
        <div className="mt-6 grid md:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl h-28 animate-pulse" />
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}

function PlatformDetail() {
  const { slug } = Route.useParams();
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ["platform", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platforms")
        .select("*")
        .eq("slug", slug)
        .eq("archived", false)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <CinematicLoader />;
  if (error) return <PlatformError message={(error as Error).message} />;
  if (!data) return <PlatformNotFound />;

  const p: any = data;
  const steps: Array<{ title: string; description: string }> = Array.isArray(p.onboarding_steps)
    ? (p.onboarding_steps as any)
    : [];
  const faq: Array<{ q: string; a: string }> = Array.isArray(p.faq) ? (p.faq as any) : [];
  const processImages: string[] = Array.isArray(p.process_images)
    ? (p.process_images as any).filter((x: any) => typeof x === "string")
    : [];

  const copyRef = () => {
    if (p.referral_code) {
      navigator.clipboard.writeText(p.referral_code);
      toast.success("Referral code copied");
    }
  };

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 md:px-8 pt-8 pb-6">
        <Link to="/platforms" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          ← All platforms
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-4 md:px-8">
        <Reveal>
          <div className="glass rounded-[32px] p-8 md:p-14">
            <div className="grid md:grid-cols-[auto_1fr] gap-8 items-start">
              {p.logo_url ? (
                <img
                  src={p.logo_url}
                  alt={p.name}
                  className="w-28 h-28 rounded-3xl object-cover border border-border"
                  decoding="async"
                  width={112}
                  height={112}
                />
              ) : (
                <div className="w-28 h-28 rounded-3xl bg-accent grid place-items-center text-4xl font-extrabold text-primary">
                  {p.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                  {p.tagline ?? "Featured platform"}
                </p>
                <h1 className="mt-3 text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">{p.name}</h1>
                <p className="mt-5 text-muted-foreground text-lg leading-relaxed max-w-2xl">
                  {p.description}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {p.genres?.map((g: string) => (
                    <span key={g} className="px-3 py-1.5 rounded-full bg-secondary text-xs font-medium">
                      {g}
                    </span>
                  ))}
                  {p.contract_types?.map((c: string) => (
                    <span key={c} className="px-3 py-1.5 rounded-full bg-accent text-xs font-medium text-primary">
                      {c}
                    </span>
                  ))}
                </div>
                {p.senior_editor_name && (
                  <div className="mt-6 inline-flex items-center gap-3 bg-secondary rounded-full pl-2 pr-5 py-2">
                    <span className="grid place-items-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                      <User className="w-4 h-4" />
                    </span>
                    <div className="text-left">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Senior Editor
                      </p>
                      <p className="text-sm font-semibold">{p.senior_editor_name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-4 md:px-8 pb-24">
        {/* Stats */}
        <div className="mt-10 grid md:grid-cols-4 gap-5">
          {[
            { icon: Sparkles, label: "Signing bonus", value: p.signing_bonus_requirements ? "Available" : "On request" },
            { icon: Coins, label: "MAB", value: p.mab_details ? "Yes" : "—" },
            { icon: BookOpen, label: "Min word count", value: p.min_word_count ? p.min_word_count.toLocaleString() : "Flexible" },
            { icon: Clock, label: "Update cadence", value: p.update_expectations ? "See below" : "Flexible" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06}>
              <div className="glass rounded-2xl p-6">
                <div className="w-9 h-9 rounded-xl bg-accent grid place-items-center mb-3">
                  <s.icon className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">{s.label}</p>
                <p className="text-2xl font-extrabold mt-1">{s.value}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Benefits + bonus requirements */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Reveal>
            <div className="glass rounded-3xl p-8 h-full">
              <h3 className="text-xl font-bold mb-3 text-primary">Exclusive benefits</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {p.exclusive_benefits ?? "Details available on request."}
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="glass rounded-3xl p-8 h-full">
              <h3 className="text-xl font-bold mb-3 text-primary">Non-exclusive benefits</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {p.nonexclusive_benefits ?? "Details available on request."}
              </p>
            </div>
          </Reveal>
        </div>

        {(p.signing_bonus_requirements || p.mab_details || p.mab_requirements) && (
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            {p.signing_bonus_requirements && (
              <Reveal>
                <div className="glass rounded-3xl p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h4 className="text-lg font-bold">Signing bonus requirements</h4>
                  </div>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {p.signing_bonus_requirements}
                  </p>
                </div>
              </Reveal>
            )}
            {(p.mab_details || p.mab_requirements) && (
              <Reveal delay={0.08}>
                <div className="glass rounded-3xl p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Coins className="w-4 h-4 text-primary" />
                    <h4 className="text-lg font-bold">MAB (Monthly Activity Bonus)</h4>
                  </div>
                  {p.mab_details && (
                    <p className="text-muted-foreground whitespace-pre-line">{p.mab_details}</p>
                  )}
                  {p.mab_requirements && (
                    <>
                      <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-primary">
                        Requirements
                      </p>
                      <p className="text-muted-foreground whitespace-pre-line mt-1">
                        {p.mab_requirements}
                      </p>
                    </>
                  )}
                </div>
              </Reveal>
            )}
          </div>
        )}

        {/* Monetization, update expectations, requirements */}
        {(p.monetization_details || p.requirements || p.update_expectations) && (
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {p.monetization_details && (
              <Reveal>
                <div className="glass rounded-3xl p-8 h-full">
                  <h3 className="text-lg font-bold mb-3">Monetization</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{p.monetization_details}</p>
                </div>
              </Reveal>
            )}
            {p.update_expectations && (
              <Reveal delay={0.06}>
                <div className="glass rounded-3xl p-8 h-full">
                  <h3 className="text-lg font-bold mb-3">Update expectations</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{p.update_expectations}</p>
                </div>
              </Reveal>
            )}
            {p.requirements && (
              <Reveal delay={0.12}>
                <div className="glass rounded-3xl p-8 h-full">
                  <h3 className="text-lg font-bold mb-3">Requirements</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{p.requirements}</p>
                </div>
              </Reveal>
            )}
          </div>
        )}

        {/* How To Apply — clean vertical stepper */}
        <section className="mt-24">
          <Reveal>
            <div className="text-center mb-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">The journey</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight">
                How to apply to {p.name}
              </h2>
            </div>
          </Reveal>
          {steps.length > 0 ? (
            <div className="max-w-2xl mx-auto space-y-4">
              {steps.map((s, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <div className="flex gap-5 glass rounded-2xl p-6">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-primary text-primary-foreground grid place-items-center font-bold text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">{s.title}</h4>
                      <p className="mt-1.5 text-muted-foreground leading-relaxed">{s.description}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal>
              <div className="glass rounded-2xl p-10 text-center text-muted-foreground">
                Application steps will be added soon.
              </div>
            </Reveal>
          )}
        </section>

        {/* Process Image Gallery */}
        {processImages.length > 0 && (
          <section className="mt-24">
            <Reveal>
              <div className="text-center mb-10">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">Visual guide</p>
                <h2 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight">The onboarding process</h2>
              </div>
            </Reveal>
            <div className="grid sm:grid-cols-2 gap-5">
              {processImages.slice(0, 8).map((src, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <motion.button
                    type="button"
                    onClick={() => setLightboxIdx(i)}
                    whileHover={{ y: -4 }}
                    className="group relative overflow-hidden rounded-3xl border border-border aspect-[4/3] bg-secondary w-full text-left cursor-zoom-in"
                  >
                    <img
                      src={src}
                      alt={`${p.name} process step ${i + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute bottom-4 left-5 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full bg-white/90 text-foreground">
                      Step {i + 1}
                    </div>
                  </motion.button>
                </Reveal>
              ))}
            </div>
            <Lightbox
              images={processImages}
              index={lightboxIdx}
              onClose={() => setLightboxIdx(null)}
              onIndexChange={setLightboxIdx}
            />
          </section>
        )}

        {/* Referral / application */}
        <section className="mt-16 grid md:grid-cols-2 gap-6">
          {p.referral_code && (
            <Reveal>
              <div className="glass rounded-3xl p-8">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Referral code
                </p>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <p className="text-2xl font-extrabold text-primary tracking-wider">{p.referral_code}</p>
                  <button onClick={copyRef} className="btn-secondary p-2.5">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="mt-3 text-sm text-muted-foreground whitespace-pre-line">
                  {p.referral_instructions ??
                    `Use this code when registering on ${p.name} so the platform credits ${AE_NAME} as your referrer.`}
                </p>
              </div>
            </Reveal>
          )}
          {(p.application_link || p.referral_link) && (
            <Reveal delay={0.08}>
              <div className="glass rounded-3xl p-8">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Apply on {p.name}
                </p>
                {p.application_instructions ? (
                  <p className="mt-3 text-sm text-muted-foreground whitespace-pre-line">
                    {p.application_instructions}
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Open the platform's application portal in a new tab.
                  </p>
                )}
                <a
                  href={p.referral_link || p.application_link || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary mt-5 px-6 py-3 inline-flex"
                >
                  Open application <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </Reveal>
          )}
        </section>

        {/* Platform FAQ */}
        {faq.length > 0 && (
          <section className="mt-24">
            <Reveal>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center">
                Questions about <span className="rose-text">{p.name}</span>
              </h2>
            </Reveal>
            <div className="mt-10 space-y-3 max-w-3xl mx-auto">
              {faq.map((f, i) => (
                <Reveal key={i} delay={i * 0.04}>
                  <details className="glass rounded-2xl p-6 group">
                    <summary className="text-base font-semibold cursor-pointer list-none flex justify-between gap-4">
                      <span className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-primary shrink-0" />
                        {f.q}
                      </span>
                      <span className="text-primary group-open:rotate-180 transition-transform shrink-0">▾</span>
                    </summary>
                    <p className="mt-3 text-muted-foreground pl-7">{f.a}</p>
                  </details>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <Reveal>
          <div className="mt-24 rounded-[32px] bg-accent p-12 text-center">
            <Scroll className="w-9 h-9 text-primary mx-auto" />
            <h3 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight">Already applied to {p.name}?</h3>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              Let {AE_NAME} know so she can advocate for your manuscript directly with the platform team.
            </p>
            <Link
              to="/submit"
              search={{ platform: p.id }}
              className="btn-primary mt-8 px-8 py-4 inline-flex"
            >
              <CheckCircle2 className="w-4 h-4" /> I've submitted my application <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>
      </section>
    </SiteLayout>
  );
}
