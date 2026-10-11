
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles self read" ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE POLICY "user_roles self read" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Auto-create profile + assign admin role to designated email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email) VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  IF NEW.email = 'thesage196@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Platforms
CREATE TABLE public.platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tagline TEXT,
  description TEXT,
  logo_url TEXT,
  genres TEXT[] NOT NULL DEFAULT '{}',
  contract_types TEXT[] NOT NULL DEFAULT '{}',
  application_link TEXT,
  referral_code TEXT,
  referral_link TEXT,
  onboarding_steps JSONB NOT NULL DEFAULT '[]',
  exclusive_bonus NUMERIC NOT NULL DEFAULT 0,
  nonexclusive_bonus NUMERIC NOT NULL DEFAULT 0,
  min_word_count INTEGER,
  update_expectations TEXT,
  requirements TEXT,
  monetization_details TEXT,
  exclusive_benefits TEXT,
  nonexclusive_benefits TEXT,
  faq JSONB NOT NULL DEFAULT '[]',
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active platforms" ON public.platforms FOR SELECT USING (archived = false OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin manage platforms" ON public.platforms FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Submissions
CREATE TYPE public.submission_status AS ENUM ('pending','contacted','forwarded','under_review','exclusive_signed','nonexclusive_signed','rejected');

CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  pen_name TEXT,
  email TEXT NOT NULL,
  platform_id UUID REFERENCES public.platforms(id) ON DELETE SET NULL,
  novel_title TEXT NOT NULL,
  genre TEXT,
  word_count INTEGER,
  contract_type TEXT,
  preferred_contact_method TEXT,
  contact_info TEXT,
  book_links TEXT,
  notes TEXT,
  proof_url TEXT,
  status submission_status NOT NULL DEFAULT 'pending',
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit" ON public.submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "admin read submissions" ON public.submissions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin update submissions" ON public.submissions FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete submissions" ON public.submissions FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Contracts
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  final_contract_type TEXT NOT NULL,
  ae_earning NUMERIC NOT NULL DEFAULT 0,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin all contracts" ON public.contracts FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auto-create contract + earnings when submission marked signed
CREATE OR REPLACE FUNCTION public.handle_submission_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  p RECORD;
  earning NUMERIC := 0;
  ctype TEXT := NULL;
BEGIN
  IF NEW.status = OLD.status THEN RETURN NEW; END IF;
  IF NEW.status IN ('exclusive_signed','nonexclusive_signed') THEN
    SELECT exclusive_bonus, nonexclusive_bonus INTO p FROM public.platforms WHERE id = NEW.platform_id;
    IF NEW.status = 'exclusive_signed' THEN
      earning := COALESCE(p.exclusive_bonus, 0);
      ctype := 'exclusive';
    ELSE
      earning := COALESCE(p.nonexclusive_bonus, 0);
      ctype := 'non-exclusive';
    END IF;
    INSERT INTO public.contracts (submission_id, final_contract_type, ae_earning)
    VALUES (NEW.id, ctype, earning);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_submission_status AFTER UPDATE ON public.submissions
FOR EACH ROW EXECUTE FUNCTION public.handle_submission_status_change();

-- Recommendations
CREATE TABLE public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_session TEXT,
  answers JSONB NOT NULL DEFAULT '{}',
  recommended_platform UUID REFERENCES public.platforms(id) ON DELETE SET NULL,
  suitability_score INTEGER,
  recommendation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone insert reco" ON public.recommendations FOR INSERT WITH CHECK (true);
CREATE POLICY "admin read reco" ON public.recommendations FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger helper
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER tg_platforms_updated BEFORE UPDATE ON public.platforms FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER tg_submissions_updated BEFORE UPDATE ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Storage bucket for proof screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('proofs', 'proofs', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "anyone upload proofs" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'proofs');
CREATE POLICY "public read proofs" ON storage.objects FOR SELECT
USING (bucket_id = 'proofs');

-- Platform logos bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('platform-logos', 'platform-logos', true)
ON CONFLICT (id) DO NOTHING;
CREATE POLICY "admin upload logos" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'platform-logos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "public read logos" ON storage.objects FOR SELECT
USING (bucket_id = 'platform-logos');
