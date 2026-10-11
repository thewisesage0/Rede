ALTER TABLE public.platforms 
  ADD COLUMN IF NOT EXISTS senior_editor_name text,
  ADD COLUMN IF NOT EXISTS mab_details text,
  ADD COLUMN IF NOT EXISTS mab_requirements text,
  ADD COLUMN IF NOT EXISTS signing_bonus_requirements text,
  ADD COLUMN IF NOT EXISTS application_instructions text,
  ADD COLUMN IF NOT EXISTS referral_instructions text,
  ADD COLUMN IF NOT EXISTS process_images jsonb NOT NULL DEFAULT '[]'::jsonb;