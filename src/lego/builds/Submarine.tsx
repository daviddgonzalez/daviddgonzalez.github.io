export function Submarine({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 250 200" width={250} height={200} className={className} aria-hidden="true" focusable="false">
      {/* bubbles */}
      <g className="lego-rise" fill="#bfe3ff"><circle cx="50" cy="52" r="3.2"/><circle cx="43" cy="40" r="2.2"/><circle cx="54" cy="30" r="1.6"/></g>
      {/* propeller (rear-left) with shaft attaching to hull */}
      <g>
        <rect x="40" y="86" width="18" height="6" rx="2" fill="#565d68"/>
        <g className="lego-spin">
          <ellipse cx="40" cy="74" rx="5" ry="13" fill="#ffd21f"/>
          <ellipse cx="40" cy="102" rx="5" ry="13" fill="#ffd21f"/>
          <ellipse cx="40" cy="88" rx="5" ry="11" fill="#e6bd00"/>
          <circle cx="40" cy="88" r="4.5" fill="#3a3f47"/>
        </g>
      </g>
      {/* tail dive fin */}
      <path d="M62 66 L50 48 L72 62 Z" fill="#006cb7"/>
      {/* hull */}
      <rect x="56" y="64" width="132" height="50" rx="25" fill="#f6a700"/>
      {/* belly shading */}
      <path d="M64 98 q60 18 120 0 v6 q-60 16 -120 0 Z" fill="#e08f00" opacity="0.9"/>
      {/* panel/brick separation lines */}
      <g stroke="#d99100" strokeWidth="1.5" opacity="0.6"><line x1="92" y1="68" x2="92" y2="110"/><line x1="120" y1="66" x2="120" y2="112"/><line x1="148" y1="68" x2="148" y2="110"/></g>
      {/* top highlight line */}
      <path d="M70 78 q60 -10 116 0" stroke="#ffce4d" strokeWidth="2" fill="none" opacity="0.6"/>
      {/* studs on top */}
      <g fill="#ffc23d"><ellipse cx="80" cy="64" rx="8" ry="3.4"/><ellipse cx="108" cy="64" rx="8" ry="3.4"/><ellipse cx="136" cy="64" rx="8" ry="3.4"/><ellipse cx="164" cy="64" rx="8" ry="3.4"/></g>
      {/* rivets */}
      <g fill="#c47f00"><circle cx="76" cy="106" r="1.6"/><circle cx="104" cy="107" r="1.6"/><circle cx="132" cy="107" r="1.6"/><circle cx="160" cy="106" r="1.6"/></g>
      {/* nose sensor dome */}
      <path d="M188 64 q28 6 28 25 t-28 25 Z" fill="#006cb7"/>
      <ellipse cx="196" cy="89" rx="4" ry="11" fill="#2a8fd4"/>
      {/* portholes */}
      <g>
        <circle cx="86" cy="88" r="9" fill="#2a8fd4" stroke="#0d3b66" strokeWidth="2"/><path d="M82 84 a5 5 0 0 1 6 -1" stroke="#cdefff" strokeWidth="1.6" fill="none"/>
        <circle cx="116" cy="88" r="9" fill="#2a8fd4" stroke="#0d3b66" strokeWidth="2"/><path d="M112 84 a5 5 0 0 1 6 -1" stroke="#cdefff" strokeWidth="1.6" fill="none"/>
        <circle cx="146" cy="88" r="9" fill="#2a8fd4" stroke="#0d3b66" strokeWidth="2"/><path d="M142 84 a5 5 0 0 1 6 -1" stroke="#cdefff" strokeWidth="1.6" fill="none"/>
      </g>
      {/* conning tower */}
      <rect x="102" y="40" width="32" height="26" rx="5" fill="#d01012"/>
      <rect x="124" y="44" width="10" height="22" rx="3" fill="#b20d10"/>
      <g fill="#e84a4a"><ellipse cx="110" cy="40" rx="5" ry="2.4"/><ellipse cx="124" cy="40" rx="5" ry="2.4"/></g>
      {/* periscope */}
      <rect x="115" y="22" width="4" height="18" fill="#3a3f47"/><rect x="115" y="20" width="11" height="5" rx="2" fill="#3a3f47"/>
      {/* gripper underneath grasping a brick */}
      <g>
        <rect x="112" y="112" width="22" height="8" rx="2" fill="#565d68"/>
        <rect x="120" y="118" width="6" height="14" fill="#3a3f47"/>
        <circle cx="123" cy="133" r="4" fill="#565d68"/>
        <path d="M118 138 q-9 6 -6 18 q4 -4 6 -10" fill="#2f9e44"/>
        <path d="M128 138 q9 6 6 18 q-4 -4 -6 -10" fill="#2f9e44"/>
        {/* grasped brick */}
        <rect x="114" y="156" width="18" height="9" rx="2" fill="#d01012"/>
        <g fill="#e84a4a"><ellipse cx="120" cy="156" rx="3.5" ry="1.8"/><ellipse cx="128" cy="156" rx="3.5" ry="1.8"/></g>
      </g>
    </svg>
  );
}
