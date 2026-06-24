export function Stud({ x, y, color }: { x: number; y: number; color: string }) {
  return <ellipse cx={x} cy={y} rx={7} ry={3} fill={color} />;
}
