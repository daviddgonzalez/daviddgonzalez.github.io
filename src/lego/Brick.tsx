type BrickProps = {
  color?: string;
  studs?: number;
  width?: number;
  className?: string;
} & React.SVGProps<SVGSVGElement>;

export function Brick({
  color = "#006cb7",
  studs = 2,
  width = 64,
  className,
  ...rest
}: BrickProps) {
  const height = 26;
  const studGap = width / (studs + 1);
  const lighter = shade(color, 0.18);
  return (
    <svg
      viewBox={`0 0 ${width} ${height + 6}`}
      width={width}
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <rect x={0} y={6} width={width} height={height} rx={3} fill={color} />
      <rect x={0} y={height - 1} width={width} height={7} rx={3} fill={shade(color, -0.2)} opacity={0.5} />
      {Array.from({ length: studs }).map((_, i) => (
        <ellipse key={i} cx={studGap * (i + 1)} cy={6} rx={7} ry={3} fill={lighter} />
      ))}
    </svg>
  );
}

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp(((n >> 16) & 255) + Math.round(255 * amt));
  const g = clamp(((n >> 8) & 255) + Math.round(255 * amt));
  const b = clamp((n & 255) + Math.round(255 * amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
