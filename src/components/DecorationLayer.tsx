import { useEffect, useState } from "react";
import { useTheme } from "@/theme/useTheme";
import { BrickColumn } from "@/lego/BrickColumn";
import { BrickPile, type Orient } from "@/lego/BrickPile";
import { Minifigure } from "@/lego/Minifigure";

export type Density = "sparse" | "normal" | "high" | "max";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

// Full Lego palette so colors feel naturally varied across sections.
const PALETTE = ["#d01012", "#006cb7", "#2f9e44", "#f6a700", "#7048b0", "#e8590c"];

// One anchor per corner, each carrying the orientation its brick pile hugs.
type CornerDef = { pos: React.CSSProperties; orient: Orient };
const CORNERS: CornerDef[] = [
  { pos: { left: 14, top: 14 }, orient: "tl" },
  { pos: { right: 14, top: 14 }, orient: "tr" },
  { pos: { left: 16, bottom: 14 }, orient: "bl" },
  { pos: { right: 16, bottom: 14 }, orient: "br" },
];

// How many corners to populate, and how big each triangular pile is, per
// density. The hero is "max", so the top of the page gets the biggest piles.
const PLAN: Record<Density, { corners: number; size: number }> = {
  sparse: { corners: 1, size: 2 },
  normal: { corners: 2, size: 3 },
  high: { corners: 3, size: 4 },
  max: { corners: 4, size: 5 },
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

  // The bricks "assemble" (drop + snap in) whenever the Lego decoration
  // appears: on every page load/refresh and when switching into the Lego
  // theme. The CSS animation fires on element mount; we just decide whether
  // the `brick-drop` class is present. Skipped under reduced-motion. Hooks
  // must run before the early return, so they stay above the theme guard.
  const [assemble, setAssemble] = useState(
    () => theme === "lego" && !prefersReducedMotion()
  );
  useEffect(() => {
    setAssemble(theme === "lego" && !prefersReducedMotion());
  }, [theme]);

  if (theme !== "lego") return null;

  const rnd = mulberry32(hashSeed(seed || density));
  const plan = PLAN[density];

  // Pick which corners to populate (distinct, so piles stay far apart).
  const pool = [...CORNERS];
  const corners: CornerDef[] = [];
  for (let i = 0; i < plan.corners && pool.length > 0; i++) {
    corners.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  }

  // Mobile gets a couple of small bricks in the BOTTOM corners — they sit in
  // the section's bottom padding (clear of the text) and never hide behind the
  // sticky nav the way top-anchored pieces would. Desktop pieces are hidden on
  // mobile and vice versa.
  const mobileSlots: React.CSSProperties[] = [
    { left: 10, bottom: 10 },
    { right: 10, bottom: 10 },
  ];
  const mobileCount = density === "high" || density === "max" ? 2 : 1;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {mobileSlots.slice(0, mobileCount).map((pos, k) => {
        const colors = Array.from(
          { length: 2 + Math.floor(rnd() * 2) },
          () => PALETTE[Math.floor(rnd() * PALETTE.length)]
        );
        return (
          <div
            key={`m${k}`}
            className={`absolute sm:hidden${assemble ? " brick-drop" : ""}`}
            style={{
              ...pos,
              rotate: `${k ? 4 : -4}deg`,
              ...(assemble ? { animationDelay: `${k * 90}ms` } : {}),
            }}
          >
            <BrickColumn colors={colors} width={42} studs={3} />
          </div>
        );
      })}
      {corners.map((corner, i) => {
        const rotation = Math.round(rnd() * 8 - 4);
        const baseStyle: React.CSSProperties = {
          ...corner.pos,
          rotate: `${rotation}deg`,
          ...(assemble ? { animationDelay: `${i * 90}ms` } : {}),
        };
        const cls = `absolute hidden sm:block${assemble ? " brick-drop" : ""}`;
        const pileSeed = Math.floor(rnd() * 1e9);

        // The waving minifigure stands on the hero's bottom-left pile — the
        // top of the page, bottom-left corner.
        if (corner.orient === "bl" && seed === "hero") {
          const torso = PALETTE[Math.floor(rnd() * PALETTE.length)];
          const legs = PALETTE[Math.floor(rnd() * PALETTE.length)];
          return (
            <div key={i} className={cls} style={baseStyle}>
              <div className="flex flex-col items-start">
                <div style={{ marginBottom: -10, marginLeft: 10 }}>
                  <Minifigure wave width={52} torso={torso} arms={torso} legs={legs} hips={legs} />
                </div>
                <BrickPile orient="bl" size={plan.size} seed={pileSeed} palette={PALETTE} />
              </div>
            </div>
          );
        }

        return (
          <div key={i} className={cls} style={baseStyle}>
            <BrickPile orient={corner.orient} size={plan.size} seed={pileSeed} palette={PALETTE} />
          </div>
        );
      })}
    </div>
  );
}
