export function Receipt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 170 180" width={170} height={180} className={className} aria-hidden="true" focusable="false">
      {/* vision sparkles (LLM extraction) */}
      <g className="lego-twinkle">
        <g fill="#006cb7"><path d="M120 26 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z"/></g>
        <g fill="#ffd21f"><path d="M138 44 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z"/></g>
      </g>
      {/* receipt ribbon curling from the slot */}
      <g className="lego-bob" transform="rotate(-6 80 70)">
        <path d="M52 30 h56 v92 l-7 -5 -7 5 -7 -5 -7 5 -7 -5 -7 5 -7 -5 -7 5 Z" fill="#f4f1ea" stroke="#c9c4b4" strokeWidth="2"/>
        <g stroke="#c9c4b4" strokeWidth="2.4" strokeLinecap="round">
          <line x1="60" y1="44" x2="100" y2="44"/><line x1="60" y1="54" x2="92" y2="54"/>
          <line x1="60" y1="64" x2="100" y2="64"/><line x1="60" y1="74" x2="86" y2="74"/>
        </g>
        <line x1="60" y1="92" x2="100" y2="92" stroke="#1a1a1a" strokeWidth="2.4" strokeLinecap="round"/>
        <text x="60" y="110" fontFamily="Verdana" fontWeight="800" fontSize="13" fill="#d01012">$ 42.07</text>
      </g>
      {/* scanner machine base */}
      <rect x="28" y="116" width="116" height="46" rx="7" fill="#3a3f47"/>
      <rect x="28" y="150" width="116" height="12" rx="6" fill="#2c3036"/>
      <g fill="#565d68"><ellipse cx="50" cy="116" rx="8" ry="3.4"/><ellipse cx="86" cy="116" rx="8" ry="3.4"/><ellipse cx="122" cy="116" rx="8" ry="3.4"/></g>
      {/* intake slot */}
      <rect x="48" y="120" width="76" height="6" rx="3" fill="#11141a"/>
      {/* little screen + button */}
      <rect x="40" y="134" width="34" height="18" rx="3" fill="#2a8fd4"/><rect x="44" y="138" width="20" height="3.5" rx="1.7" fill="#cdefff"/>
      <circle cx="128" cy="143" r="6" fill="#2f9e44"/>
    </svg>
  );
}
