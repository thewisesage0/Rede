import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Sparkles } from "lucide-react";

// Short, attributed dark-romance lines for the sticky note that drifts
// through the site. Kept to one quote per book/source and each under the
// fifteen-word copyright ceiling, quoted verbatim with no rewording.
const QUOTES = [
  {
    text: "You always wanted a nice guy. Too bad you got the villain.",
    who: "Killian Carson",
    source: "God of Malice, Rina Kent",
  },
  {
    text: "Cat got your tongue, little mouse?",
    who: "Zade",
    source: "Haunting Adeline, H.D. Carlton",
  },
  {
    text: "I don't want to fix him. I want fix me.",
    who: "Morana",
    source: "The Predator, RuNyx",
  },
] as const;

const ROTATE_MS = 9000;

/**
 * A small sticky-note that drifts through the corner of every page, cycling
 * a short attributed dark-romance line. Purely decorative — dismissible,
 * and it stops auto-advancing for anyone with reduced-motion set (a tap on
 * the sparkle still moves it forward).
 */
export function FloatingQuotes() {
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (dismissed || reducedMotion) return;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % QUOTES.length), ROTATE_MS);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [dismissed, reducedMotion]);

  if (dismissed) return null;
  const q = QUOTES[index];

  return (
    <div className="jk-quote-wrap" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 14, rotate: -3 }}
          animate={{ opacity: 1, y: 0, rotate: -2 }}
          exit={{ opacity: 0, y: -10, rotate: 2 }}
          transition={{ duration: 0.35 }}
          className="jk-quote-card"
        >
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss quote"
            className="jk-quote-close"
          >
            <X className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % QUOTES.length)}
            className="jk-quote-body"
            aria-label="Show another quote"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-70" />
            <span>
              <span className="jk-quote-text">&ldquo;{q.text}&rdquo;</span>
              <span className="jk-quote-source">— {q.who}, {q.source}</span>
            </span>
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
