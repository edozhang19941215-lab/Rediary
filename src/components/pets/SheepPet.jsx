export default function SheepPet({ size = 90, animated = true }) {
  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 80 96"
      xmlns="http://www.w3.org/2000/svg"
      style={animated ? { animation: 'float 4s ease-in-out infinite 1s' } : {}}
    >
      {/* Fluffy body (tall egg shape) */}
      <ellipse cx="40" cy="45" rx="24" ry="35" fill="white" stroke="#1A0A06" strokeWidth="2.2"/>
      {/* Wool texture bumps on body */}
      <ellipse cx="22" cy="38" rx="8" ry="7" fill="white" stroke="#1A0A06" strokeWidth="1.5"/>
      <ellipse cx="58" cy="38" rx="8" ry="7" fill="white" stroke="#1A0A06" strokeWidth="1.5"/>
      <ellipse cx="18" cy="50" rx="7" ry="6" fill="white" stroke="#1A0A06" strokeWidth="1.5"/>
      <ellipse cx="62" cy="50" rx="7" ry="6" fill="white" stroke="#1A0A06" strokeWidth="1.5"/>
      {/* Ears */}
      <ellipse cx="24" cy="15" rx="7" ry="9" fill="#F5D5C8" stroke="#1A0A06" strokeWidth="2"/>
      <ellipse cx="56" cy="15" rx="7" ry="9" fill="#F5D5C8" stroke="#1A0A06" strokeWidth="2"/>
      {/* Head area (slightly rosy face) */}
      <ellipse cx="40" cy="20" rx="18" ry="17" fill="#FFF0E8" stroke="#1A0A06" strokeWidth="1.5"/>
      {/* Rosy cheeks */}
      <ellipse cx="30" cy="24" rx="6" ry="4" fill="#F0A0A0" opacity="0.3"/>
      <ellipse cx="50" cy="24" rx="6" ry="4" fill="#F0A0A0" opacity="0.3"/>
      {/* Eyes */}
      <ellipse cx="35" cy="20" rx="3" ry="4" fill="#1A0A06"/>
      <ellipse cx="45" cy="20" rx="3" ry="4" fill="#1A0A06"/>
      <ellipse cx="34" cy="18.5" rx="1" ry="1.5" fill="white"/>
      <ellipse cx="44" cy="18.5" rx="1" ry="1.5" fill="white"/>
      {/* Y-shaped nose */}
      <path d="M40 26 L40 29 M40 29 L38 31 M40 29 L42 31" stroke="#8B5A4A" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Arms holding cloud */}
      <ellipse cx="24" cy="58" rx="6" ry="10" fill="white" stroke="#1A0A06" strokeWidth="1.8"/>
      <ellipse cx="56" cy="58" rx="6" ry="10" fill="white" stroke="#1A0A06" strokeWidth="1.8"/>
      {/* Mini cloud pet */}
      <ellipse cx="40" cy="70" rx="14" ry="9" fill="#C8D8E8" stroke="#1A0A06" strokeWidth="1.8"/>
      <ellipse cx="32" cy="67" rx="7" ry="6" fill="#D0E0F0" stroke="#1A0A06" strokeWidth="1.5"/>
      <ellipse cx="48" cy="67" rx="7" ry="6" fill="#D0E0F0" stroke="#1A0A06" strokeWidth="1.5"/>
      <ellipse cx="40" cy="65" rx="8" ry="7" fill="#D8E8F8" stroke="#1A0A06" strokeWidth="1.5"/>
      {/* Cloud eyes */}
      <circle cx="37" cy="70" r="3" fill="#1A0A06"/>
      <circle cx="43" cy="70" r="3" fill="#1A0A06"/>
      <circle cx="36" cy="69" r="1" fill="white"/>
      <circle cx="42" cy="69" r="1" fill="white"/>
    </svg>
  );
}
