export function Minifigure({ width = 90, className }: { width?: number; className?: string }) {
  return (
    <svg viewBox="0 0 120 180" width={width} className={className} aria-hidden="true" focusable="false">
      <rect x="50" y="14" width="20" height="9" rx="2" fill="#e6bd00" />
      <ellipse cx="60" cy="14" rx="10" ry="4" fill="#ffe04d" />
      <rect x="40" y="20" width="40" height="38" rx="11" fill="#ffd21f" />
      <circle cx="52" cy="38" r="3" fill="#1a1a1a" />
      <circle cx="68" cy="38" r="3" fill="#1a1a1a" />
      <path d="M50 45 Q60 54 70 45" stroke="#1a1a1a" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <rect x="53" y="57" width="14" height="7" fill="#e6bd00" />
      <path d="M45 67 C30 72 25 90 27 106 L41 106 C41 92 45 80 52 74 Z" fill="#b20d10" />
      <path d="M75 67 C90 72 95 90 93 106 L79 106 C79 92 75 80 68 74 Z" fill="#b20d10" />
      <circle cx="29" cy="110" r="8" fill="#ffd21f" />
      <circle cx="91" cy="110" r="8" fill="#ffd21f" />
      <path d="M44 64 L76 64 L84 116 L36 116 Z" fill="#d01012" />
      <rect x="38" y="116" width="44" height="15" rx="3" fill="#163a82" />
      <rect x="40" y="130" width="18" height="42" rx="2" fill="#1c54a8" />
      <rect x="62" y="130" width="18" height="42" rx="2" fill="#1c54a8" />
    </svg>
  );
}
