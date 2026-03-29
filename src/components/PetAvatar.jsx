import { useState, useEffect } from 'react';
import { getPetImage } from '../data/petImages';

/**
 * Animation applied to the wrapper div per pet state.
 * All loops use CSS keyframes defined in index.css.
 */
function getAnimationStyle(state) {
  switch (state) {
    case 'welcome':
      return { animation: 'bounce-in 0.6s cubic-bezier(0.34,1.56,0.64,1) both, pet-float 3.5s ease-in-out 0.6s infinite' };
    case 'typing':
      return { animation: 'pet-nod 0.9s ease-in-out infinite' };
    case 'talking':
      return { animation: 'pet-breathe 2.8s ease-in-out infinite' };
    case 'happy':
      return { animation: 'bounce-in 0.4s ease both, pet-bounce-loop 0.65s ease-in-out 0.4s infinite' };
    case 'goodbye':
      return { animation: 'pet-fadeout 0.8s ease 0.3s forwards' };
    case 'playing':
      return { animation: 'pet-float-wide 2.2s ease-in-out infinite' };
    default:
      return {};
  }
}

/**
 * PetAvatar — image-based pet component with state-driven animation.
 *
 * Props:
 *   petId   — string, e.g. 'sheep'
 *   state   — 'welcome' | 'typing' | 'talking' | 'happy' | 'goodbye' | 'playing'
 *   size    — number (pixels), default 90
 */
export function PetAvatar({ petId, state = 'talking', size = 90 }) {
  // Crossfade between images on state change
  const [displayedState, setDisplayedState] = useState(state);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (state === displayedState) return;
    // Fade out → swap image → fade in
    setOpacity(0);
    const t = setTimeout(() => {
      setDisplayedState(state);
      setOpacity(1);
    }, 180);
    return () => clearTimeout(t);
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  const src = getPetImage(petId, displayedState);
  const animStyle = getAnimationStyle(state);

  return (
    <div style={{
      width: size,
      height: size,
      flexShrink: 0,
      ...animStyle,
    }}>
      <img
        src={src}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity,
          transition: 'opacity 0.18s ease',
          display: 'block',
        }}
      />
    </div>
  );
}
