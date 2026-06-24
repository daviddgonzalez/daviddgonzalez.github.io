import { Brick } from "../Brick";
export function BrickStack({ width = 90 }: { width?: number }) {
  return (
    <div style={{ width }} aria-hidden="true">
      <div style={{ transform: "rotate(-3deg)" }}><Brick color="#006cb7" studs={3} width={width} /></div>
      <div style={{ transform: "rotate(2deg)", marginTop: -4, marginLeft: 8 }}><Brick color="#d01012" studs={2} width={width * 0.7} /></div>
      <div style={{ transform: "rotate(-1deg)", marginTop: -4 }}><Brick color="#f6a700" studs={3} width={width * 0.85} /></div>
    </div>
  );
}
