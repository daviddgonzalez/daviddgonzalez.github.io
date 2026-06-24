export function LegoPhone({ width = 90 }: { width?: number }) {
  return (
    <svg viewBox="0 0 70 110" width={width} aria-hidden="true" focusable="false">
      <rect x="12" y="6" width="46" height="98" rx="9" fill="#2f9e44" />
      <ellipse cx="27" cy="8" rx="6" ry="3" fill="#54bf69" />
      <ellipse cx="43" cy="8" rx="6" ry="3" fill="#54bf69" />
      <rect x="18" y="14" width="34" height="74" rx="3" fill="#eaf4ff" />
      <rect x="24" y="22" width="22" height="5" rx="2.5" fill="#cfe0f5" />
      <rect x="24" y="31" width="16" height="5" rx="2.5" fill="#cfe0f5" />
      <rect x="27" y="46" width="16" height="16" rx="4" fill="#d01012" />
    </svg>
  );
}
