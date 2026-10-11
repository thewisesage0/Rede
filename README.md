# Zenthros

A TanStack Start (React 19 + Vite + Nitro) application with Supabase as its
backend: auth, Postgres (via RLS-protected tables), and file storage.

This project has been fully detached from Lovable and Cloudflare. It deploys
to Vercel using Nitro's built-in, zero-config Vercel target.

## Stack

- **Frontend/SSR**: TanStack Start (`@tanstack/react-start`) on Vite 7, React 19
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (Postgres, Auth, Storage), accessed via `@supabase/supabase-js`
- **Hosting**: Vercel, via the Nitro Vite plugin (`nitro/vite`)

## Supabase project

A live Supabase project has already been created and wired into this app:

- Tables: `profiles`, `user_roles`, `platforms`, `submissions`, `contracts`, `recommendations`
- Row Level Security enabled on every table, with policies for public read
  access, public form submission (`submissions`, `recommendations`), and
  admin-only write access elsewhere
- Storage buckets: `proofs` (manuscript/contract proof uploads) and
  `platform-logos` (admin-managed logos), both public-read
- Auth: email/password, with a database trigger that automatically creates a
  `profiles` row and assigns the `admin` role to a designated owner email on
  signup

The public anon key and project URL are baked into
`src/integrations/supabase/client.ts` as a fallback, so **the public-facing
parts of the site (browsing platforms, submitting manuscripts, the
recommendation matcher, login) work immediately on Vercel with zero
configuration.**

### The one thing you must configure yourself: the service role key

A small number of admin-only server operations (see
`src/integrations/supabase/client.server.ts`) require your Supabase
**service role key**. This key can bypass Row Level Security, so it is a
secret and can never be committed to source control or hardcoded — that's
why it isn't baked in like the anon key is.

To enable those admin server functions:

1. Go to your Supabase project dashboard → **Project Settings → API**
2. Copy the **service_role** key
3. In Vercel: **Project Settings → Environment Variables**, add:
   - `SUPABASE_SERVICE_ROLE_KEY` = (the key you copied)

If you skip this, the rest of the site still works — only the specific
admin-seeding server function will no-op.

### Optional: auto-provision your admin login

Earlier versions of this project hardcoded a real admin email/password pair
directly in source (`src/lib/ae-seed.functions.ts`) — a serious security
issue, since anyone with the code had standing admin credentials. That has
been removed. To opt back into auto-provisioning your admin account on first
visit to `/login`, set these in Vercel (or your local `.env`):

- `ADMIN_SEED_EMAIL` (optional — defaults to the address in the migration)
- `ADMIN_SEED_PASSWORD` (required to enable this — pick your own strong password)

Or skip it entirely and create your user directly in **Supabase Dashboard →
Authentication → Add User** using the designated admin email — the
`handle_new_user` database trigger grants the `admin` role automatically.

## Local development

```bash
cp .env.example .env   # already pre-filled with the live project's public keys
npm install
npm run dev
```

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel, "Add New… → Project" and import the repo.
3. Vercel auto-detects TanStack Start + Nitro — no build command or output
   directory overrides are needed.
4. (Optional but recommended) add `SUPABASE_SERVICE_ROLE_KEY` and, if you
   want auto-provisioned admin login, `ADMIN_SEED_EMAIL` /
   `ADMIN_SEED_PASSWORD` under Environment Variables.
5. Deploy.

Because Nitro detects the Vercel build environment automatically and
compiles the TanStack Start server into Vercel Functions, there is no
Cloudflare/Wrangler-style adapter mismatch left in this project — that
mismatch was the root cause of the previous 404s on Vercel.

## What changed from the original Lovable export

- Removed `@lovable.dev/vite-tanstack-config`, `@cloudflare/vite-plugin`,
  `wrangler.jsonc`, and the `.lovable/` metadata folder.
- Replaced the Cloudflare Workers-style `src/server.ts` entry with Nitro's
  default entry (works on Vercel, Node, and everywhere else Nitro supports);
  the branded 500-error-page behavior was preserved by folding its logic
  into the existing `start.ts` request middleware.
- Created a brand-new, independent Supabase project and applied the app's
  full schema, RLS policies, and storage buckets to it.
- Removed a live Anthropic API key that was checked into `.env` (and not
  even gitignored) — **rotate that key if it was ever pushed to a remote
  repository**, since it may already be exposed.
- Added `.env` and `.env.*` to `.gitignore` (missing before), so secrets
  stop getting committed going forward.
- Removed a hardcoded admin email + password from
  `src/lib/ae-seed.functions.ts` that effectively acted as a public
  backdoor; replaced it with an opt-in, env-var-driven equivalent.

## Kyef (the AE): name, platforms and dashboard theme

- **AE name**: set once in `src/lib/site-config.ts` (`AE_NAME`). The public pages,
  page titles, the footer, the login page and the "Send to SE" email signature all
  read from it.
- **Novelsnack, GoodNovel and ROCNOVEL**: added by the migration
  `supabase/migrations/20260920120000_seed_novelsnack_goodnovel_rocnovel.sql`.
  Run it once (`supabase db push`, or paste it into the Supabase SQL editor). The
  three platforms then appear on `/platforms` with their steps, codes and FAQs, and
  can be edited in Admin -> Platforms. Re-running it refreshes those three rows.
- **AE-only k-pop theme**: `src/lib/use-ae-theme.ts` adds an `ae-jk` class to `<html>`
  only while the signed-in admin (the AE) is inside the portal. All of the styling is
  scoped to `html.ae-jk` at the bottom of `src/styles.css`, so authors and the public
  site never see it. The theme fonts (Fredoka, Jua) are only downloaded for the AE.

## Site-wide cute theme (this update)

The theme described above now applies to **every page**, not just the AE's
dashboard: `src/routes/__root.tsx` puts the `ae-jk` class permanently on
`<html>`, so `src/styles.css`'s `html.ae-jk` rules cover the public site and
the signed-in portal alike. `src/components/site/SiteLayout.tsx` and
`src/routes/_authenticated.tsx` both render the confetti background and
drifting emoji; `Header.tsx`, `Footer.tsx` and `login.tsx` all use the
`KyefBunny` mascot as the logo mark instead of the old feather icon.

A `FloatingQuotes` component (`src/components/site/FloatingQuotes.tsx`),
mounted once in the root layout, shows a small dismissible sticky note in
the bottom-left corner that rotates through three short, attributed
dark-romance lines (Killian Carson / *God of Malice* by Rina Kent; Zade /
*Haunting Adeline* by H.D. Carlton; Morana / *The Predator* by RuNyx) — one
quote per source, each under the fifteen-word copyright limit, verbatim with
credit. It pauses auto-rotation for `prefers-reduced-motion`.

No uploaded fan photos, BTS promo images, game splash art, or stock photos
were embedded in the site — those are someone else's copyrighted work (and
some depict a real, identifiable person), so they can't be redistributed
here. The "k-pop" feel comes from original assets instead: the hand-drawn
`KyefBunny` mascot, a purple/pink/butter palette, and small text touches
("Borahae 💜", "화이팅!") rather than any BTS likeness or logo.

## Original decorative "photo" placeholders (this update)

`src/components/site/JkStickers.tsx` adds a small set of original doodles
(star, heart, moon, bow) plus `PolaroidSlot` — a tilted, washi-taped
placeholder frame sized `sm`/`md`/`lg`, with a soft gradient standing in for
a photo. It's a real `<button>`: hover/focus lifts and straightens it, and
tapping shows a toast nudge ("swap me for one of your favorite pics!"). It's
scattered in small clusters across the homepage hero (mobile gets its own
row since the desktop visual panel is `hidden` below `lg`), the About page,
the Platforms page header, the footer, and the AE dashboard hero.

These are placeholders, not final art — once you have images you're allowed
to use (your own photos, licensed art, etc.), swap the gradient circle in
`PolaroidSlot` for an `<img>`, or replace individual instances with `<img>`
tags styled with the existing `.jk-polaroid` classes to keep the same frame.
No copyrighted or real-person images are included in this build; see the
note further up in this file for why.

## This update: performance, usability, and the AE welcome sound

### Performance
- `vite.config.ts` now enables `autoCodeSplitting` — each route is its own
  bundle chunk instead of one shared bundle, so the admin-only `recharts`
  and `xlsx` libraries stop loading for authors and first-time visitors.
  **This regenerates `src/routeTree.gen.ts` the next time you run
  `npm run dev` or `npm run build`** — don't hand-edit that file.
- `src/router.tsx` sets `defaultPreload: "intent"`, so a page's code starts
  fetching the moment someone hovers or focuses its link.
- Dropped the Plus Jakarta Sans Google Font request — the cute theme's
  Fredoka/Jua fonts fully override it site-wide already, so it was an
  unused download on every page.
- The AE dashboard's charts now live in their own file,
  `src/routes/_authenticated/DashboardCharts.tsx`, loaded with
  `React.lazy`/`Suspense` from `dashboard.tsx`. `recharts` (a sizeable
  library) now only downloads when the AE is signed in and viewing charts —
  authors never fetch it.
- Images (platform logos, polaroid stickers, upload previews) now use
  `loading="lazy"`/`decoding="async"` and explicit width/height where easy,
  so offscreen images don't block the initial render and the page doesn't
  jump around as they load in.

### Usability
- **AE → Submissions**: added a search box (author name, pen name, novel
  title, email) alongside the existing status filter pills.
- **AE → Platforms**: added a search box and an Active / Archived / All
  filter. **Behavior change**: archived platforms are now hidden by
  default — click "Archived" or "All" to see them.
- **Submit page (authors)**: the form is now broken into four labeled,
  numbered sections (Who you are / Your manuscript / How to reach you /
  Help us say yes) instead of one long list of fields.

### AE welcome sound
Drop your audio file into `public/audio/` named exactly one of:
`ae-welcome.mp3`, `ae-welcome.ogg`, or `ae-welcome.wav`. It plays
automatically the first time the AE's dashboard loads in a browser tab
(once per tab session — it won't replay on every click between dashboard
pages). See `src/lib/use-ae-welcome-sound.ts` for how it works; if the
browser blocks autoplay, a small "🔊 Play welcome sound" button appears
in the dashboard so it can still be started with one tap.
