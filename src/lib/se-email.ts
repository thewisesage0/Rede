import { AE_NAME } from "@/lib/site-config";
// Shared config + helpers for the "Send to SE" workflow.
//
// This module never sends email. It only builds a Gmail compose URL (and a
// mailto: fallback) that opens a prefilled draft in the AE's own browser.
// Opening a compose window is not proof the AE ever hit send, so nothing
// here should be used to mark a submission as "forwarded".

export type SeEmailFieldKey =
  | "novel_title"
  | "pen_name"
  | "genre"
  | "word_count"
  | "contract_type"
  | "contact_info"
  | "reader_traction"
  | "book_links"
  | "notes"
  | "proof_url";

export const SE_EMAIL_FIELD_OPTIONS: { key: SeEmailFieldKey; label: string }[] = [
  { key: "novel_title", label: "Novel title" },
  { key: "pen_name", label: "Author / pen name" },
  { key: "genre", label: "Genre" },
  { key: "word_count", label: "Word count" },
  { key: "contract_type", label: "Preferred contract type" },
  { key: "contact_info", label: "Author contact details" },
  { key: "reader_traction", label: "Readership / performance details" },
  { key: "book_links", label: "Best-performing-book links" },
  { key: "notes", label: "Author notes" },
  { key: "proof_url", label: "Proof link" },
];

export const DEFAULT_SE_EMAIL_FIELDS: SeEmailFieldKey[] = [
  "novel_title",
  "pen_name",
  "genre",
  "contract_type",
  "reader_traction",
  "book_links",
];

export const DEFAULT_SUBJECT_TEMPLATE = "{platform_name}: {submission_count} submission(s) for review";

// Internal-only fields that must never appear in an SE email regardless of
// what's stored in se_email_fields (defense in depth against bad data).
const NEVER_INCLUDE: SeEmailFieldKey[] = [];
const INTERNAL_ONLY_KEYS = new Set(["internal_notes"]);

export function sanitizeSeEmailFields(raw: unknown): SeEmailFieldKey[] {
  if (!Array.isArray(raw)) return [...DEFAULT_SE_EMAIL_FIELDS];
  const valid = new Set(SE_EMAIL_FIELD_OPTIONS.map((f) => f.key));
  const cleaned = raw.filter(
    (v): v is SeEmailFieldKey => typeof v === "string" && valid.has(v as SeEmailFieldKey) && !INTERNAL_ONLY_KEYS.has(v)
  );
  return cleaned.length ? cleaned : [...DEFAULT_SE_EMAIL_FIELDS];
}

export function buildSubject(template: string | null | undefined, platformName: string, count: number): string {
  const t = template && template.trim() ? template : DEFAULT_SUBJECT_TEMPLATE;
  return t
    .replaceAll("{platform_name}", platformName)
    .replaceAll("{submission_count}", String(count));
}

export interface SeSubmissionLike {
  novel_title: string;
  author_name: string;
  pen_name: string | null;
  genre: string | null;
  word_count: number | null;
  contract_type: string | null;
  contact_info: string | null;
  preferred_contact_method: string | null;
  email: string;
  reader_traction: string | null;
  book_links: string | null;
  notes: string | null;
  proof_url: string | null;
}

function fieldLine(key: SeEmailFieldKey, s: SeSubmissionLike): string | null {
  switch (key) {
    case "novel_title":
      return null; // used as the numbered heading, not a body line
    case "pen_name": {
      const hasBoth = s.pen_name && s.author_name && s.pen_name !== s.author_name;
      if (hasBoth) return `Author: ${s.pen_name} (legal name: ${s.author_name})`;
      if (s.pen_name) return `Author: ${s.pen_name}`;
      if (s.author_name) return `Author: ${s.author_name}`;
      return null;
    }
    case "genre":
      return s.genre ? `Genre: ${s.genre}` : null;
    case "word_count":
      return s.word_count ? `Word count: ${s.word_count.toLocaleString()}` : null;
    case "contract_type":
      return s.contract_type ? `Preferred contract: ${s.contract_type}` : null;
    case "contact_info": {
      const method = s.preferred_contact_method ? `${s.preferred_contact_method}: ` : "";
      const contact = s.contact_info ? `${method}${s.contact_info}` : "";
      const parts = [contact, s.email].filter(Boolean);
      return parts.length ? `Contact: ${parts.join(" · ")}` : null;
    }
    case "reader_traction":
      return s.reader_traction ? `Readership / performance: ${s.reader_traction}` : null;
    case "book_links":
      return s.book_links ? `Best-performing-book links: ${s.book_links.replace(/\n+/g, ", ")}` : null;
    case "notes":
      return s.notes ? `Author notes: ${s.notes}` : null;
    case "proof_url":
      return s.proof_url ? `Proof: ${s.proof_url}` : null;
    default:
      return null;
  }
}

export function buildSubmissionBlock(index: number, s: SeSubmissionLike, fields: SeEmailFieldKey[]): string {
  const heading = `${index}. ${s.novel_title || "Untitled"}`;
  const lines = fields
    .filter((f) => !NEVER_INCLUDE.includes(f))
    .map((f) => fieldLine(f, s))
    .filter((l): l is string => Boolean(l))
    .map((l) => `   ${l}`);
  return [heading, ...lines].join("\n");
}

export function buildEmailBody(opts: {
  seniorEditorName: string | null;
  platformName: string;
  intro: string | null;
  customNote: string | null;
  submissions: SeSubmissionLike[];
  fields: SeEmailFieldKey[];
}): string {
  const { seniorEditorName, platformName, intro, customNote, submissions, fields } = opts;
  const greetingName = seniorEditorName?.trim() || "there";
  const count = submissions.length;

  const parts: string[] = [];
  parts.push(`Hi ${greetingName},`);
  if (intro && intro.trim()) parts.push(intro.trim());
  parts.push(
    `I'm sharing the following submission${count === 1 ? "" : "s"} for ${platformName}:`
  );
  parts.push(
    submissions.map((s, i) => buildSubmissionBlock(i + 1, s, fields)).join("\n\n")
  );
  if (customNote && customNote.trim()) parts.push(customNote.trim());
  parts.push(`Best,\n${AE_NAME}\nAcquisition Editor`);

  return parts.join("\n\n");
}

export function buildGmailComposeUrl(opts: { to: string; subject: string; body: string }): string {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: opts.to,
    su: opts.subject,
    body: opts.body,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

export function buildMailtoUrl(opts: { to: string; subject: string; body: string }): string {
  const params = new URLSearchParams({
    subject: opts.subject,
    body: opts.body,
  });
  return `mailto:${encodeURIComponent(opts.to)}?${params.toString()}`;
}

// Opens a Gmail compose window; if popups are blocked, falls back to mailto:
// in the same tab context. Must be called synchronously from a click handler.
export function openSeDraft(opts: { to: string; subject: string; body: string }): void {
  const gmailUrl = buildGmailComposeUrl(opts);
  const win = window.open(gmailUrl, "_blank", "noopener,noreferrer");
  if (!win) {
    window.location.href = buildMailtoUrl(opts);
  }
}
