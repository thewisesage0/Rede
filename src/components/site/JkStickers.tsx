import type { CSSProperties } from "react";
import { toast } from "sonner";

type IconProps = { size?: number; className?: string };
const ink = "var(--jk-ink, #3d2266)";

/** Tiny original doodles for scattering around the cute theme — no borrowed art. */
export function JkStar({ size = 28, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={`jk-doodle ${className}`} aria-hidden="true">
      <path
        d="M20 3 L24 16 L37 20 L24 24 L20 37 L16 24 L3 20 L16 16 Z"
        fill="#ffd966" stroke={ink} strokeWidth="2.5" strokeLinejoin="round"
      />
    </svg>
  );
}

export function JkHeart({ size = 26, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 34" className={`jk-doodle ${className}`} aria-hidden="true">
      <path
        d="M20 32 C6 22 2 14 2 8.5 C2 2.5 8 -1 14 3 C17 5 19 8 20 10 C21 8 23 5 26 3 C32 -1 38 2.5 38 8.5 C38 14 34 22 20 32 Z"
        fill="#ff9ecb" stroke={ink} strokeWidth="2.5" strokeLinejoin="round"
      />
    </svg>
  );
}

export function JkMoon({ size = 30, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={`jk-doodle ${className}`} aria-hidden="true">
      <path
        d="M27 4 C18 4 11 11 11 20 C11 29 18 36 27 36 C21 33 17 27 17 20 C17 13 21 7 27 4 Z"
        fill="#c9b3ff" stroke={ink} strokeWidth="2.5" strokeLinejoin="round"
      />
      <circle cx="30" cy="10" r="1.6" fill="#c9b3ff" stroke={ink} strokeWidth="1.4" />
      <circle cx="34" cy="17" r="1" fill="#c9b3ff" stroke={ink} strokeWidth="1.2" />
    </svg>
  );
}

export function JkBow({ size = 28, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 26" className={`jk-doodle ${className}`} aria-hidden="true">
      <path d="M18 13 L2 3 L2 23 Z" fill="#a66bff" stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M22 13 L38 3 L38 23 Z" fill="#a66bff" stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="20" cy="13" r="5" fill="#ffd966" stroke={ink} strokeWidth="2.5" />
    </svg>
  );
}

export function JkSparkleTrio({ size = 40, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" className={`jk-doodle ${className}`} aria-hidden="true">
      <path d="M12 8 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 Z" fill="#a8f0d8" stroke={ink} strokeWidth="1.6" />
      <path d="M45 30 l2.5 6.5 6.5 2.5 -6.5 2.5 -2.5 6.5 -2.5 -6.5 -6.5 -2.5 6.5 -2.5 Z" fill="#ffd966" stroke={ink} strokeWidth="1.8" />
      <circle cx="20" cy="46" r="4" fill="#ff9ecb" stroke={ink} strokeWidth="1.8" />
    </svg>
  );
}

const DOODLES = [JkStar, JkHeart, JkMoon, JkBow];

// Your photos — drop files named exactly a.jpg through g.jpg into
// public/photos/, and every PolaroidSlot below picks one automatically
// (by its `seed`) unless you pass an explicit `src` override.
const PHOTOS = [
  "/photos/a.jpg",
  "/photos/b.jpg",
  "/photos/c.jpg",
  "/photos/d.jpg",
  "/photos/e.jpg",
  "/photos/f.jpg",
  "/photos/g.jpg",
];

/**
 * A cute, decorated placeholder frame — a tilted "polaroid" with washi tape.
 * By default it auto-picks one of the PHOTOS above (by `seed`), cropped to
 * a square with the ink border. Pass `src` to force a specific image, or
 * `src={null}` to force the gradient+doodle placeholder instead.
 */
export function PolaroidSlot({
  size = "md",
  rotate = -4,
  caption = "your pic here",
  seed = 0,
  src,
  alt,
  className = "",
  style,
}: {
  size?: "sm" | "md" | "lg";
  rotate?: number;
  caption?: string;
  seed?: number;
  src?: string | null;
  alt?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const dims = size === "sm" ? 84 : size === "lg" ? 132 : 106;
  const Doodle = DOODLES[Math.abs(seed) % DOODLES.length];
  const gradients = [
    "linear-gradient(135deg, oklch(0.88 0.09 350), oklch(0.90 0.10 305))",
    "linear-gradient(135deg, oklch(0.90 0.10 95), oklch(0.90 0.08 350))",
    "linear-gradient(135deg, oklch(0.88 0.08 170), oklch(0.90 0.09 305))",
    "linear-gradient(135deg, oklch(0.90 0.09 305), oklch(0.88 0.08 235))",
  ];
  const bg = gradients[Math.abs(seed) % gradients.length];

  // src === undefined -> auto-pick from PHOTOS by seed.
  // src === null      -> explicitly force the placeholder (no photo).
  // src === "string"  -> use that exact image.
  const resolvedSrc = src === undefined ? PHOTOS[Math.abs(seed) % PHOTOS.length] : src;

  return (
    <button
      type="button"
      className={`jk-polaroid ${className}`}
      style={{ width: dims, ["--jk-rotate" as any]: `${rotate}deg`, ...style }}
      title={resolvedSrc ? undefined : "Swap this for one of your own photos"}
      onClick={() => { if (!resolvedSrc) toast("📸 swap me for one of your favorite pics!"); }}
    >
      <span className="jk-tape" aria-hidden="true" />
      {resolvedSrc ? (
        <img src={resolvedSrc} alt={alt ?? caption} className="jk-polaroid-photo jk-polaroid-img" loading="lazy" decoding="async" />
      ) : (
        <span className="jk-polaroid-photo" style={{ background: bg }}>
          <Doodle size={Math.round(dims * 0.34)} />
        </span>
      )}
      <span className="jk-polaroid-caption">{caption}</span>
    </button>
  );
}

