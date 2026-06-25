import { Climber } from "../Climber";

export function Tree({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 190 180" width={190} height={180} className={className} aria-hidden="true" focusable="false">
      {/* faint point cloud */}
      <g fill="#c9c4b4" opacity="0.55">
        <circle cx="20" cy="40" r="1.6"/><circle cx="30" cy="28" r="1.4"/><circle cx="14" cy="60" r="1.5"/><circle cx="40" cy="50" r="1.3"/>
        <circle cx="170" cy="44" r="1.6"/><circle cx="160" cy="30" r="1.4"/><circle cx="176" cy="62" r="1.5"/><circle cx="150" cy="52" r="1.3"/>
        <circle cx="26" cy="150" r="1.4"/><circle cx="164" cy="152" r="1.4"/>
      </g>
      {/* edges */}
      <g stroke="#565d68" strokeWidth="3" strokeLinecap="round">
        <line x1="95" y1="44" x2="60" y2="92"/><line x1="95" y1="44" x2="130" y2="92"/>
        <line x1="60" y1="104" x2="40" y2="140"/><line x1="60" y1="104" x2="80" y2="140"/>
        <line x1="130" y1="104" x2="110" y2="140"/><line x1="130" y1="104" x2="150" y2="140"/>
      </g>
      {/* root node */}
      <g><rect x="78" y="28" width="34" height="20" rx="3" fill="#d01012"/><g fill="#e84a4a"><ellipse cx="87" cy="28" rx="6" ry="2.6"/><ellipse cx="103" cy="28" rx="6" ry="2.6"/></g></g>
      {/* level 2 */}
      <g><rect x="44" y="92" width="32" height="18" rx="3" fill="#006cb7"/><g fill="#2a8fd4"><ellipse cx="53" cy="92" rx="6" ry="2.4"/><ellipse cx="67" cy="92" rx="6" ry="2.4"/></g></g>
      <g><rect x="114" y="92" width="32" height="18" rx="3" fill="#006cb7"/><g fill="#2a8fd4"><ellipse cx="123" cy="92" rx="6" ry="2.4"/><ellipse cx="137" cy="92" rx="6" ry="2.4"/></g></g>
      {/* leaves */}
      <g fill="#2f9e44"><rect x="26" y="140" width="28" height="16" rx="3"/><rect x="66" y="140" width="28" height="16" rx="3"/><rect x="96" y="140" width="28" height="16" rx="3"/><rect x="136" y="140" width="28" height="16" rx="3"/></g>
      <g fill="#54bf69"><ellipse cx="34" cy="140" rx="5" ry="2.2"/><ellipse cx="46" cy="140" rx="5" ry="2.2"/><ellipse cx="74" cy="140" rx="5" ry="2.2"/><ellipse cx="86" cy="140" rx="5" ry="2.2"/><ellipse cx="104" cy="140" rx="5" ry="2.2"/><ellipse cx="116" cy="140" rx="5" ry="2.2"/><ellipse cx="144" cy="140" rx="5" ry="2.2"/><ellipse cx="156" cy="140" rx="5" ry="2.2"/></g>
      {/* a minifigure walks the tree (DFS) — Lego theme only */}
      <Climber className="tree-walker" torso="#f6a700" />
    </svg>
  );
}
