import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { KyefBunny } from "./KyefBunny";

const nav = [
  { to: "/platforms", label: "Platforms" },
  { to: "/matcher", label: "AI Matcher" },
  { to: "/why-ae", label: "Why an AE" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => {
      window.removeEventListener("scroll", onScroll);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <div className="mx-auto max-w-[1280px] px-4 md:px-8 pt-6">
        <div
          className={`flex items-center justify-between rounded-full px-3 py-2.5 md:px-4 transition-all duration-300 ${
            scrolled ? "bg-card border border-border shadow-[var(--shadow-card)]" : "bg-card/70 border border-transparent"
          }`}
        >
          <Link to="/" className="flex items-center gap-2 pl-2">
            <KyefBunny size={34} />
            <span className="text-lg font-bold tracking-tight text-foreground">
              Kyef
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                activeProps={{ className: "px-4 py-2 rounded-full text-sm font-medium text-foreground bg-secondary" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <Link
              to={signedIn ? "/dashboard" : "/login"}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {signedIn ? "Dashboard" : "Login"}
            </Link>
            <Link to="/submit" className="btn-primary px-5 py-2.5">
              Submit manuscript <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden mt-2 glass-strong rounded-3xl p-3 flex flex-col gap-1"
          >
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
              >
                {n.label}
              </Link>
            ))}
            <Link
              to={signedIn ? "/dashboard" : "/login"}
              onClick={() => setOpen(false)}
              className="px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
            >
              {signedIn ? "Dashboard" : "Sign in"}
            </Link>
            <Link
              to="/submit"
              onClick={() => setOpen(false)}
              className="btn-primary mt-2 justify-center py-3"
            >
              Submit manuscript
            </Link>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
