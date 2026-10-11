
-- Slug auto-generation + uniqueness for platforms
CREATE OR REPLACE FUNCTION public.slugify(input text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT trim(both '-' from regexp_replace(
    regexp_replace(lower(trim(coalesce(input,''))), '[^a-z0-9]+', '-', 'g'),
    '-+', '-', 'g'
  ));
$$;

CREATE OR REPLACE FUNCTION public.platforms_set_slug()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  base text;
  candidate text;
  n int := 1;
BEGIN
  IF NEW.slug IS NULL OR length(trim(NEW.slug)) = 0 THEN
    base := public.slugify(NEW.name);
  ELSE
    base := public.slugify(NEW.slug);
  END IF;
  IF base IS NULL OR base = '' THEN
    base := 'platform';
  END IF;
  candidate := base;
  WHILE EXISTS (SELECT 1 FROM public.platforms WHERE slug = candidate AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
    n := n + 1;
    candidate := base || '-' || n;
  END LOOP;
  NEW.slug := candidate;
  NEW.name := trim(NEW.name);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_platforms_set_slug ON public.platforms;
CREATE TRIGGER trg_platforms_set_slug
BEFORE INSERT OR UPDATE OF name, slug ON public.platforms
FOR EACH ROW EXECUTE FUNCTION public.platforms_set_slug();

-- Normalize current rows
UPDATE public.platforms SET name = trim(name);

CREATE UNIQUE INDEX IF NOT EXISTS platforms_slug_unique ON public.platforms(slug);
