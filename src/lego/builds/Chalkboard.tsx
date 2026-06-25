import { Climber } from "../Climber";

export function Chalkboard({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 190 180" width={190} height={180} className={className} aria-hidden="true" focusable="false">
      {/* easel legs */}
      <g stroke="#9a6a33" strokeWidth="7" strokeLinecap="round"><line x1="48" y1="120" x2="32" y2="166"/><line x1="142" y1="120" x2="158" y2="166"/></g>
      {/* board frame (brick) */}
      <rect x="30" y="22" width="130" height="98" rx="6" fill="#c79a52"/>
      <g fill="#dcb877"><ellipse cx="48" cy="22" rx="7" ry="3"/><ellipse cx="74" cy="22" rx="7" ry="3"/><ellipse cx="100" cy="22" rx="7" ry="3"/><ellipse cx="126" cy="22" rx="7" ry="3"/><ellipse cx="146" cy="22" rx="7" ry="3"/></g>
      {/* board surface */}
      <rect x="40" y="32" width="110" height="78" rx="3" fill="#1f6f4a"/>
      {/* graph (chalk) */}
      <g stroke="#eafff5" strokeWidth="2.4" opacity="0.92">
        <line x1="62" y1="52" x2="96" y2="46"/><line x1="96" y1="46" x2="124" y2="64"/>
        <line x1="62" y1="52" x2="78" y2="84"/><line x1="78" y1="84" x2="124" y2="64"/><line x1="78" y1="84" x2="112" y2="92"/>
      </g>
      <g fill="#eafff5"><circle cx="62" cy="52" r="6"/><circle cx="96" cy="46" r="6"/><circle cx="124" cy="64" r="6"/><circle cx="78" cy="84" r="6"/><circle cx="112" cy="92" r="6"/></g>
      {/* discrete-math symbol */}
      <text className="lego-bounce" x="44" y="46" fontFamily="Verdana" fontWeight="800" fontSize="13" fill="#ffe04d">∀x</text>
      {/* chalk tray + chalk */}
      <rect x="36" y="112" width="118" height="7" rx="3" fill="#9a6a33"/>
      <rect x="110" y="113" width="16" height="4" rx="2" fill="#fff"/>
      <rect x="60" y="113" width="14" height="4.5" rx="2" fill="#d01012"/>
      {/* a minifigure walks the graph — Lego theme only */}
      <Climber className="graph-walker" torso="#7048b0" />
    </svg>
  );
}
