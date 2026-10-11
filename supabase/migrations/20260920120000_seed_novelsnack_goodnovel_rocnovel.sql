-- Seeds the three platforms Kyef (AE) currently onboards authors to:
-- Novelsnack, GoodNovel and ROCNOVEL.
--
-- Source: "Author Application Guide" (NOVELSNACK • GOODNOVEL • ROCNOVEL).
--
-- Safe to run more than once: each platform is inserted only if its slug is
-- missing, then its details are (re)written. Re-running refreshes these three
-- rows, so it will overwrite any edits made to them in the admin panel.
--
-- Not filled in on purpose (the guide doesn't say): logos, genres, contract
-- types, bonuses, and each Senior Editor's email. Add those in
-- Admin -> Platforms. Bonuses stay at 0 until you enter your real amounts.

-- ---------------------------------------------------------------------------
-- 1. NOVELSNACK  (SE Kate)
-- ---------------------------------------------------------------------------
INSERT INTO public.platforms (name, slug)
SELECT 'Novelsnack', 'novelsnack'
WHERE NOT EXISTS (SELECT 1 FROM public.platforms WHERE slug = 'novelsnack');

UPDATE public.platforms SET
  tagline = 'Apply with 3,000 words',
  description = $t$Apply to Novelsnack through Kyef. Upload 3,000 words, use the invitation code below, and tell Novelsnack how you heard about it. The exact steps are listed below.$t$,
  application_link = 'https://www.novelsnack.com',
  referral_link = NULL,
  referral_code = 'MBWv7UEA',
  referral_instructions = $t$Enter this invitation code in the Invitation section while applying.

In "How did you hear about Novelsnack?", select "Others" and type exactly: SE Kate and AE Kyef$t$,
  application_instructions = $t$Create an account on Novelsnack, upload your 3,000 words, then follow the steps below. After applying, send Kyef your book name and pen name.$t$,
  senior_editor_name = 'Kate',
  min_word_count = 3000,
  requirements = $t$3,000 words uploaded with your application.$t$,
  onboarding_steps = $j$[
    {"title": "Create your account", "description": "Create an account on the Novelsnack website: https://www.novelsnack.com"},
    {"title": "Upload your 3,000 words", "description": "Upload 3,000 words of your story."},
    {"title": "Say how you heard about Novelsnack", "description": "While applying, in \"How did you hear about Novelsnack?\", select \"Others\". In the text field, enter exactly: SE Kate and AE Kyef"},
    {"title": "Enter the invitation code", "description": "In the Invitation section, enter the invitation code shown in the Referral code box below."},
    {"title": "Send Kyef your book details", "description": "After applying, send your book name and pen name."},
    {"title": "Join the Authors WhatsApp group", "description": "Join for general information and updates: https://chat.whatsapp.com/JghEqDEIMXz0xR1G0HLuIW?mode=gi_t"}
  ]$j$::jsonb,
  faq = $j$[
    {"q": "What do I put in \"How did you hear about Novelsnack?\"", "a": "Select \"Others\", then type exactly: SE Kate and AE Kyef"},
    {"q": "What do I send after I apply?", "a": "Send your book name and pen name to Kyef."}
  ]$j$::jsonb,
  archived = false
WHERE slug = 'novelsnack';

-- ---------------------------------------------------------------------------
-- 2. GOODNOVEL  (SE Young)
-- ---------------------------------------------------------------------------
INSERT INTO public.platforms (name, slug)
SELECT 'GoodNovel', 'goodnovel'
WHERE NOT EXISTS (SELECT 1 FROM public.platforms WHERE slug = 'goodnovel');

UPDATE public.platforms SET
  tagline = 'Apply through Kyef''s sign-up link',
  description = $t$Apply to GoodNovel through Kyef's sign-up link. Use a brand-new account and email, add Kyef's co-editor code from your web profile, then upload your book and apply for a contract.$t$,
  application_link = 'https://www.goodnovel.com/arch/invite/MTQ4Mw%3D%3D',
  referral_link = 'https://www.goodnovel.com/arch/invite/MTQ4Mw%3D%3D',
  referral_code = 'inrYXEFk',
  referral_instructions = $t$This is the co-editor code. Right after signing up, open your web profile in a browser (not the app), go to the Co-editor bar/section, enter this code and save. It will save as kyef.$t$,
  application_instructions = $t$Use a NEW account and NEW email only, and create it through the sign-up link with the button below.

Right after signing up, add the co-editor code in your web profile (see the steps), then upload your book and apply for a contract.$t$,
  senior_editor_name = 'Young',
  requirements = $t$A new account and a new email only. The co-editor code must be added in a browser (not the app) immediately after signing up.$t$,
  onboarding_steps = $j$[
    {"title": "Use a new account and new email", "description": "Use a NEW account and NEW email only."},
    {"title": "Sign up through the link", "description": "Create your account through the sign-up link, using the Open application button below."},
    {"title": "Open your web profile right away", "description": "IMMEDIATELY after signing up, use a browser (not the app) and open your web profile."},
    {"title": "Find the Co-editor section", "description": "Go to the Co-editor bar/section. Tap the profile picture icon twice, enter the bio/gender area, and scroll to the bottom to find the Co-editor space."},
    {"title": "Enter the co-editor code", "description": "Enter the co-editor code shown in the Referral code box below and save it. It will save as kyef."},
    {"title": "Upload your book and apply", "description": "Upload your book and apply for a contract."},
    {"title": "Send Kyef your details", "description": "IMMEDIATELY after you are done, send your author ID, book name, contract type, and pen name."},
    {"title": "Join the Authors WhatsApp group", "description": "Join for general information and updates: https://chat.whatsapp.com/JghEqDEIMXz0xR1G0HLuIW?mode=gi_t"}
  ]$j$::jsonb,
  faq = $j$[
    {"q": "Can I use my existing GoodNovel account?", "a": "No. Use a new account and a new email only."},
    {"q": "Can I add the co-editor code in the app?", "a": "No. Use a browser (not the app) and open your web profile straight after signing up."},
    {"q": "What do I send once I've applied?", "a": "Immediately send your author ID, book name, contract type, and pen name."}
  ]$j$::jsonb,
  archived = false
WHERE slug = 'goodnovel';

-- ---------------------------------------------------------------------------
-- 3. ROCNOVEL  (SE Cecilia)
-- ---------------------------------------------------------------------------
INSERT INTO public.platforms (name, slug)
SELECT 'ROCNOVEL', 'rocnovel'
WHERE NOT EXISTS (SELECT 1 FROM public.platforms WHERE slug = 'rocnovel');

UPDATE public.platforms SET
  tagline = 'Female-lead romance · 5,000 words',
  description = $t$ROCNOVEL accepts stories with a female lead and romance. BL and male-lead stories are not accepted. You need 5,000 words to apply, and review takes 1 to 15 business days.$t$,
  application_link = 'https://author.xiaoyao.ai/stories',
  referral_link = NULL,
  referral_code = 'c5BAXtw9a8co9nIWy-f5',
  referral_instructions = $t$This is the AE code. Enter it in the AE Space.

If it doesn't work, make sure there are no spaces before or after the code.$t$,
  application_instructions = $t$In your book requirements/info, choose "recommended by the AE", enter the AE code in the AE Space, and choose Cecilia when asked for an SE.$t$,
  senior_editor_name = 'Cecilia',
  genres = ARRAY['Female lead romance'],
  min_word_count = 5000,
  requirements = $t$BL is not accepted.
Male lead is not accepted.
Other genres may be accepted, provided the story has a female lead and romance.
5,000 words are required to apply.
Review takes 1 to 15 business days.$t$,
  monetization_details = $t$Full writer benefits are listed on ROCNOVEL's writer benefits page: https://author.inkport.top/writer-benefits.html$t$,
  onboarding_steps = $j$[
    {"title": "Check your story qualifies", "description": "BL and male-lead stories are not accepted. Other genres may be accepted if the story has a female lead and romance. You need 5,000 words to apply."},
    {"title": "Open the application site", "description": "Visit the ROCNOVEL application site: https://author.xiaoyao.ai/stories"},
    {"title": "Choose \"recommended by the AE\"", "description": "In your book requirements/info, choose \"recommended by the AE\"."},
    {"title": "Enter the AE code", "description": "Enter the AE code shown in the Referral code box below in the AE Space. If it doesn't work, make sure there are no spaces before or after the code."},
    {"title": "Choose Cecilia as your SE", "description": "When asked for an SE, choose Cecilia."},
    {"title": "Send Kyef your book details", "description": "When you're finished, send your book name and pen name (pen name, NOT email)."},
    {"title": "Join the Authors WhatsApp group", "description": "Join for general information and updates: https://chat.whatsapp.com/JghEqDEIMXz0xR1G0HLuIW?mode=gi_t"}
  ]$j$::jsonb,
  faq = $j$[
    {"q": "What stories does ROCNOVEL accept?", "a": "BL and male-lead stories are not accepted. Other genres may be accepted if the story has a female lead and romance."},
    {"q": "How long does review take?", "a": "Review takes 1 to 15 business days."},
    {"q": "My AE code isn't working. What now?", "a": "Make sure there are no spaces before or after the AE code."},
    {"q": "Do I send my pen name or my email?", "a": "Send your pen name, not your email."}
  ]$j$::jsonb,
  archived = false
WHERE slug = 'rocnovel';
