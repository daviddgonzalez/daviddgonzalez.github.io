export function Pose({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 150 180" width={150} height={180} className={className} aria-hidden="true" focusable="false">
      {/* minifig in a stride/reach pose */}
      {/* head */}
      <rect x="62" y="16" width="20" height="9" rx="2" fill="#e6bd00"/><ellipse cx="72" cy="16" rx="10" ry="4" fill="#ffe04d"/>
      <rect x="58" y="22" width="28" height="30" rx="9" fill="#ffd21f"/>
      <circle cx="68" cy="36" r="2.4" fill="#1a1a1a"/><circle cx="80" cy="36" r="2.4" fill="#1a1a1a"/>
      <path d="M67 42 Q73 48 80 42" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* torso */}
      <path d="M60 52 L86 52 L92 96 L54 96 Z" fill="#006cb7"/>
      {/* raised arm (reaching up-right) */}
      <path d="M84 56 C100 50 108 38 112 26 L104 22 C98 34 90 46 78 54 Z" fill="#0a5a99"/>
      <circle cx="110" cy="24" r="6" fill="#ffd21f"/>
      {/* other arm (down-left) */}
      <path d="M60 58 C46 64 40 78 40 92 L50 92 C50 80 54 70 64 64 Z" fill="#0a5a99"/>
      <circle cx="44" cy="94" r="6" fill="#ffd21f"/>
      {/* hips + striding legs */}
      <rect x="56" y="96" width="38" height="13" rx="3" fill="#b20d10"/>
      <path d="M58 109 L70 109 L60 150 L48 150 Z" fill="#163a82"/>
      <path d="M76 109 L90 109 L102 146 L90 150 Z" fill="#163a82"/>
      {/* 33-node skeleton overlay */}
      <g stroke="#16c79a" strokeWidth="2" opacity="0.95" fill="none">
        <path d="M72 30 L72 54 M72 54 L110 24 M72 54 L44 94 M72 54 L66 100 M72 54 L84 100 M66 100 L54 150 M84 100 L96 148"/>
      </g>
      <g fill="#0fae86">
        <circle cx="72" cy="30" r="3.4"/><circle cx="72" cy="54" r="3.4"/><circle cx="110" cy="24" r="3.4"/><circle cx="44" cy="94" r="3.4"/>
        <circle cx="66" cy="100" r="3.4"/><circle cx="84" cy="100" r="3.4"/><circle cx="54" cy="150" r="3.4"/><circle cx="96" cy="148" r="3.4"/>
      </g>
    </svg>
  );
}
