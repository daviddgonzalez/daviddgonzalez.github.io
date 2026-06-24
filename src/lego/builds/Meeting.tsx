export function Meeting({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 200" width={220} height={200} className={className} aria-hidden="true" focusable="false">
      {/* presentation screen w/ dataviz */}
      <rect x="14" y="24" width="74" height="56" rx="5" fill="#006cb7"/>
      <rect x="20" y="30" width="62" height="44" rx="3" fill="#eaf4ff"/>
      <g fill="#006cb7"><rect x="28" y="56" width="9" height="12" rx="1.5"/><rect x="41" y="48" width="9" height="20" rx="1.5"/><rect x="54" y="52" width="9" height="16" rx="1.5"/><rect x="67" y="42" width="9" height="26" rx="1.5"/></g>
      <line x1="51" y1="80" x2="51" y2="92" stroke="#565d68" strokeWidth="4"/>
      {/* meeting table */}
      <rect x="40" y="150" width="166" height="18" rx="5" fill="#c79a52"/>
      <rect x="40" y="162" width="166" height="6" rx="3" fill="#a87f3e"/>
      <g fill="#dcb877"><ellipse cx="64" cy="150" rx="7" ry="3"/><ellipse cx="110" cy="150" rx="7" ry="3"/><ellipse cx="156" cy="150" rx="7" ry="3"/><ellipse cx="190" cy="150" rx="7" ry="3"/></g>
      {/* attendees (minifig busts behind table) */}
      {/* one */}
      <g><rect x="64" y="104" width="22" height="20" rx="7" fill="#ffd21f"/><circle cx="71" cy="115" r="1.8" fill="#1a1a1a"/><circle cx="79" cy="115" r="1.8" fill="#1a1a1a"/><path d="M62 126 L88 126 L92 150 L58 150 Z" fill="#006cb7"/></g>
      {/* two (presenter-ish, checked in) */}
      <g><rect x="112" y="100" width="22" height="20" rx="7" fill="#ffd21f"/><circle cx="119" cy="111" r="1.8" fill="#1a1a1a"/><circle cx="127" cy="111" r="1.8" fill="#1a1a1a"/><path d="M110 122 L136 122 L140 150 L106 150 Z" fill="#2f9e44"/>
        {/* checked-in badge */}
        <circle cx="138" cy="100" r="9" fill="#2f9e44" stroke="#fff" strokeWidth="1.5"/><path d="M133 100 l3.5 3.5 6 -7" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/></g>
      {/* three */}
      <g><rect x="160" y="104" width="22" height="20" rx="7" fill="#ffd21f"/><circle cx="167" cy="115" r="1.8" fill="#1a1a1a"/><circle cx="175" cy="115" r="1.8" fill="#1a1a1a"/><path d="M158 126 L184 126 L188 150 L154 150 Z" fill="#d01012"/></g>
      {/* check-in phone on the table (front) */}
      <g>
        <rect x="92" y="150" width="26" height="40" rx="5" fill="#2c3036"/>
        <rect x="96" y="155" width="18" height="28" rx="2" fill="#eaf4ff"/>
        <path d="M101 165 a5 5 0 1 1 8 0 c0 4 -4 8 -4 8 s-4 -4 -4 -8 Z" fill="#d01012"/><circle cx="105" cy="165" r="2" fill="#fff"/>
      </g>
    </svg>
  );
}
