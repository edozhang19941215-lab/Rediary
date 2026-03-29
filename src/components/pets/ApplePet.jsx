export default function ApplePet({ size = 90, animated = true }) {
  return (
    <svg
      width={size}
      height={size * 1.1}
      viewBox="0 0 80 88"
      xmlns="http://www.w3.org/2000/svg"
      style={animated ? { animation: 'float 2.5s ease-in-out infinite 0.2s' } : {}}
    >
      {/* Stem */}
      <rect x="38" y="2" width="4" height="10" rx="2" fill="#1A0A06"/>
      {/* Apple body */}
      <ellipse cx="40" cy="48" rx="28" ry="30" fill="#D81818" stroke="#1A0A06" strokeWidth="2.5"/>
      {/* Sports headband */}
      <rect x="12" y="34" width="56" height="10" rx="0" fill="#D81818"/>
      <rect x="12" y="34" width="56" height="10" rx="0" fill="white" opacity="0.9"/>
      <rect x="12" y="40" width="56" height="4" rx="0" fill="#70B890"/>
      <rect x="12" y="34" width="56" height="1" rx="0" fill="#1A0A06" opacity="0.5"/>
      <rect x="12" y="43" width="56" height="1" rx="0" fill="#1A0A06" opacity="0.5"/>
      {/* Lower apple area (below headband) */}
      <path d="M12 44 Q12 78 40 78 Q68 78 68 44 Z" fill="#D81818"/>
      {/* Eyes */}
      <circle cx="33" cy="56" r="7" fill="#1A0A06"/>
      <circle cx="47" cy="56" r="7" fill="#1A0A06"/>
      <circle cx="31" cy="54" r="2.5" fill="white"/>
      <circle cx="45" cy="54" r="2.5" fill="white"/>
      {/* Mouth */}
      <path d="M36 65 Q40 68 44 65" stroke="#E05050" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Left arm - hand on hip */}
      <ellipse cx="14" cy="60" rx="5" ry="9" fill="#F5C5A8" stroke="#1A0A06" strokeWidth="2" transform="rotate(20 14 60)"/>
      {/* Right arm - raised */}
      <ellipse cx="66" cy="52" rx="5" ry="9" fill="#F5C5A8" stroke="#1A0A06" strokeWidth="2" transform="rotate(-30 66 52)"/>
      {/* Legs */}
      <rect x="30" y="76" width="8" height="12" rx="4" fill="#F5C5A8" stroke="#1A0A06" strokeWidth="2"/>
      <rect x="42" y="76" width="8" height="12" rx="4" fill="#F5C5A8" stroke="#1A0A06" strokeWidth="2"/>
    </svg>
  );
}
