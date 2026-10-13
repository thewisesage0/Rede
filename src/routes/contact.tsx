import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle, Send, Loader2, Mail } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AE_NAME } from "@/lib/site-config";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: `Contact ${AE_NAME} — Kyef` }] }),
  component: ContactPage,
});

const schema = z.object({
  author_name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  notes: z.string().trim().min(1).max(2000),
});

function ContactPage() {
  const [form, setForm] = useState({ author_name: "", email: "", notes: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Invalid form"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from("submissions").insert({
        author_name: parsed.data.author_name,
        email: parsed.data.email,
        novel_title: "[Contact inquiry]",
        notes: parsed.data.notes,
        preferred_contact_method: "Email",
      });
      if (error) throw error;
      toast.success("Message sent. We'll be in touch.");
      setForm({ author_name: "", email: "", notes: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to send");
    } finally { setLoading(false); }
  };

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 md:px-8 py-20 grid md:grid-cols-2 gap-10 items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">{AE_NAME}'s desk</p>
          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">Let's <span className="rose-text">talk.</span></h1>
          <p className="mt-6 text-muted-foreground leading-relaxed">Whether you have a manuscript ready or a question about platforms, {AE_NAME}'s desk is open.</p>
          <div className="mt-10 space-y-3">
            {[
              { icon: MessageCircle, label: "WhatsApp", value: "+2347025434019" },
              // { icon: MessageCircle, label: "Discord", value: "kyef#0001" }, 
              // { icon: MessageCircle, label: "Telegram", value: "@kyef_ae" },
              { icon: Mail, label: "Email", value: "fashipeakorede4@gmail.com" },
            ].map((c) => (
              <div key={c.label} className="glass rounded-2xl p-4 flex items-center gap-4 hover-lift">
                <div className="w-10 h-10 rounded-xl bg-accent grid place-items-center"><c.icon className="w-4 h-4 text-primary" /></div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{c.label}</p>
                  <p className="text-base font-semibold">{c.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <form onSubmit={submit} className="glass rounded-[32px] p-8 space-y-4">
          <label className="block"><span className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Your name</span>
            <input required value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-secondary border border-transparent text-sm focus:outline-none focus:border-primary/40 focus:bg-white transition-colors" /></label>
          <label className="block"><span className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Email</span>
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-secondary border border-transparent text-sm focus:outline-none focus:border-primary/40 focus:bg-white transition-colors" /></label>
          <label className="block"><span className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Message</span>
            <textarea required rows={5} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-secondary border border-transparent text-sm focus:outline-none focus:border-primary/40 focus:bg-white transition-colors" /></label>
          <button disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send message
          </button>
        </form>
      </section>
    </SiteLayout>
  );
}
