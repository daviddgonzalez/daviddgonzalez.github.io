function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp(((n >> 16) & 255) + Math.round(255 * amt));
  const g = clamp(((n >> 8) & 255) + Math.round(255 * amt));
  const b = clamp((n & 255) + Math.round(255 * amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Which corner the right angle hugs. The two legs run along the page edges;
// the hypotenuse steps across diagonally.
export type Orient = "tl" | "tr" | "bl" | "br";

const U = 26; // brick unit width (px)
const BB = 22; // brick body height
const STUD_TOP = 8; // headroom above the body for studs
const RH = BB; // row pitch — rows sit directly on each other

type PieceBrick = {
  x: number;
  y: number;
  w: number; // px
  units: number;
  color: string;
  rot: number;
  studs: boolean;
};

// A blocky right-triangle pile of bricks rendered as one SVG. Row lengths jitter
// slightly (asymmetry), colors vary per brick, and some bricks span two studs —
// so it reads hand-built rather than a clean staircase, while staying grid-ish.
export function BrickPile({
  orient,
  size,
  seed,
  palette,
  className,
}: {
  orient: Orient;
  size: number;
  seed: number;
  palette: string[];
  className?: string;
}) {
  const rnd = mulberry32(seed);
  const N = Math.max(1, size);
  const grow = orient === "bl" || orient === "br"; // wide row at the bottom
  const rightAligned = orient === "tr" || orient === "br";

  // 1. Filled grid: a right triangle with slight per-row length jitter.
  const grid: boolean[][] = [];
  for (let r = 0; r < N; r++) {
    const raw = grow ? r + 1 : N - r;
    const jitter = rnd() < 0.4 ? (rnd() < 0.5 ? -1 : 1) : 0;
    const len = Math.max(1, Math.min(N, raw + jitter));
    const row = new Array<boolean>(N).fill(false);
    for (let k = 0; k < len; k++) row[rightAligned ? N - 1 - k : k] = true;
    grid.push(row);
  }

  // 2. Walk each row left→right, merging filled cells into 1- or 2-unit bricks.
  //    A brick shows studs when nothing sits directly above it.
  const exposed = (r: number, c: number) => grid[r][c] && !(r > 0 && grid[r - 1][c]);
  const bricks: PieceBrick[] = [];
  for (let r = 0; r < N; r++) {
    let c = 0;
    let prevColor = "";
    while (c < N) {
      if (!grid[r][c]) {
        c++;
        continue;
      }
      const units = c + 1 < N && grid[r][c + 1] && rnd() < 0.4 ? 2 : 1;
      let color = palette[Math.floor(rnd() * palette.length)];
      if (color === prevColor) color = palette[Math.floor(rnd() * palette.length)];
      prevColor = color;
      const studs = exposed(r, c) || (units === 2 && exposed(r, c + 1));
      bricks.push({
        x: c * U + (rnd() * 3 - 1.5),
        y: STUD_TOP + r * RH,
        w: units * U - 2,
        units,
        color,
        rot: rnd() * 3 - 1.5,
        studs,
      });
      c += units;
    }
  }

  const width = N * U + 6;
  const height = STUD_TOP + N * RH + 6;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {bricks.map((b, i) => {
        const cx = b.x + b.w / 2;
        const cy = b.y + BB / 2;
        return (
          <g key={i} transform={`rotate(${b.rot} ${cx} ${cy})`}>
            <rect x={b.x} y={b.y} width={b.w} height={BB} rx={3} fill={b.color} />
            <rect
              x={b.x}
              y={b.y + BB - 5}
              width={b.w}
              height={5}
              rx={3}
              fill={shade(b.color, -0.2)}
            />
            <rect
              x={b.x + 3}
              y={b.y + 3}
              width={b.w - 6}
              height={2.4}
              rx={1.2}
              fill={shade(b.color, 0.24)}
            />
            {b.studs &&
              Array.from({ length: b.units }).map((_, s) => (
                <ellipse
                  key={s}
                  cx={b.x + (b.w * (s + 0.5)) / b.units}
                  cy={b.y}
                  rx={5.5}
                  ry={3.2}
                  fill={shade(b.color, 0.18)}
                />
              ))}
          </g>
        );
      })}
    </svg>
  );
}
