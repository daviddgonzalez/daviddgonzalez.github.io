import { useTheme } from "@/theme/useTheme";
import { BrickColumn } from "@/lego/BrickColumn";
import { Minifigure } from "@/lego/Minifigure";

export type Density = "sparse" | "normal" | "high" | "max";

// Full Lego palette so colors feel naturally varied across sections.
const PALETTE = ["#d01012", "#006cb7", "#2f9e44", "#f6a700", "#7048b0", "#e8590c"];

// One anchor per corner. Each populated corner gets exactly ONE item — a
// connected brick stack OR a minifigure — so a minifig never overlaps bricks.
const CORNERS: React.CSSProperties[] = [
  { left: 14, top: 14 },
  { right: 14, top: 14 },
  { left: 16, bottom: 14 },
  { right: 16, bottom: 14 },
];

// How many corners to populate, and how many bricks per stack, per density.
const PLAN: Record<Density, { corners: number; stack: [number, number] }> = {
  sparse: { corners: 1, stack: [2, 3] },
  normal: { corners: 2, stack: [2, 3] },
  high: { corners: 3, stack: [3, 4] },
  max: { corners: 4, stack: [4, 6] },
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
  const plan = PLAN[density];

  // Pick which corners to populate (distinct, so items stay far apart).
  const pool = [...CORNERS];
  const corners: React.CSSProperties[] = [];
  for (let i = 0; i < plan.corners && pool.length > 0; i++) {
    corners.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  }

  // At most one minifigure, only when 2+ corners are used — it takes a whole
  // corner to itself (no brick stack there), so it can't overlap bricks.
  const minifigCorner = plan.corners >= 2 && rnd() < 0.55 ? corners.length - 1 : -1;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {corners.map((pos, i) => {
        const rotation = Math.round(rnd() * 10 - 5);
        const baseStyle = { ...pos, transform: `rotate(${rotation}deg)` };

        if (i === minifigCorner) {
          const torso = PALETTE[Math.floor(rnd() * PALETTE.length)];
          const legs = PALETTE[Math.floor(rnd() * PALETTE.length)];
          return (
            <div key={i} className="absolute hidden sm:block" style={baseStyle}>
              <Minifigure width={50} torso={torso} arms={torso} legs={legs} hips={legs} />
            </div>
          );
        }

        const n = plan.stack[0] + Math.floor(rnd() * (plan.stack[1] - plan.stack[0] + 1));
        const colors = Array.from({ length: n }, () => PALETTE[Math.floor(rnd() * PALETTE.length)]);
        const width = 54 + Math.floor(rnd() * 20);
        const studs = 2 + Math.floor(rnd() * 2);
        return (
          <div key={i} className="absolute hidden sm:block" style={baseStyle}>
            <BrickColumn colors={colors} width={width} studs={studs} />
          </div>
        );
      })}
    </div>
  );
}
