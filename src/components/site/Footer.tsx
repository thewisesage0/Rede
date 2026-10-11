import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, MessageCircle } from "lucide-react";
import { AE_NAME } from "@/lib/site-config";
import { KyefBunny } from "./KyefBunny";
import { PolaroidSlot } from "./JkStickers";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-border relative">
      <div className="jk-footer-stickers" aria-hidden="true">
        <span>💜</span><span>⭐</span><span>✨</span><span>💗</span>
      </div>
      <div className="mx-auto max-w-[1280px] px-4 md:px-8 py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <KyefBunny size={38} />
            <span className="text-xl font-bold tracking-tight">Kyef</span>
            <PolaroidSlot size="sm" rotate={-5} seed={2} caption="the team" className="ml-2 hidden sm:inline-flex" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-md leading-relaxed">
            A boutique acquisition house for webnovel authors. We curate the platforms,
            decode the contracts, and walk you through every page of your publishing journey.
          </p>
          <div className="mt-6 flex gap-3">
            {[Twitter, Instagram, MessageCircle].map((Icon, i) => (
              <a key={i} href="#" className="w-10 h-10 grid place-items-center rounded-full glass hover:border-primary/40 transition-colors">
                <Icon className="w-4 h-4 text-muted-foreground" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-4">Navigate</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/platforms" className="hover:text-foreground transition-colors">Platforms</Link></li>
            <li><Link to="/matcher" className="hover:text-foreground transition-colors">AI Matcher</Link></li>
            <li><Link to="/submit" className="hover:text-foreground transition-colors">Submit</Link></li>
            <li><Link to="/about" className="hover:text-foreground transition-colors">About</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-4">Genres</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li>Billionaire Romance</li>
            <li>Werewolf & Mafia</li>
            <li>Cultivation & LitRPG</li>
            <li>Dark Academia Fantasy</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-[1280px] px-4 md:px-8 py-6 flex flex-col md:flex-row gap-3 items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Kyef. All rights reserved.</p>
          <p>
            Your Acquisition Editor: <span className="text-foreground font-medium">{AE_NAME}</span> · Designed by <span className="text-foreground font-medium">Zenthros Cover and Design</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
