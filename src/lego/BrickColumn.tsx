function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp(((n >> 16) & 255) + Math.round(255 * amt));
  const g = clamp(((n >> 8) & 255) + Math.round(255 * amt));
  const b = clamp((n & 255) + Math.round(255 * amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// A vertical stack of connected bricks rendered as one SVG. Studs only appear on
// the topmost brick — the bricks below have their studs hidden under the brick
// sitting on them, which is how real stacked bricks look. A darker lip at the
// bottom of each brick reads as the seam between connected bricks.
export function BrickColumn({
  colors,
  width = 60,
  studs = 3,
  className,
}: {
  colors: string[];
  width?: number;
  studs?: number;
  className?: string;
}) {
  const bodyH = 22;
  const studTop = 7;
  const totalH = studTop + colors.length * bodyH;
  const gap = width / (studs + 1);
  const topColor = colors[0] ?? "#006cb7";
  return (
    <svg
      viewBox={`0 0 ${width} ${totalH}`}
      width={width}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {colors.map((c, i) => {
        const y = studTop + i * bodyH;
        return (
          <g key={i}>
            <rect x={0} y={y} width={width} height={bodyH} rx={3} fill={c} />
            <rect x={0} y={y + bodyH - 5} width={width} height={5} rx={3} fill={shade(c, -0.2)} />
            <rect x={4} y={y + 3} width={width - 8} height={2.5} rx={1.25} fill={shade(c, 0.24)} />
          </g>
        );
      })}
      {/* studs on the topmost brick only */}
      {Array.from({ length: studs }).map((_, i) => (
        <ellipse
          key={i}
          cx={gap * (i + 1)}
          cy={studTop}
          rx={width / (studs * 2.6)}
          ry={3.4}
          fill={shade(topColor, 0.18)}
        />
      ))}
    </svg>
  );
}
