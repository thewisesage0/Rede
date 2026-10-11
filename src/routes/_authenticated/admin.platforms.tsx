import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, Archive, ArchiveRestore, X, Loader2, Download, FileDown, Upload, ChevronDown, Search } from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { toast } from "sonner";
import { ImageUploader } from "@/components/site/ImageUploader";
import { Checkbox } from "@/components/ui/checkbox";
import {
  SE_EMAIL_FIELD_OPTIONS,
  DEFAULT_SE_EMAIL_FIELDS,
  DEFAULT_SUBJECT_TEMPLATE,
  sanitizeSeEmailFields,
  type SeEmailFieldKey,
} from "@/lib/se-email";

export const Route = createFileRoute("/_authenticated/admin/platforms")({
  component: PlatformsAdmin,
});

const blank = {
  name: "",
  slug: "",
  tagline: "",
  description: "",
  logo_url: "",
  genres: "",
  contract_types: "",
  application_link: "",
  referral_code: "",
  referral_link: "",
  exclusive_bonus: 0,
  nonexclusive_bonus: 0,
  min_word_count: 0,
  update_expectations: "",
  requirements: "",
  monetization_details: "",
  exclusive_benefits: "",
  nonexclusive_benefits: "",
  senior_editor_name: "",
  senior_editor_email: "",
  se_email_fields: DEFAULT_SE_EMAIL_FIELDS as SeEmailFieldKey[],
  se_email_subject_template: "",
  se_email_intro: "",
  se_email_custom_note: "",
  mab_details: "",
  mab_requirements: "",
  signing_bonus_requirements: "",
  application_instructions: "",
  referral_instructions: "",
  process_images: "",
};

const CSV_COLUMNS = [
  "name", "slug", "tagline", "description", "genres", "contract_types",
  "application_link", "referral_code", "referral_link",
  "exclusive_bonus", "nonexclusive_bonus", "min_word_count",
  "update_expectations", "requirements", "monetization_details",
  "exclusive_benefits", "nonexclusive_benefits", "senior_editor_name",
  "senior_editor_email",
  "mab_details", "mab_requirements", "signing_bonus_requirements",
  "application_instructions", "referral_instructions"
];

const SAMPLE_ROW: Record<string, string> = {
  name: "DreamWords",
  slug: "dream-words",
  tagline: "Where stories find their home",
  description: "A top-tier webnovel platform focused on romance and fantasy.",
  genres: "Romance, Fantasy, Cultivation",
  contract_types: "Exclusive, Non-Exclusive",
  application_link: "https://dreamwords.com/apply",
  referral_code: "ZEN2026",
  referral_link: "https://dreamwords.com/ref/zen",
  exclusive_bonus: "200",
  nonexclusive_bonus: "100",
  min_word_count: "50000",
  update_expectations: "2 chapters per week",
  requirements: "Completed manuscript preferred; min 50k words",
  monetization_details: "Revenue share after 500k words read",
  exclusive_benefits: "Higher revenue share, signing bonus, dedicated editor",
  nonexclusive_benefits: "Flexible rights, lower commitment",
  senior_editor_name: "Jane Osei",
  senior_editor_email: "jane.osei@dreamwords.com",
  mab_details: "Minimum Assured Bonus available for exclusive contracts",
  mab_requirements: "Must hit 1M reads within 90 days",
  signing_bonus_requirements: "Exclusive only; min 200k contracted words",
  application_instructions: "Apply via the link above with your first 3 chapters",
  referral_instructions: "Use referral code at signup for bonus tracking",
};

function csvEscape(v: string) {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function downloadTemplate() {
  const header = CSV_COLUMNS.join(",");
  const sample = CSV_COLUMNS.map((c) => csvEscape(SAMPLE_ROW[c] ?? "")).join(",");
  const csv = `${header}\n${sample}\n`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "kyef-platforms-template.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadXlsxTemplate() {
  const sampleRow = CSV_COLUMNS.map((c) => SAMPLE_ROW[c] ?? "");
  const aoa = [CSV_COLUMNS, sampleRow];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Platforms");
  XLSX.writeFile(wb, "kyef-platforms-template.xlsx");
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function PlatformsAdmin() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>(blank);
  const [saving, setSaving] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [seSectionOpen, setSeSectionOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "archived">("active");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("platforms").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };
  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  // Hooks must run unconditionally on every render, so this has to sit
  // above the authLoading/!isAdmin early returns below — a useMemo placed
  // after a conditional return only fires on some renders, and React
  // throws ("rendered more/fewer hooks than previous render") the moment
  // the hook count changes between renders. That was crashing this page.
  const q = query.trim().toLowerCase();
  const visibleItems = useMemo(() => {
    return items
      .filter((p) => (statusFilter === "all" ? true : statusFilter === "archived" ? p.archived : !p.archived))
      .filter((p) => {
        if (!q) return true;
        const haystack = [p.name, p.slug, ...(p.genres ?? [])].filter(Boolean).join(" ").toLowerCase();
        return haystack.includes(q);
      });
  }, [items, statusFilter, q]);

  if (authLoading) return null;
  if (!isAdmin)
    return (
      <div className="max-w-2xl mx-auto glass-strong rounded-2xl p-10 text-center">
        <h1 className="font-serif text-2xl">Restricted</h1>
        <p className="text-muted-foreground mt-2">Admin access required.</p>
      </div>
    );

  const openCreate = () => {
    setEditing({ new: true });
    setForm(blank);
    setSeSectionOpen(false);
  };
  const openEdit = (p: any) => {
    setEditing(p);
    const imgs: string[] = Array.isArray(p.process_images) ? p.process_images : [];
    setForm({
      ...blank,
      ...p,
      genres: (p.genres ?? []).join(", "),
      contract_types: (p.contract_types ?? []).join(", "),
      se_email_fields: sanitizeSeEmailFields(p.se_email_fields),
      process_image_1: imgs[0] ?? "",
      process_image_2: imgs[1] ?? "",
      process_image_3: imgs[2] ?? "",
      process_image_4: imgs[3] ?? "",
    });
    setSeSectionOpen(Boolean(p.senior_editor_email));
  };
  const close = () => setEditing(null);

  const save = async () => {
    setSaving(true);
    const processImages = [
      form.process_image_1,
      form.process_image_2,
      form.process_image_3,
      form.process_image_4,
    ].filter((s: string) => s && s.trim());
    const {
      process_image_1,
      process_image_2,
      process_image_3,
      process_image_4,
      ...rest
    } = form;
    const payload = {
      ...rest,
      genres: String(form.genres).split(",").map((s: string) => s.trim()).filter(Boolean),
      contract_types: String(form.contract_types).split(",").map((s: string) => s.trim()).filter(Boolean),
      process_images: processImages,
      exclusive_bonus: Number(form.exclusive_bonus) || 0,
      nonexclusive_bonus: Number(form.nonexclusive_bonus) || 0,
      min_word_count: Number(form.min_word_count) || 0,
      senior_editor_email: form.senior_editor_email?.trim() || null,
      se_email_fields: sanitizeSeEmailFields(form.se_email_fields),
      se_email_subject_template: form.se_email_subject_template?.trim() || null,
      se_email_intro: form.se_email_intro?.trim() || null,
      se_email_custom_note: form.se_email_custom_note?.trim() || null,
    };
    let error;
    if (editing.new) {
      ({ error } = await supabase.from("platforms").insert(payload));
    } else {
      ({ error } = await supabase.from("platforms").update(payload).eq("id", editing.id));
    }
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    close();
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this platform?")) return;
    const { error } = await supabase.from("platforms").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  const toggleArchive = async (p: any) => {
    const { error } = await supabase.from("platforms").update({ archived: !p.archived }).eq("id", p.id);
    if (error) return toast.error(error.message);
    load();
  };

  const runImport = async () => {
    if (!csvFile) return;
    setImporting(true);
    try {
      const name = csvFile.name.toLowerCase();
      const isExcel = name.endsWith(".xlsx") || name.endsWith(".xls");
      let headers: string[];
      let rows: Record<string, any>[];

      if (isExcel) {
        const buf = await csvFile.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        if (!ws) throw new Error("Excel file has no sheets");
        const aoa = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: "", blankrows: false });
        if (aoa.length < 2) throw new Error("File has no data rows");
        headers = (aoa[0] as any[]).map((h) => String(h ?? "").trim());
        rows = aoa.slice(1).map((vals) => {
          const obj: Record<string, any> = {};
          headers.forEach((h, i) => { obj[h] = String((vals as any[])[i] ?? "").trim(); });
          return obj;
        });
      } else {
        const text = await csvFile.text();
        const lines = text.trim().split("\n").map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) throw new Error("CSV has no data rows");
        headers = parseCSVLine(lines[0]);
        rows = lines.slice(1).map(line => {
          const values = parseCSVLine(line);
          const obj: Record<string, any> = {};
          headers.forEach((h, i) => { obj[h.trim()] = values[i]?.trim() ?? ""; });
          return obj;
        });
      }

      let successCount = 0;
      let errorCount = 0;
      for (const row of rows) {
        const payload = {
          name: row.name || "",
          slug: row.slug || row.name?.toLowerCase().replace(/\s+/g, "-") || "",
          tagline: row.tagline || "",
          description: row.description || "",
          genres: row.genres ? row.genres.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
          contract_types: row.contract_types ? row.contract_types.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
          application_link: row.application_link || "",
          referral_code: row.referral_code || "",
          referral_link: row.referral_link || "",
          exclusive_bonus: Number(row.exclusive_bonus) || 0,
          nonexclusive_bonus: Number(row.nonexclusive_bonus) || 0,
          min_word_count: Number(row.min_word_count) || 0,
          update_expectations: row.update_expectations || "",
          requirements: row.requirements || "",
          monetization_details: row.monetization_details || "",
          exclusive_benefits: row.exclusive_benefits || "",
          nonexclusive_benefits: row.nonexclusive_benefits || "",
          senior_editor_name: row.senior_editor_name || "",
          senior_editor_email: row.senior_editor_email || "",
          mab_details: row.mab_details || "",
          mab_requirements: row.mab_requirements || "",
          signing_bonus_requirements: row.signing_bonus_requirements || "",
          application_instructions: row.application_instructions || "",
          referral_instructions: row.referral_instructions || "",
          process_images: [],
        };
        if (!payload.name) { errorCount++; continue; }
        const { error } = await supabase.from("platforms").insert(payload);
        if (error) { errorCount++; } else { successCount++; }
      }

      if (successCount > 0) toast.success(`${successCount} platform${successCount > 1 ? "s" : ""} imported successfully`);
      if (errorCount > 0) toast.error(`${errorCount} row${errorCount > 1 ? "s" : ""} failed to import`);
      setImportModal(false);
      setCsvFile(null);
      load();
    } catch (e: any) {
      toast.error(e.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Catalog</p>
          <h1 className="font-serif text-4xl mt-2">Platforms</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setImportModal(true)}
            className="flex items-center gap-2 rounded-full glass border border-primary/40 px-5 py-2.5 text-sm font-medium rose-text"
          >
            <Download className="w-4 h-4" /> Import Platform
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-blush-glow text-primary-foreground px-5 py-2.5 text-sm font-medium shadow-[var(--shadow-rose)]"
          >
            <Plus className="w-4 h-4" /> New Platform
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search platforms…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-transparent text-sm focus:outline-none focus:border-primary/40 focus:bg-white transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {(["active", "archived", "all"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-widest transition-colors ${
                statusFilter === s
                  ? "bg-primary/20 text-foreground border border-primary/40"
                  : "border border-border/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 glass rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground border-b border-border/40">
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Genres</th>
                <th className="px-5 py-4">Bonus</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((p) => (
                <tr key={p.id} className="border-b border-border/20 hover:bg-secondary/60">
                  <td className="px-5 py-4">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.slug}</div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{(p.genres ?? []).slice(0, 3).join(", ")}</td>
                  <td className="px-5 py-4 rose-text">${Number(p.exclusive_bonus).toLocaleString()}</td>
                  <td className="px-5 py-4">
                    {p.archived ? (
                      <span className="text-xs text-muted-foreground">Archived</span>
                    ) : (
                      <span className="text-xs text-primary">Active</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex gap-1">
                      <button onClick={() => openEdit(p)} className="p-2 hover:bg-secondary rounded-lg" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleArchive(p)}
                        className="p-2 hover:bg-secondary rounded-lg"
                        title={p.archived ? "Restore" : "Archive"}
                      >
                        {p.archived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                      </button>
                      <button onClick={() => remove(p.id)} className="p-2 hover:bg-destructive/20 rounded-lg text-destructive" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visibleItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-muted-foreground">
                    {items.length === 0
                      ? "No platforms yet."
                      : query
                        ? `No platforms match "${query}".`
                        : `No ${statusFilter} platforms.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 relative"
          >
            <button onClick={close} className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-lg">
              <X className="w-4 h-4" />
            </button>
            <h2 className="font-serif text-2xl rose-text">
              {editing.new ? "New Platform" : `Edit ${editing.name}`}
            </h2>

            <div className="mt-6">
              <ImageUploader
                bucket="platform-logos"
                value={form.logo_url}
                onChange={(url) => setForm({ ...form, logo_url: url })}
                label="Platform Logo"
                prefix="logos"
              />
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ["name", "Name"],
                ["slug", "Slug"],
                ["tagline", "Tagline"],
                ["genres", "Genres (comma separated)"],
                ["contract_types", "Contract types (comma separated)"],
                ["application_link", "Application Link"],
                ["referral_code", "Referral Code"],
                ["referral_link", "Referral Link"],
                ["exclusive_bonus", "AE Exclusive Bonus ($) — private", "number"],
                ["nonexclusive_bonus", "AE Non-Exclusive Bonus ($) — private", "number"],
                ["min_word_count", "Min Word Count", "number"],
                ["update_expectations", "Update Expectations"],
              ].map(([k, l, type]) => (
                <div key={k as string}>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">{l}</label>
                  <input
                    type={(type as string) || "text"}
                    value={form[k as string] ?? ""}
                    onChange={(e) => setForm({ ...form, [k as string]: e.target.value })}
                    className="mt-2 w-full rounded-xl bg-secondary border border-border px-3 py-2"
                  />
                </div>
              ))}
            </div>

            {[
              ["description", "Description"],
              ["requirements", "Requirements"],
              ["monetization_details", "Monetization Details"],
              ["exclusive_benefits", "Exclusive Benefits"],
              ["nonexclusive_benefits", "Non-Exclusive Benefits"],
              ["signing_bonus_requirements", "Signing Bonus Requirements"],
              ["mab_details", "MAB Details"],
              ["mab_requirements", "MAB Requirements"],
              ["application_instructions", "Application Instructions"],
              ["referral_instructions", "Referral Instructions"],
            ].map(([k, l]) => (
              <div key={k} className="mt-4">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">{l}</label>
                <textarea
                  rows={3}
                  value={form[k] ?? ""}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  className="mt-2 w-full rounded-xl bg-secondary border border-border px-3 py-2"
                />
              </div>
            ))}

            <div className="mt-8 rounded-2xl border border-border/40 bg-background/30 overflow-hidden">
              <button
                type="button"
                onClick={() => setSeSectionOpen((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-primary">Senior Editor delivery</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Controls what an AE drafts when sending this platform's submissions to its Senior Editor.
                  </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${seSectionOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence initial={false}>
                {seSectionOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-1 space-y-5 border-t border-border/30">
                      <div className="grid sm:grid-cols-2 gap-4 pt-4">
                        <div>
                          <label className="text-xs uppercase tracking-widest text-muted-foreground">Senior Editor name</label>
                          <input
                            value={form.senior_editor_name ?? ""}
                            onChange={(e) => setForm({ ...form, senior_editor_name: e.target.value })}
                            className="mt-2 w-full rounded-xl bg-secondary border border-border px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-widest text-muted-foreground">Senior Editor email</label>
                          <input
                            type="email"
                            value={form.senior_editor_email ?? ""}
                            onChange={(e) => setForm({ ...form, senior_editor_email: e.target.value })}
                            className="mt-2 w-full rounded-xl bg-secondary border border-border px-3 py-2"
                            placeholder="editor@platform.com"
                          />
                          <p className="mt-1.5 text-xs text-muted-foreground">
                            Used when an AE drafts selected submissions for this platform.
                          </p>
                          {!form.senior_editor_email?.trim() && (
                            <p className="mt-1 text-xs text-primary/80">
                              Send to SE will be unavailable until an email is added.
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs uppercase tracking-widest text-muted-foreground">
                          Include in each submission summary
                        </label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {SE_EMAIL_FIELD_OPTIONS.map((opt) => {
                            const checked = (form.se_email_fields ?? []).includes(opt.key);
                            return (
                              <label
                                key={opt.key}
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs cursor-pointer transition-colors ${
                                  checked
                                    ? "border-primary/50 bg-primary/15 text-foreground"
                                    : "border-border/50 text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={(v) => {
                                    const current: SeEmailFieldKey[] = form.se_email_fields ?? [];
                                    const next = v
                                      ? [...current, opt.key]
                                      : current.filter((k: SeEmailFieldKey) => k !== opt.key);
                                    setForm({ ...form, se_email_fields: next });
                                  }}
                                  className="h-3.5 w-3.5"
                                />
                                {opt.label}
                              </label>
                            );
                          })}
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Internal AE notes are never included, no matter what's selected here.
                        </p>
                      </div>

                      <div>
                        <label className="text-xs uppercase tracking-widest text-muted-foreground">Email subject template</label>
                        <input
                          value={form.se_email_subject_template ?? ""}
                          onChange={(e) => setForm({ ...form, se_email_subject_template: e.target.value })}
                          className="mt-2 w-full rounded-xl bg-secondary border border-border px-3 py-2 text-sm"
                          placeholder={DEFAULT_SUBJECT_TEMPLATE}
                        />
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          Supports <code>{"{platform_name}"}</code> and <code>{"{submission_count}"}</code>. Leave blank to use the default.
                        </p>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs uppercase tracking-widest text-muted-foreground">Introduction to SE (optional)</label>
                          <textarea
                            rows={3}
                            value={form.se_email_intro ?? ""}
                            onChange={(e) => setForm({ ...form, se_email_intro: e.target.value })}
                            className="mt-2 w-full rounded-xl bg-secondary border border-border px-3 py-2 text-sm"
                            placeholder="A short note shown near the top of the email."
                          />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-widest text-muted-foreground">Custom note (optional)</label>
                          <textarea
                            rows={3}
                            value={form.se_email_custom_note ?? ""}
                            onChange={(e) => setForm({ ...form, se_email_custom_note: e.target.value })}
                            className="mt-2 w-full rounded-xl bg-secondary border border-border px-3 py-2 text-sm"
                            placeholder="Platform-specific instructions, shown after the submissions."
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-8">
              <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Onboarding Gallery</p>
              <p className="text-xs text-muted-foreground mb-4">
                Upload up to 4 process images. Authors see them as a cinematic gallery on this platform's page.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((n) => (
                  <ImageUploader
                    key={n}
                    bucket="platform-logos"
                    value={form[`process_image_${n}`]}
                    onChange={(url) => setForm({ ...form, [`process_image_${n}`]: url })}
                    label={`Step ${n}`}
                    prefix="process"
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={close} className="px-5 py-2.5 rounded-full border border-border text-sm">Cancel</button>
              <button
                onClick={save}
                disabled={saving}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-primary to-blush-glow text-primary-foreground text-sm font-medium flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {importModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-3xl w-full max-w-md p-7 relative"
          >
            <button
              onClick={() => { if (!importing) { setImportModal(false); setCsvFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; } }}
              className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
            <h2 className="font-serif text-2xl rose-text">Import Platforms</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Upload a filled CSV or Excel (.xlsx) file to bulk-add platforms. Download a template to get started.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={downloadTemplate}
                className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-full border border-border hover:bg-secondary/60 text-muted-foreground"
              >
                <FileDown className="w-3.5 h-3.5" /> CSV Template
              </button>
              <button
                type="button"
                onClick={downloadXlsxTemplate}
                className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-full border border-border hover:bg-secondary/60 text-muted-foreground"
              >
                <FileDown className="w-3.5 h-3.5" /> Excel Template
              </button>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files[0];
                if (f) setCsvFile(f);
              }}
              className="mt-5 flex flex-col items-center justify-center gap-3 cursor-pointer rounded-2xl border-2 border-dashed rose-border p-8 text-center hover:bg-secondary/60 transition-colors"
            >
              <Upload className="w-6 h-6 text-primary" />
              <span className="text-sm text-muted-foreground">
                Drop your CSV or Excel file here, or <span className="rose-text underline">click to browse</span>
              </span>
              <span className="text-xs text-muted-foreground/60">Supports .csv, .xlsx, .xls</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setCsvFile(f);
                e.target.value = "";
              }}
            />
            {csvFile && (
              <p className="mt-3 text-xs text-muted-foreground truncate">
                Selected: <span className="rose-text">{csvFile.name}</span>
              </p>
            )}
            {importing && (
              <p className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Importing platforms…
              </p>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => { if (!importing) { setImportModal(false); setCsvFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; } }}
                disabled={importing}
                className="px-5 py-2.5 rounded-full border border-border text-sm"
              >
                Cancel
              </button>
              <button
                onClick={runImport}
                disabled={importing || !csvFile}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-primary to-blush-glow text-primary-foreground text-sm font-medium flex items-center gap-2 disabled:opacity-60"
              >
                {importing && <Loader2 className="w-4 h-4 animate-spin" />}
                Import
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
