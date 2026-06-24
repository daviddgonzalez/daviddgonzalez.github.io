export function LegoComputer({ width = 150 }: { width?: number }) {
  return (
    <svg viewBox="0 0 180 150" width={width} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="lc-scr" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0d3b66" />
          <stop offset="1" stopColor="#2a8fd4" />
        </linearGradient>
      </defs>
      <rect x="58" y="128" width="64" height="11" rx="3" fill="#2c3036" />
      <rect x="84" y="112" width="12" height="18" fill="#3a3f47" />
      <g fill="#565d68">
        <ellipse cx="52" cy="26" rx="9" ry="3.4" /><ellipse cx="78" cy="26" rx="9" ry="3.4" />
        <ellipse cx="104" cy="26" rx="9" ry="3.4" /><ellipse cx="130" cy="26" rx="9" ry="3.4" />
      </g>
      <rect x="30" y="30" width="120" height="82" rx="6" fill="#3a3f47" />
      <rect x="40" y="40" width="100" height="62" rx="3" fill="url(#lc-scr)" />
      <rect x="48" y="50" width="56" height="5" rx="2.5" fill="#fff" opacity="0.85" />
      <rect x="48" y="60" width="38" height="5" rx="2.5" fill="#fff" opacity="0.6" />
      <rect x="48" y="70" width="66" height="5" rx="2.5" fill="#fff" opacity="0.45" />
      <rect x="48" y="80" width="30" height="5" rx="2.5" fill="#ffd21f" opacity="0.9" />
    </svg>
  );
}
