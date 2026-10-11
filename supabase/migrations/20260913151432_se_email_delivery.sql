-- Senior Editor email delivery configuration for platforms, plus an optional
-- reader-traction field on submissions. This only supports drafting Gmail
-- compose links client-side; no email is ever sent by the backend.

ALTER TABLE public.platforms
  ADD COLUMN IF NOT EXISTS senior_editor_email text,
  ADD COLUMN IF NOT EXISTS se_email_fields jsonb NOT NULL DEFAULT '[
    "novel_title",
    "pen_name",
    "genre",
    "contract_type",
    "reader_traction",
    "book_links"
  ]'::jsonb,
  ADD COLUMN IF NOT EXISTS se_email_subject_template text,
  ADD COLUMN IF NOT EXISTS se_email_intro text,
  ADD COLUMN IF NOT EXISTS se_email_custom_note text;

ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS reader_traction text;
