export default function BirdPet({ size = 90, animated = true }) {
  return (
    <svg
      width={size}
      height={size * 1.1}
      viewBox="0 0 80 88"
      xmlns="http://www.w3.org/2000/svg"
      style={animated ? { animation: 'float 3.2s ease-in-out infinite 0.8s' } : {}}
    >
      {/* Beret */}
      <ellipse cx="40" cy="14" rx="18" ry="10" fill="#7B4A18" stroke="#1A0A06" strokeWidth="2"/>
      <ellipse cx="40" cy="12" rx="15" ry="7" fill="#8B5A20"/>
      <circle cx="40" cy="8" r="3" fill="#7B4A18" stroke="#1A0A06" strokeWidth="1.5"/>
      {/* Head */}
      <ellipse cx="40" cy="26" rx="16" ry="15" fill="#F5C820" stroke="#1A0A06" strokeWidth="2.2"/>
      {/* Eyes - relaxed/sophisticated (u shapes) */}
      <path d="M32 24 Q34 27 36 24" stroke="#1A0A06" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M44 24 Q46 27 48 24" stroke="#1A0A06" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Beak */}
      <path d="M37 30 L40 35 L43 30 Z" fill="#E87820" stroke="#1A0A06" strokeWidth="1.5"/>
      {/* White chest body (pear shape) */}
      <ellipse cx="40" cy="62" rx="20" ry="24" fill="white" stroke="#1A0A06" strokeWidth="2.2"/>
      {/* Yellow head connects to body */}
      <rect x="32" y="36" width="16" height="12" fill="#F5C820" stroke="#1A0A06" strokeWidth="0"/>
      <path d="M30 40 Q30 48 20 52" stroke="#1A0A06" strokeWidth="2.2" fill="none"/>
      <path d="M50 40 Q50 48 60 52" stroke="#1A0A06" strokeWidth="2.2" fill="none"/>
      {/* Yellow neck area */}
      <ellipse cx="40" cy="40" rx="12" ry="6" fill="#F5C820"/>
      {/* Left wing - thinking pose (wing to chin) */}
      <path d="M20 55 Q10 58 14 45 Q22 38 28 48" fill="#F5C820" stroke="#1A0A06" strokeWidth="2" strokeLinejoin="round"/>
      {/* Wing tip at chin */}
      <ellipse cx="28" cy="35" rx="6" ry="4" fill="#F5C820" stroke="#1A0A06" strokeWidth="1.8"/>
      {/* Right wing */}
      <path d="M60 55 Q70 58 66 45 Q58 38 52 48" fill="#F5C820" stroke="#1A0A06" strokeWidth="2" strokeLinejoin="round"/>
      {/* Feet */}
      <path d="M33 84 L28 88 M33 84 L33 88 M33 84 L38 88" stroke="#E87820" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M47 84 L42 88 M47 84 L47 88 M47 84 L52 88" stroke="#E87820" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}
