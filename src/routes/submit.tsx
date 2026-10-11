import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { z } from "zod";
import { Upload, CheckCircle2, Loader2, Send } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const submitSchema = z.object({
  author_name: z.string().trim().min(1).max(100),
  pen_name: z.string().trim().max(100).optional().or(z.literal("")),
  email: z.string().trim().email().max(255),
  platform_id: z.string().uuid().optional().or(z.literal("")),
  novel_title: z.string().trim().min(1).max(200),
  genre: z.string().max(100).optional().or(z.literal("")),
  word_count: z.coerce.number().int().min(0).max(10_000_000).optional(),
  contract_type: z.string().max(50).optional().or(z.literal("")),
  preferred_contact_method: z.string().max(50).optional().or(z.literal("")),
  contact_info: z.string().max(255).optional().or(z.literal("")),
  book_links: z.string().max(2000).optional().or(z.literal("")),
  reader_traction: z.string().max(500).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export const Route = createFileRoute("/submit")({
  validateSearch: (s: Record<string, unknown>) => ({ platform: (s.platform as string) || "" }),
  head: () => ({ meta: [{ title: "Submit Your Application — Kyef" }] }),
  component: SubmitPage,
});

function SubmitPage() {
  const { platform } = Route.useSearch();
  const [form, setForm] = useState({
    author_name: "", pen_name: "", email: "", platform_id: platform || "", novel_title: "",
    genre: "", word_count: "", contract_type: "", preferred_contact_method: "WhatsApp", contact_info: "",
    book_links: "", reader_traction: "", notes: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const { data: platforms = [] } = useQuery({
    queryKey: ["platforms-min"],
    queryFn: async () => {
      const { data } = await supabase.from("platforms").select("id,name").eq("archived", false).order("name");
      return data ?? [];
    },
  });

  const upd = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = submitSchema.safeParse({ ...form, word_count: form.word_count ? Number(form.word_count) : undefined });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid form");
      return;
    }
    setSubmitting(true);
    try {
      let proof_url: string | null = null;
      if (file) {
        const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const { error: upErr } = await supabase.storage.from("proofs").upload(path, file);
        if (upErr) throw upErr;
        proof_url = supabase.storage.from("proofs").getPublicUrl(path).data.publicUrl;
      }
      const payload = {
        ...parsed.data,
        pen_name: parsed.data.pen_name || null,
        platform_id: parsed.data.platform_id || null,
        genre: parsed.data.genre || null,
        contract_type: parsed.data.contract_type || null,
        preferred_contact_method: parsed.data.preferred_contact_method || null,
        contact_info: parsed.data.contact_info || null,
        book_links: parsed.data.book_links || null,
        reader_traction: parsed.data.reader_traction || null,
        notes: parsed.data.notes || null,
        word_count: parsed.data.word_count ?? null,
        proof_url,
      };
      const { error } = await supabase.from("submissions").insert(payload);
      if (error) throw error;
      setDone(true);
      toast.success("Application received");
    } catch (err: any) {
      toast.error(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-2xl px-4 md:px-8 py-32 text-center">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass rounded-[32px] p-12">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="mx-auto w-20 h-20 rounded-full bg-primary grid place-items-center shadow-[var(--shadow-rose)]">
              <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
            </motion.div>
            <h1 className="text-4xl font-extrabold tracking-tight mt-6">Manuscript received.</h1>
            <p className="mt-4 text-muted-foreground">Our acquisition desk has your application. Expect a reply within 3–7 days at <span className="text-foreground font-medium">{form.email}</span>.</p>
            <a href="/" className="btn-primary mt-8 px-7 py-3 inline-flex">Return home</a>
          </motion.div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 md:px-8 py-20">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">The submission</p>
          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">Submit your <span className="rose-text">manuscript</span></h1>
          <p className="mt-4 text-muted-foreground">Tell us about your novel and we'll begin the conversation.</p>
        </div>

        <form onSubmit={submit} className="mt-12 glass rounded-[32px] p-8 md:p-10 space-y-8">
          <FormSection step={1} title="Who you are">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Author name *"><input required value={form.author_name} onChange={upd("author_name")} className={inputCls} /></Field>
              <Field label="Pen name"><input value={form.pen_name} onChange={upd("pen_name")} className={inputCls} /></Field>
            </div>
            <Field label="Email *"><input type="email" required value={form.email} onChange={upd("email")} className={inputCls} /></Field>
          </FormSection>

          <FormSection step={2} title="Your manuscript">
            <Field label="Novel title *"><input required value={form.novel_title} onChange={upd("novel_title")} className={inputCls} /></Field>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Platform applied to">
                <select value={form.platform_id} onChange={upd("platform_id")} className={inputCls}>
                  <option value="">Select a platform</option>
                  {platforms.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </Field>
              <Field label="Genre"><input value={form.genre} onChange={upd("genre")} className={inputCls} placeholder="e.g. Werewolf Romance" /></Field>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Word count"><input type="number" min={0} value={form.word_count} onChange={upd("word_count")} className={inputCls} /></Field>
              <Field label="Contract type">
                <select value={form.contract_type} onChange={upd("contract_type")} className={inputCls}>
                  <option value="">No preference</option>
                  <option>Exclusive</option>
                  <option>Non-exclusive</option>
                </select>
              </Field>
            </div>
          </FormSection>

          <FormSection step={3} title="How to reach you">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Preferred contact">
                <select value={form.preferred_contact_method} onChange={upd("preferred_contact_method")} className={inputCls}>
                  <option>WhatsApp</option><option>Discord</option><option>Telegram</option><option>Email</option>
                </select>
              </Field>
              <Field label="Contact handle"><input value={form.contact_info} onChange={upd("contact_info")} className={inputCls} placeholder="@username or +1..." /></Field>
            </div>
          </FormSection>

          <FormSection step={4} title="Help us say yes (optional)">
            <Field label="Links to best-performing books"><textarea value={form.book_links} onChange={upd("book_links")} rows={2} className={inputCls} placeholder="One per line" /></Field>
            <Field label="Readership or performance details">
              <input
                value={form.reader_traction}
                onChange={upd("reader_traction")}
                className={inputCls}
                placeholder="e.g. 120k reads on Webnovel, 4.7 rating, Top 10 in Paranormal Romance"
              />
            </Field>
            <Field label="Additional notes"><textarea value={form.notes} onChange={upd("notes")} rows={3} className={inputCls} /></Field>
            <Field label="Screenshot proof">
              <label className="flex items-center gap-3 px-4 py-4 rounded-2xl border border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors bg-secondary/40">
                <Upload className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">{file ? file.name : "Click to upload an image (PNG/JPG)"}</span>
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="hidden" />
              </label>
            </Field>
          </FormSection>

          <button type="submit" disabled={submitting} className="btn-primary w-full mt-4 py-4 disabled:opacity-60">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {submitting ? "Submitting…" : "Send to the acquisition desk"}
          </button>
        </form>
      </section>
    </SiteLayout>
  );
}

const inputCls = "w-full px-4 py-3 rounded-xl bg-secondary border border-transparent text-sm focus:outline-none focus:border-primary/40 focus:bg-white transition-colors";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">{label}</span>{children}</label>;
}
// Breaks the long form into labeled, numbered groups so it reads as a few
// short steps instead of one wall of fields.
function FormSection({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 pb-1 border-b border-border/60">
        <span className="w-6 h-6 rounded-full bg-accent text-primary text-xs font-bold grid place-items-center shrink-0">{step}</span>
        <h2 className="text-sm font-bold">{title}</h2>
      </div>
      {children}
    </div>
  );
}
