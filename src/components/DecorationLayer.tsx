import { useTheme } from "@/theme/useTheme";
import { Brick } from "@/lego/Brick";
import { Minifigure } from "@/lego/Minifigure";

export type Density = "sparse" | "normal" | "high" | "max";

// Full Lego palette so colors feel naturally varied across sections.
const PALETTE = ["#d01012", "#006cb7", "#2f9e44", "#f6a700", "#7048b0", "#e8590c"];

// Corner clusters only — pieces sit in the four corners (two spots per corner)
// rather than floating along the edges, which read as random. Kept clear of the
// centered content column.
const SLOTS: React.CSSProperties[] = [
  // top-left
  { left: 10, top: 18 },
  { left: 32, top: 34 },
  { left: 18, top: 52 },
  // top-right
  { right: 10, top: 18 },
  { right: 32, top: 34 },
  { right: 18, top: 52 },
  // bottom-left
  { left: 12, bottom: 20 },
  { left: 34, bottom: 32 },
  { left: 20, bottom: 50 },
  // bottom-right
  { right: 12, bottom: 20 },
  { right: 34, bottom: 32 },
  { right: 20, bottom: 50 },
];

const COUNT: Record<Density, [number, number]> = {
  sparse: [1, 2],
  normal: [2, 3],
  high: [4, 5],
  max: [8, 10],
};

// Deterministic seed from a string so each section's arrangement is stable
// across reloads (no flicker) while differing between sections.
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function DecorationLayer({
  seed = "",
  density = "normal",
}: {
  seed?: string;
  density?: Density;
}) {
  const { theme } = useTheme();
  if (theme !== "lego") return null;

  const rnd = mulberry32(hashSeed(seed || density));
  const [lo, hi] = COUNT[density];
  const count = lo + Math.floor(rnd() * (hi - lo + 1));

  // Pick `count` distinct slots so pieces spread around the edges.
  const available = [...SLOTS];
  const placements: React.CSSProperties[] = [];
  for (let i = 0; i < count && available.length > 0; i++) {
    const idx = Math.floor(rnd() * available.length);
    placements.push(available.splice(idx, 1)[0]);
  }

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {placements.map((pos, i) => {
        const isMinifig = rnd() < 0.22;
        const rotation = Math.round(rnd() * 20 - 10);
        const color = PALETTE[Math.floor(rnd() * PALETTE.length)];
        const studs = 2 + Math.floor(rnd() * 2);
        const width = 44 + Math.floor(rnd() * 36);
        const legColor = PALETTE[Math.floor(rnd() * PALETTE.length)];
        return (
          <div
            key={i}
            className="absolute hidden sm:block"
            style={{ ...pos, transform: `rotate(${rotation}deg)` }}
          >
            {isMinifig ? (
              <Minifigure width={46} torso={color} arms={color} legs={legColor} hips={legColor} />
            ) : (
              <Brick color={color} studs={studs} width={width} />
            )}
          </div>
        );
      })}
    </div>
  );
}
