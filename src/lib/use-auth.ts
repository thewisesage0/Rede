import { useEffect, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  // The AE (admin) role is looked up after sign-in. Until that lookup finishes we
  // report `loading: true`, so the AE never sees a flash of the regular UI before
  // her own themed dashboard appears.
  const [roleChecked, setRoleChecked] = useState(false);
  const roleFor = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const applySession = (s: Session | null) => {
      setSession(s);
      setUser(s?.user ?? null);

      if (!s?.user) {
        roleFor.current = null;
        setIsAdmin(false);
        setRoleChecked(true);
        return;
      }

      // Token refreshes re-emit the same user; don't re-check (or re-show a spinner).
      if (roleFor.current === s.user.id) return;
      roleFor.current = s.user.id;
      setRoleChecked(false);

      // Deferred so we never await Supabase calls inside onAuthStateChange itself.
      setTimeout(async () => {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", s.user.id)
          .eq("role", "admin")
          .maybeSingle();
        if (cancelled) return;
        setIsAdmin(!!data);
        setRoleChecked(true);
      }, 0);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, s) => applySession(s));

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      applySession(s);
      setSessionLoading(false);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return { session, user, isAdmin, loading: sessionLoading || !roleChecked };
}
