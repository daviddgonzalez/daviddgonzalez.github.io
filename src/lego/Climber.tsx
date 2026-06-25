// A tiny minifigure (~18px tall) used as a "walker" that traverses a tree or
// graph inside a build SVG. Drawn centered on x=0 with feet at y=0, so a CSS
// `translate` can place/move its feet onto any node coordinate.
export function Climber({ torso = "#d01012", className }: { torso?: string; className?: string }) {
  return (
    <g className={className} aria-hidden="true">
      {/* legs */}
      <rect x="-3.4" y="-4.4" width="3" height="4.6" rx="1" fill="#1c54a8" />
      <rect x="0.4" y="-4.4" width="3" height="4.6" rx="1" fill="#1c54a8" />
      {/* arms (one raised, mid-stride) */}
      <rect x="-6.2" y="-10" width="2.4" height="5.6" rx="1.2" fill={torso} />
      <rect x="4" y="-12.4" width="2.4" height="5.8" rx="1.2" fill={torso} transform="rotate(30 5 -10)" />
      {/* torso + head */}
      <rect x="-4.3" y="-10.6" width="8.6" height="7" rx="2" fill={torso} />
      <circle cx="0" cy="-13.8" r="4" fill="#ffd21f" />
      <rect x="-2.6" y="-17.6" width="5.2" height="2.6" rx="1.1" fill="#e6bd00" />
    </g>
  );
}
