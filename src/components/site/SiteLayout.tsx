import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative jk-stage">
      {/* Confetti of hearts/stars behind everything, drifting emoji on top — purely
          decorative, the same backdrop the AE's own dashboard uses. */}
      <div className="jk-floaters" aria-hidden="true">
        <span>💜</span>
        <span>✨</span>
        <span>🐰</span>
        <span>⭐</span>
        <span>💗</span>
        <span>🌙</span>
      </div>
      <Header />
      <main className="pt-28 relative z-10">{children}</main>
      <Footer />
    </div>
  );
}
