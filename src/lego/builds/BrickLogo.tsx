const HEART = [
  [0, 1, 0, 1, 0],
  [1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1],
  [0, 1, 1, 1, 0],
  [0, 0, 1, 0, 0],
];
export function BrickLogo({ size = 100, color = "#d01012" }: { size?: number; color?: string }) {
  const cell = size / 5;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} aria-hidden="true" focusable="false">
      {HEART.flatMap((row, r) =>
        row.map((on, c) =>
          on ? (
            <g key={`${r}-${c}`}>
              <rect x={c * cell + 2} y={r * cell + 2} width={cell - 4} height={cell - 4} rx={3} fill={color} />
              <ellipse cx={c * cell + cell / 2} cy={r * cell + 6} rx={cell / 5} ry={cell / 12} fill="#fff" opacity={0.3} />
            </g>
          ) : null
        )
      )}
    </svg>
  );
}
