import { useState, useRef, useCallback, useEffect } from 'react';

const IDLE_MS = 8000; // 8s no interaction → playing

/**
 * Manages pet display state with idle detection.
 *
 * States: 'welcome' | 'typing' | 'talking' | 'happy' | 'goodbye' | 'playing'
 *
 * Usage:
 *   const [petState, setPetState] = usePetState('welcome');
 *   setPetState('typing');
 *   setPetState('happy', { thenTalking: 2000 }); // auto-revert after 2s
 */
export function usePetState(initialState = 'welcome') {
  const [petState, setPetStateRaw] = useState(initialState);
  const idleTimer = useRef(null);
  const revertTimer = useRef(null);

  const resetIdle = useCallback(() => {
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setPetStateRaw('playing'), IDLE_MS);
  }, []);

  const setPetState = useCallback((newState, opts = {}) => {
    clearTimeout(revertTimer.current);
    setPetStateRaw(newState);

    // Don't reset idle when going to goodbye or already playing
    if (newState !== 'goodbye') {
      resetIdle();
    } else {
      clearTimeout(idleTimer.current);
    }

    // Auto-revert to 'talking' after duration
    if (opts.thenTalking) {
      revertTimer.current = setTimeout(() => {
        setPetStateRaw('talking');
        resetIdle();
      }, opts.thenTalking);
    }
  }, [resetIdle]);

  // On mount: start idle timer; if welcome, auto-transition to talking
  useEffect(() => {
    if (initialState === 'welcome') {
      revertTimer.current = setTimeout(() => {
        setPetStateRaw('talking');
        resetIdle();
      }, 2500);
    } else {
      resetIdle();
    }
    return () => {
      clearTimeout(idleTimer.current);
      clearTimeout(revertTimer.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return [petState, setPetState];
}
