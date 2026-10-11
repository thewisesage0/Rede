import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Auto-provisions the designated Acquisition Editor (admin) account the
// first time someone visits the login page — but ONLY if you've set
// ADMIN_SEED_PASSWORD as a server-side environment variable.
//
// SECURITY NOTE: earlier versions of this file hardcoded a real email +
// password directly in source. That meant anyone with access to the
// repository (or its git history) had standing admin credentials to the
// live site. This version removes that backdoor: nothing is auto-created
// unless you explicitly opt in via env vars, and the password is never
// stored in code.
//
// To enable auto-provisioning, set in your hosting provider (e.g. Vercel):
//   ADMIN_SEED_EMAIL    (optional, defaults to the address below)
//   ADMIN_SEED_PASSWORD (required — pick your own strong password)
//
// Alternatively, skip this entirely and create your admin user directly in
// Supabase Dashboard -> Authentication -> Add User. The `handle_new_user`
// database trigger automatically grants the `admin` role to whichever email
// you designate as the owner (see the migration for that email).
const DEFAULT_ADMIN_EMAIL = "thesage196@gmail.com";

export const ensureAEUser = createServerFn({ method: "POST" }).handler(async () => {
  const password = process.env.ADMIN_SEED_PASSWORD;
  if (!password) {
    // No password configured -> auto-provisioning is disabled. This is the
    // safe default; it does not fail the page, it just does nothing.
    return { created: false, skipped: true };
  }

  const email = process.env.ADMIN_SEED_EMAIL || DEFAULT_ADMIN_EMAIL;

  const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
  if (listErr) throw listErr;

  const exists = list.users.find((u) => u.email === email);
  if (exists) return { created: false };

  const { error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  return { created: true };
});
