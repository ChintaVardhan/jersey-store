"use client";

type Props = {
  primary: string;
  secondary: string;
  accent?: string;
  name?: string;
  number?: string;
  className?: string;
  tilt?: number;
};

export function JerseySilhouette({
  primary,
  secondary,
  accent = "#fff",
  name,
  number,
  className = "",
  tilt = -12,
}: Props) {
  return (
    <div
      className={`relative select-none ${className}`}
      style={{ transform: `rotateY(${tilt}deg) rotateZ(-2deg)`, transformStyle: "preserve-3d" }}
    >
      <svg viewBox="0 0 200 240" className="h-full w-full drop-shadow-xl" aria-hidden>
        <defs>
          <linearGradient id={`g-${primary.replace("#", "")}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={primary} />
            <stop offset="100%" stopColor={secondary} />
          </linearGradient>
        </defs>
        {/* hanger hook */}
        <path d="M95 8 Q100 0 105 8" fill="none" stroke="#888" strokeWidth="2" />
        <rect x="70" y="10" width="60" height="6" rx="2" fill="#c0c0c0" />
        {/* jersey body */}
        <path
          d="M55 28 L40 48 L28 70 L42 78 L48 58 L55 52 L55 210 Q100 225 145 210 L145 52 L152 58 L158 78 L172 70 L160 48 L145 28 L125 38 L100 32 L75 38 Z"
          fill={`url(#g-${primary.replace("#", "")})`}
          stroke="#111"
          strokeWidth="1.2"
        />
        {/* collar */}
        <path d="M78 36 Q100 48 122 36 L115 44 Q100 52 85 44 Z" fill={accent} opacity="0.9" />
        {/* sleeve stripes */}
        <rect x="30" y="62" width="14" height="6" fill={accent} opacity="0.7" />
        <rect x="156" y="62" width="14" height="6" fill={accent} opacity="0.7" />
        {/* chest badge circle */}
        <circle cx="72" cy="88" r="10" fill={accent} opacity="0.85" />
        {number ? (
          <text
            x="100"
            y="140"
            textAnchor="middle"
            fontSize="42"
            fontWeight="800"
            fill={accent}
            fontFamily="system-ui, sans-serif"
            opacity="0.95"
          >
            {number.slice(0, 2)}
          </text>
        ) : null}
        {name ? (
          <text
            x="100"
            y="175"
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill={accent}
            fontFamily="system-ui, sans-serif"
            letterSpacing="1.5"
          >
            {name.slice(0, 12).toUpperCase()}
          </text>
        ) : null}
      </svg>
    </div>
  );
}
