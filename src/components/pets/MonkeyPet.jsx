export default function MonkeyPet({ size = 90, animated = true }) {
  return (
    <svg
      width={size}
      height={size * 1.15}
      viewBox="0 0 80 92"
      xmlns="http://www.w3.org/2000/svg"
      style={animated ? { animation: 'float 3.5s ease-in-out infinite 0.5s' } : {}}
    >
      {/* Fluffy head (cloud-like) */}
      <circle cx="25" cy="28" r="14" fill="#5A3A10" stroke="#1A0A06" strokeWidth="2"/>
      <circle cx="40" cy="22" r="16" fill="#5A3A10" stroke="#1A0A06" strokeWidth="2"/>
      <circle cx="55" cy="28" r="14" fill="#5A3A10" stroke="#1A0A06" strokeWidth="2"/>
      <circle cx="40" cy="35" r="16" fill="#5A3A10" stroke="#1A0A06" strokeWidth="2"/>
      {/* Cover joins */}
      <ellipse cx="40" cy="28" rx="22" ry="18" fill="#5A3A10"/>
      {/* Oval face */}
      <ellipse cx="40" cy="33" rx="14" ry="16" fill="#F0D5B8" stroke="#1A0A06" strokeWidth="1.8"/>
      {/* Eyes - small oval, sleepy/cool */}
      <ellipse cx="34" cy="30" rx="3.5" ry="4.5" fill="#1A0A06"/>
      <ellipse cx="46" cy="30" rx="3.5" ry="4.5" fill="#1A0A06"/>
      <ellipse cx="33" cy="28.5" rx="1.2" ry="1.5" fill="white"/>
      <ellipse cx="45" cy="28.5" rx="1.2" ry="1.5" fill="white"/>
      {/* Nose dots */}
      <circle cx="38" cy="36" r="1.2" fill="#8B5A2A"/>
      <circle cx="42" cy="36" r="1.2" fill="#8B5A2A"/>
      {/* Tiny smile */}
      <path d="M37 40 Q40 42 43 40" stroke="#6B3A1A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Body */}
      <ellipse cx="40" cy="68" rx="16" ry="18" fill="#5A3A10" stroke="#1A0A06" strokeWidth="2"/>
      {/* Left arm */}
      <ellipse cx="22" cy="68" rx="6" ry="10" fill="#5A3A10" stroke="#1A0A06" strokeWidth="1.8"/>
      {/* Right arm with watch */}
      <ellipse cx="58" cy="68" rx="6" ry="10" fill="#5A3A10" stroke="#1A0A06" strokeWidth="1.8"/>
      {/* Smart watch */}
      <rect x="53" y="73" width="10" height="8" rx="2" fill="#C8E0F0" stroke="#1A0A06" strokeWidth="1.5"/>
      <rect x="54.5" y="74.5" width="7" height="5" rx="1" fill="#8EB8D8"/>
      {/* Tail */}
      <path d="M24 80 Q10 85 14 72" stroke="#5A3A10" strokeWidth="5" fill="none" strokeLinecap="round"/>
      <path d="M24 80 Q10 85 14 72" stroke="#1A0A06" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.3"/>
    </svg>
  );
}
