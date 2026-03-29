export default function BunnyPet({ size = 90, animated = true }) {
  return (
    <svg
      width={size}
      height={size * 1.15}
      viewBox="0 0 80 92"
      xmlns="http://www.w3.org/2000/svg"
      style={animated ? { animation: 'float 3s ease-in-out infinite' } : {}}
    >
      {/* Left ear */}
      <ellipse cx="28" cy="18" rx="9" ry="16" fill="#E8888E" stroke="#1A0A06" strokeWidth="2.2"/>
      <ellipse cx="28" cy="16" rx="5" ry="10" fill="#F5B5B8" opacity="0.6"/>
      {/* Right ear */}
      <ellipse cx="52" cy="18" rx="9" ry="16" fill="#E8888E" stroke="#1A0A06" strokeWidth="2.2"/>
      <ellipse cx="52" cy="16" rx="5" ry="10" fill="#F5B5B8" opacity="0.6"/>
      {/* Pink hair */}
      <ellipse cx="40" cy="30" rx="20" ry="11" fill="#E8888E" stroke="#1A0A06" strokeWidth="2"/>
      {/* Head */}
      <circle cx="40" cy="47" r="21" fill="#F5C5C8" stroke="#1A0A06" strokeWidth="2.2"/>
      {/* Rosy cheeks */}
      <ellipse cx="27" cy="51" rx="6" ry="4" fill="#F08090" opacity="0.35"/>
      <ellipse cx="53" cy="51" rx="6" ry="4" fill="#F08090" opacity="0.35"/>
      {/* Winking eye */}
      <path d="M30 45 L34 48 L30 51" stroke="#1A0A06" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Sparkle eye */}
      <circle cx="50" cy="47" r="5.5" fill="#1A0A06"/>
      <circle cx="48.5" cy="45" r="1.8" fill="white"/>
      <circle cx="52" cy="48" r="1" fill="white"/>
      {/* Mouth */}
      <path d="M37 55 Q40 58.5 43 55" stroke="#1A0A06" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      {/* Body / dress */}
      <ellipse cx="40" cy="79" rx="17" ry="13" fill="#E8888E" stroke="#1A0A06" strokeWidth="2"/>
      {/* Left arm */}
      <ellipse cx="23" cy="74" rx="5" ry="8" fill="#F5C5C8" stroke="#1A0A06" strokeWidth="1.8" transform="rotate(-25 23 74)"/>
      {/* Right arm - hand near cheek */}
      <ellipse cx="57" cy="70" rx="5" ry="8" fill="#F5C5C8" stroke="#1A0A06" strokeWidth="1.8" transform="rotate(20 57 70)"/>
      <circle cx="59" cy="63" r="4.5" fill="#F5C5C8" stroke="#1A0A06" strokeWidth="1.8"/>
    </svg>
  );
}
