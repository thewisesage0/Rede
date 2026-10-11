import { useEffect, useLayoutEffect } from "react";

const THEME_CLASS = "ae-jk";
const FONT_LINK_ID = "ae-jk-fonts";
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Jua&display=swap";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Turns on Kyef's cute k-pop theme while `enabled` is true.
 *
 * The class goes on <html> (not on a wrapper) so dialogs, dropdowns and toasts,
 * which render outside the app tree, are themed too. It is removed again the
 * moment the AE leaves the portal or signs out, so the public site and every
 * other user are never affected. The theme fonts are only fetched for the AE.
 */
export function useAeTheme(enabled: boolean) {
  useIsoLayoutEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add(THEME_CLASS);

    if (!document.getElementById(FONT_LINK_ID)) {
      const link = document.createElement("link");
      link.id = FONT_LINK_ID;
      link.rel = "stylesheet";
      link.href = FONT_HREF;
      document.head.appendChild(link);
    }

    return () => root.classList.remove(THEME_CLASS);
  }, [enabled]);
}
