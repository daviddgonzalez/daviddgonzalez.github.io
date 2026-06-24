import { useTheme } from "@/theme/useTheme";
import { Brick } from "@/lego/Brick";
import { Minifigure } from "@/lego/Minifigure";

type Piece = { node: React.ReactNode; style: React.CSSProperties };

const PIECES: Piece[] = [
  { node: <Brick color="#006cb7" studs={3} width={70} />, style: { left: 12, bottom: 10, transform: "rotate(-5deg)" } },
  { node: <Brick color="#d01012" studs={2} width={48} />, style: { left: 90, bottom: 10, transform: "rotate(4deg)" } },
  { node: <Brick color="#2f9e44" studs={2} width={54} />, style: { right: 80, bottom: 12, transform: "rotate(5deg)" } },
  { node: <Brick color="#f6a700" studs={3} width={74} />, style: { right: 14, bottom: 10, transform: "rotate(-4deg)" } },
  { node: <Brick color="#7048b0" studs={2} width={40} />, style: { left: 20, top: 14, transform: "rotate(9deg)" } },
  { node: <Minifigure width={54} />, style: { right: 18, bottom: 8 } },
];

export function DecorationLayer({ density = 1 }: { density?: number }) {
  const { theme } = useTheme();
  if (theme !== "lego") return null;
  const pieces = PIECES.slice(0, Math.max(2, Math.round(PIECES.length * density)));
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p, i) => (
        <div key={i} className="absolute hidden sm:block" style={p.style}>
          {p.node}
        </div>
      ))}
    </div>
  );
}
