import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ExternalLink, ChevronDown, Mail, X, AlertTriangle, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  sanitizeSeEmailFields,
  buildSubject,
  buildEmailBody,
  openSeDraft,
} from "@/lib/se-email";

export const Route = createFileRoute("/_authenticated/admin/submissions")({
  component: SubmissionsAdmin,
});

const STATUSES = [
  "pending",
  "under_review",
  "contacted",
  "forwarded",
  "exclusive_signed",
  "nonexclusive_signed",
  "rejected",
] as const;
type Status = (typeof STATUSES)[number];

const UNASSIGNED_KEY = "__unassigned__";

function SubmissionsAdmin() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailRow, setDetailRow] = useState<any | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [missingPlatforms, setMissingPlatforms] = useState<any[] | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: subs }, { data: plats }] = await Promise.all([
      supabase.from("submissions").select("*, platforms(name, slug)").order("created_at", { ascending: false }),
      supabase.from("platforms").select("*"),
    ]);
    setRows(subs ?? []);
    setPlatforms(plats ?? []);
    setLoading(false);
  };
  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const platformMap = useMemo(() => new Map(platforms.map((p) => [p.id, p])), [platforms]);

  const byStatus = filter === "all" ? rows : rows.filter((r) => r.status === filter);
  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!q) return byStatus;
    return byStatus.filter((r) =>
      [r.author_name, r.pen_name, r.novel_title, r.email]
        .filter(Boolean)
        .some((field: string) => field.toLowerCase().includes(q))
    );
  }, [byStatus, q]);

  // Group filtered submissions by platform. Unassigned last.
  const groups = useMemo(() => {
    const map = new Map<string, any[]>();
    filtered.forEach((r) => {
      const key = r.platform_id ?? UNASSIGNED_KEY;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });
    const entries = Array.from(map.entries());
    entries.sort((a, b) => {
      if (a[0] === UNASSIGNED_KEY) return 1;
      if (b[0] === UNASSIGNED_KEY) return -1;
      const an = platformMap.get(a[0])?.name ?? "";
      const bn = platformMap.get(b[0])?.name ?? "";
      return an.localeCompare(bn);
    });
    return entries;
  }, [filtered, platformMap]);

  if (authLoading) return null;
  if (!isAdmin)
    return (
      <div className="max-w-2xl mx-auto glass-strong rounded-2xl p-10 text-center">
        <h1 className="font-serif text-2xl">Restricted</h1>
      </div>
    );

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("submissions").update({ status: status as Status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status updated");
    load();
    if (detailRow?.id === id) setDetailRow({ ...detailRow, status });
  };

  const updatePlatform = async (id: string, platform_id: string) => {
    const { error } = await supabase.from("submissions").update({ platform_id: platform_id || null }).eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const saveNotes = async (id: string, internal_notes: string) => {
    const { error } = await supabase.from("submissions").update({ internal_notes }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Notes saved");
  };

  const visibleIds = new Set(filtered.map((r) => r.id));
  const activeSelectedIds = Array.from(selectedIds).filter((id) => visibleIds.has(id));
  const selectedRows = filtered.filter((r) => selectedIds.has(r.id));
  const selectedPlatformIds = Array.from(new Set(selectedRows.map((r) => r.platform_id).filter(Boolean)));

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGroupAll = (subs: any[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = subs.every((s) => next.has(s.id));
      subs.forEach((s) => (allSelected ? next.delete(s.id) : next.add(s.id)));
      return next;
    });
  };

  const toggleGroupCollapsed = (key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setMissingPlatforms(null);
  };

  // Must run synchronously inside the click handler (no awaits before
  // window.open) so browsers don't treat the popups as unsolicited.
  const handleSendToSe = () => {
    const byPlatform = new Map<string, any[]>();
    selectedRows.forEach((row) => {
      if (!row.platform_id) return;
      if (!byPlatform.has(row.platform_id)) byPlatform.set(row.platform_id, []);
      byPlatform.get(row.platform_id)!.push(row);
    });

    const missing: any[] = [];
    const ready: { platform: any; subs: any[] }[] = [];
    byPlatform.forEach((subs, platformId) => {
      const platform = platformMap.get(platformId);
      if (!platform) return;
      if (!platform.senior_editor_email) {
        missing.push(platform);
      } else {
        ready.push({ platform, subs });
      }
    });

    ready.forEach(({ platform, subs }) => {
      const fields = sanitizeSeEmailFields(platform.se_email_fields);
      const subject = buildSubject(platform.se_email_subject_template, platform.name, subs.length);
      const body = buildEmailBody({
        seniorEditorName: platform.senior_editor_name,
        platformName: platform.name,
        intro: platform.se_email_intro,
        customNote: platform.se_email_custom_note,
        submissions: subs,
        fields,
      });
      openSeDraft({ to: platform.senior_editor_email, subject, body });
    });

    if (missing.length) {
      setMissingPlatforms(missing);
      toast.error(
        `${missing.length} platform${missing.length > 1 ? "s need" : " needs"} a Senior Editor email before it can be sent.`
      );
      // Keep only the submissions belonging to platforms still missing an
      // email selected, so the AE can fix it and retry the rest.
      const missingIds = new Set(missing.map((p) => p.id));
      setSelectedIds(new Set(selectedRows.filter((r) => missingIds.has(r.platform_id)).map((r) => r.id)));
    } else if (ready.length) {
      toast.success(`Opened ${ready.length} Gmail draft${ready.length > 1 ? "s" : ""}`);
      clearSelection();
    }
  };

  const actionLabel =
    selectedPlatformIds.length <= 1
      ? `Send ${activeSelectedIds.length} to SE`
      : "Draft emails for SEs";

  return (
    <div className="max-w-7xl mx-auto pb-24">
      <p className="text-xs uppercase tracking-[0.3em] text-primary">Editorial</p>
      <h1 className="font-serif text-4xl mt-2">Submissions</h1>

      <div className="mt-6 relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by author, pen name, title, or email…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-transparent text-sm focus:outline-none focus:border-primary/40 focus:bg-white transition-colors"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-widest transition-colors ${
              filter === s
                ? "bg-primary/20 text-foreground border border-primary/40"
                : "border border-border/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {missingPlatforms && missingPlatforms.length > 0 && (
        <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-foreground">
                {missingPlatforms.length === 1 ? "This platform needs" : "These platforms need"} a Senior Editor
                email before submissions can be sent:
              </p>
              <ul className="mt-2 space-y-1">
                {missingPlatforms.map((p) => (
                  <li key={p.id} className="text-sm flex items-center gap-2">
                    <span className="text-muted-foreground">{p.name}</span>
                    <Link
                      to="/admin/platforms"
                      className="text-xs text-primary hover:underline"
                    >
                      Add email →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <button onClick={() => setMissingPlatforms(null)} className="p-1 hover:bg-secondary rounded-lg shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-5">
        {loading ? (
          <div className="p-10 flex justify-center glass rounded-2xl">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : groups.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground glass rounded-2xl">
            {rows.length === 0
              ? "No submissions yet."
              : query
                ? <>No submissions match "{query}".</>
                : "No submissions with this status."}
          </div>
        ) : (
          groups.map(([key, subs]) => {
            const isUnassigned = key === UNASSIGNED_KEY;
            const platform = isUnassigned ? null : platformMap.get(key);
            const allSelected = subs.length > 0 && subs.every((s) => selectedIds.has(s.id));
            const someSelected = !allSelected && subs.some((s) => selectedIds.has(s.id));
            const collapsed = collapsedGroups.has(key);

            return (
              <div key={key} className="glass rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border/30">
                  <div className="flex items-center gap-3 min-w-0">
                    {!isUnassigned && (
                      <Checkbox
                        checked={allSelected ? true : someSelected ? "indeterminate" : false}
                        onCheckedChange={() => toggleGroupAll(subs)}
                        aria-label={`Select all submissions for ${platform?.name ?? "platform"}`}
                      />
                    )}
                    <button
                      onClick={() => toggleGroupCollapsed(key)}
                      className="flex items-center gap-2 min-w-0"
                    >
                      <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${collapsed ? "-rotate-90" : ""}`} />
                      <div className="min-w-0 text-left">
                        <div className="font-serif text-lg truncate">
                          {isUnassigned ? "Unassigned" : platform?.name ?? "Unknown platform"}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {subs.length} submission{subs.length === 1 ? "" : "s"}
                          {!isUnassigned && platform?.senior_editor_name ? ` · SE: ${platform.senior_editor_name}` : ""}
                        </div>
                      </div>
                    </button>
                  </div>
                  {!isUnassigned && !platform?.senior_editor_email && (
                    <Link
                      to="/admin/platforms"
                      className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary shrink-0"
                    >
                      No SE email set →
                    </Link>
                  )}
                </div>

                {!collapsed && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[640px]">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground border-b border-border/20">
                          {!isUnassigned && <th className="px-5 py-3 w-10"></th>}
                          <th className="px-5 py-3">Novel</th>
                          <th className="px-5 py-3">Author</th>
                          <th className="px-5 py-3">Genre</th>
                          {isUnassigned && <th className="px-5 py-3">Platform</th>}
                          <th className="px-5 py-3">Status</th>
                          <th className="px-5 py-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {subs.map((r) => (
                          <tr key={r.id} className="border-b border-border/10 hover:bg-secondary/60">
                            {!isUnassigned && (
                              <td className="px-5 py-3">
                                <Checkbox
                                  checked={selectedIds.has(r.id)}
                                  onCheckedChange={() => toggleRow(r.id)}
                                  aria-label={`Select ${r.novel_title}`}
                                />
                              </td>
                            )}
                            <td className="px-5 py-3 font-medium">{r.novel_title}</td>
                            <td className="px-5 py-3 text-muted-foreground">
                              {r.pen_name || r.author_name}
                              <div className="text-xs">{r.email}</div>
                            </td>
                            <td className="px-5 py-3 text-muted-foreground">{r.genre ?? "—"}</td>
                            {isUnassigned && (
                              <td className="px-5 py-3">
                                <select
                                  value={r.platform_id ?? ""}
                                  onChange={(e) => updatePlatform(r.id, e.target.value)}
                                  className="bg-secondary border border-border rounded-lg px-2 py-1 text-xs"
                                >
                                  <option value="">Unassigned</option>
                                  {platforms.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                  ))}
                                </select>
                              </td>
                            )}
                            <td className="px-5 py-3">
                              <select
                                value={r.status}
                                onChange={(e) => updateStatus(r.id, e.target.value)}
                                className="bg-secondary border border-border rounded-lg px-2 py-1 text-xs"
                              >
                                {STATUSES.map((s) => (
                                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-5 py-3 text-right whitespace-nowrap">
                              <button onClick={() => setDetailRow(r)} className="text-xs text-primary hover:underline">
                                Details →
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {activeSelectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 glass-strong rounded-full pl-5 pr-2 py-2 flex items-center gap-4 shadow-[var(--shadow-rose)] border border-primary/20"
          >
            <span className="text-sm text-foreground whitespace-nowrap">
              {activeSelectedIds.length} selected
              {selectedPlatformIds.length > 1 ? ` across ${selectedPlatformIds.length} platforms` : ""}
            </span>
            <button onClick={clearSelection} className="text-xs text-muted-foreground hover:text-foreground">
              Clear
            </button>
            <button
              onClick={handleSendToSe}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-blush-glow text-primary-foreground px-5 py-2 text-sm font-medium"
            >
              <Mail className="w-3.5 h-3.5" />
              {actionLabel}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {detailRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setDetailRow(null)}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8"
          >
            <h2 className="font-serif text-2xl rose-text">{detailRow.novel_title}</h2>
            <div className="text-sm text-muted-foreground mt-1">
              by {detailRow.pen_name || detailRow.author_name} · {detailRow.email}
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-xs uppercase tracking-widest text-muted-foreground">Genre</dt><dd>{detailRow.genre ?? "—"}</dd></div>
              <div><dt className="text-xs uppercase tracking-widest text-muted-foreground">Word Count</dt><dd>{detailRow.word_count?.toLocaleString() ?? "—"}</dd></div>
              <div><dt className="text-xs uppercase tracking-widest text-muted-foreground">Contract Pref</dt><dd>{detailRow.contract_type ?? "—"}</dd></div>
              <div><dt className="text-xs uppercase tracking-widest text-muted-foreground">Contact Method</dt><dd>{detailRow.preferred_contact_method ?? "—"}</dd></div>
              <div><dt className="text-xs uppercase tracking-widest text-muted-foreground">Contact Info</dt><dd>{detailRow.contact_info ?? "—"}</dd></div>
              <div><dt className="text-xs uppercase tracking-widest text-muted-foreground">Readership / Performance</dt><dd>{detailRow.reader_traction ?? "—"}</dd></div>
            </dl>

            {detailRow.book_links && (
              <div className="mt-4">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Links</div>
                <div className="mt-1 text-sm whitespace-pre-line">{detailRow.book_links}</div>
              </div>
            )}
            {detailRow.notes && (
              <div className="mt-4">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Author Notes</div>
                <div className="mt-1 text-sm">{detailRow.notes}</div>
              </div>
            )}
            {detailRow.proof_url && (
              <a href={detailRow.proof_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm text-primary">
                View proof <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <div className="mt-6">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Internal Notes</label>
              <textarea
                rows={4}
                defaultValue={detailRow.internal_notes ?? ""}
                onBlur={(e) => saveNotes(detailRow.id, e.target.value)}
                className="mt-2 w-full rounded-xl bg-secondary border border-border px-3 py-2 text-sm"
              />
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={() => setDetailRow(null)} className="px-5 py-2.5 rounded-full border border-border text-sm">Close</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
