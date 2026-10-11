import type { MouseEventHandler } from "react";

type Props = {
  size?: number;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  label?: string;
};

/**
 * Original bunny mascot for Kyef's dashboard (a nod to Jungkook's bunny-fan
 * culture). Drawn from scratch; not any official character.
 */
export function KyefBunny({ size = 96, className = "", onClick, label = "Kyef's bunny" }: Props) {
  const ink = "var(--jk-ink, #3d2266)";
  const svg = (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role="img"
      aria-label={label}
      className="jk-bunny"
    >
      {/* ears */}
      <g className="jk-ear jk-ear-l" style={{ transformOrigin: "44px 40px" }}>
        <ellipse cx="42" cy="26" rx="10" ry="24" transform="rotate(-10 42 26)" fill="#fff" stroke={ink} strokeWidth="3" />
        <ellipse cx="42" cy="28" rx="4.5" ry="16" transform="rotate(-10 42 28)" fill="#ffb3d9" />
      </g>
      <g className="jk-ear jk-ear-r" style={{ transformOrigin: "76px 40px" }}>
        <ellipse cx="78" cy="26" rx="10" ry="24" transform="rotate(10 78 26)" fill="#fff" stroke={ink} strokeWidth="3" />
        <ellipse cx="78" cy="28" rx="4.5" ry="16" transform="rotate(10 78 28)" fill="#ffb3d9" />
      </g>

      {/* head */}
      <ellipse cx="60" cy="74" rx="40" ry="34" fill="#fff" stroke={ink} strokeWidth="3" />

      {/* bow */}
      <g transform="translate(88 50) rotate(18)">
        <path d="M0 0 L-13 -8 L-13 8 Z" fill="#a66bff" stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M0 0 L13 -8 L13 8 Z" fill="#a66bff" stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
        <circle r="4" fill="#ffd966" stroke={ink} strokeWidth="2.5" />
      </g>

      {/* face */}
      <path d="M38 70 Q44 62 50 70" fill="none" stroke={ink} strokeWidth="3.2" strokeLinecap="round" />
      <path d="M70 70 Q76 62 82 70" fill="none" stroke={ink} strokeWidth="3.2" strokeLinecap="round" />
      <ellipse cx="34" cy="82" rx="8" ry="5.5" fill="#ffb3d9" opacity="0.85" />
      <ellipse cx="86" cy="82" rx="8" ry="5.5" fill="#ffb3d9" opacity="0.85" />
      <path d="M56 78 Q60 82 64 78 Z" fill="#ff7eb6" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
      <path d="M60 82 Q60 90 53 89 M60 82 Q60 90 67 89" fill="none" stroke={ink} strokeWidth="2.6" strokeLinecap="round" />

      {/* sparkles */}
      <path d="M14 40 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5 z" fill="#ffd966" stroke={ink} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M106 96 l2 4.5 4.5 2 -4.5 2 -2 4.5 -2 -4.5 -4.5 -2 4.5 -2 z" fill="#a8f0d8" stroke={ink} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );

  if (!onClick) return <span className={className}>{svg}</span>;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Tap the bunny for a surprise"
      className={`jk-bunny-btn ${className}`}
    >
      {svg}
    </button>
  );
}
