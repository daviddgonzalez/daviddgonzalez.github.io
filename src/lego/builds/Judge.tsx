export function Judge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 150" width={200} height={170} className={className} aria-hidden="true" focusable="false">
      {/* antenna + head */}
      <rect x="66" y="8" width="4" height="10" fill="#565d68"/><circle cx="68" cy="6" r="4" fill="#d01012"/>
      <rect x="48" y="20" width="40" height="30" rx="6" fill="#7d858f"/>
      <rect x="48" y="20" width="40" height="6" rx="3" fill="#9aa3ad"/>
      <g fill="#565d68"><ellipse cx="60" cy="20" rx="6" ry="2.6"/><ellipse cx="76" cy="20" rx="6" ry="2.6"/></g>
      <circle cx="60" cy="36" r="5" fill="#16c79a"/><circle cx="76" cy="36" r="5" fill="#16c79a"/>
      <rect x="58" y="44" width="20" height="4" rx="2" fill="#3a3f47"/>
      {/* judge robe (short) */}
      <path d="M52 52 L84 52 L98 132 L38 132 Z" fill="#242a33"/>
      <g stroke="#d4af37" strokeWidth="2" opacity="0.9"><line x1="63" y1="60" x2="56" y2="128"/><line x1="73" y1="60" x2="80" y2="128"/></g>
      {/* white collar + band */}
      <path d="M58 52 L78 52 L68 68 Z" fill="#ffffff"/>
      <rect x="65" y="60" width="6" height="18" rx="1.5" fill="#ffffff"/><rect x="68" y="60" width="3" height="18" fill="#eaeaea"/>
      {/* left sleeve + hand */}
      <path d="M54 56 C42 64 38 82 42 98 L52 96 C50 82 54 70 64 62 Z" fill="#242a33"/>
      <circle cx="46" cy="98" r="5.5" fill="#7d858f"/>
      {/* right sleeve raised */}
      <path d="M82 56 C100 48 110 40 116 34 L108 27 C102 38 92 50 76 60 Z" fill="#242a33"/>
      {/* gavel (handle bottom meets the hand) */}
      <g transform="rotate(-35 116 40)">
        <rect x="112.5" y="2" width="7" height="40" rx="2" fill="#c79a52"/>
        <rect x="98" y="-6" width="36" height="15" rx="4" fill="#9a6a33"/>
        <rect x="98" y="-6" width="36" height="5" rx="2.5" fill="#b9853f"/>
      </g>
      {/* hand grips the handle (drawn over it) */}
      <circle cx="116" cy="40" r="6.5" fill="#7d858f"/>
      {/* verdict tiles */}
      <g><rect x="116" y="100" width="22" height="22" rx="4" fill="#2f9e44"/><path d="M121 111 l5 5 8 -10" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/></g>
      <g opacity="0.85"><rect x="142" y="114" width="18" height="18" rx="4" fill="#d01012"/><path d="M147 119 l8 8 M155 119 l-8 8" stroke="#fff" strokeWidth="2.8" strokeLinecap="round"/></g>
    </svg>
  );
}
