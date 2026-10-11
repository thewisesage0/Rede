import { createFileRoute, Outlet, useNavigate, Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, Library, Inbox, LogOut, Shield, Loader2, Volume2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { AE_NAME } from "@/lib/site-config";
import { KyefBunny } from "@/components/site/KyefBunny";
import { useAeWelcomeSound } from "@/lib/use-ae-welcome-sound";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { location } = useRouterState();

  // The cute theme is site-wide now (see src/routes/__root.tsx), so every
  // signed-in user — author or AE — gets the same bunny-and-borahae look.
  // `showAeSpecials` is only for the bits that are personally Kyef's: the
  // "{AE_NAME}'s Desk" heading and the sidebar cheer note.
  const showAeSpecials = !loading && !!user && isAdmin;

  // Plays public/audio/ae-welcome.(mp3|ogg|wav) once per tab session, the
  // moment the AE's own dashboard loads. `blocked` is true if the browser
  // wouldn't allow autoplay (or no file has been added yet) — `playNow`
  // is a one-tap fallback for that case.
  const { blocked: welcomeSoundBlocked, playNow: playWelcomeSound } = useAeWelcomeSound(showAeSpecials);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success(showAeSpecials ? "Bye bye, see you soon! 💜" : "Signed out");
    navigate({ to: "/" });
  };

  const links = [
    { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
    ...(isAdmin
      ? [
          { to: "/admin/platforms", label: "Platforms", icon: Library },
          { to: "/admin/submissions", label: "Submissions", icon: Inbox },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-background jk-stage">
      <div className="jk-floaters" aria-hidden="true">
        <span>💜</span>
        <span>✨</span>
        <span>🐰</span>
        <span>⭐</span>
        <span>💗</span>
        <span>🌙</span>
      </div>

      <aside className="fixed left-0 top-0 bottom-0 w-64 hidden lg:flex flex-col p-5 border-r border-border bg-card z-30 jk-sidebar">
        <Link to="/" className="flex items-center gap-2 mb-10 px-2">
          <KyefBunny size={46} />
          <span className="leading-tight">
            <span className="block text-lg font-bold tracking-tight">
              {showAeSpecials ? `${AE_NAME}'s Desk` : "Kyef"}
            </span>
            <span className="block text-[11px] text-muted-foreground">
              {showAeSpecials ? "Kyef AE portal" : "Author portal"}
            </span>
          </span>
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          {links.map((l) => {
            const Icon = l.icon;
            const active = location.pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-accent text-primary jk-nav-active"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="w-4 h-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>

        {showAeSpecials && (
          <div className="jk-cheer mb-4">
            <span className="jk-hangul">화이팅!</span> 💜
            <span className="block text-[11px] font-medium opacity-80">You've got this, {AE_NAME}</span>
          </div>
        )}

        <div className="border-t border-border pt-4 space-y-2">
          <div className="px-2">
            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            {isAdmin && (
              <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-primary">
                <Shield className="w-3 h-3" /> Admin
              </div>
            )}
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      <header className="lg:hidden fixed top-0 inset-x-0 z-40 bg-card border-b border-border jk-topbar">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <KyefBunny size={34} />
            <span className="font-bold">{showAeSpecials ? `${AE_NAME}'s Desk` : "Kyef"}</span>
          </Link>
          <button onClick={signOut} className="text-xs text-muted-foreground flex items-center gap-1">
            <LogOut className="w-3 h-3" /> Sign out
          </button>
        </div>
        <div className="flex overflow-x-auto gap-1 px-3 pb-2">
          {links.map((l) => {
            const active = location.pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                  active ? "bg-accent text-primary jk-nav-active" : "text-muted-foreground"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 lg:pl-64 pt-28 lg:pt-10 pb-20 px-4 lg:px-10"
      >
        {showAeSpecials && welcomeSoundBlocked && (
          <button
            type="button"
            onClick={playWelcomeSound}
            className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-dashed border-primary/40 px-3 py-1.5 text-xs font-medium text-primary hover:bg-accent transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" /> Play welcome sound
          </button>
        )}
        <Outlet />
      </motion.main>
    </div>
  );
}
