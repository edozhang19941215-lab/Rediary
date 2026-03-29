import { useState, useEffect } from 'react';

export default function SpeechBubble({ text, isLoading = false, petColor = '#E8808A', onDone }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const onDoneRef = useRef(onDone);
  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);

  useEffect(() => {
    if (!text || isLoading) {
      setDisplayed('');
      setDone(false);
      return;
    }
    setDisplayed('');
    setDone(false);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        setDone(true);
        onDoneRef.current?.();
      }
    }, 35);
    return () => clearInterval(timer);
  }, [text, isLoading]);

  return (
    <div style={{
      position: 'relative',
      background: 'white',
      borderRadius: '18px 18px 18px 4px',
      padding: '10px 14px',
      boxShadow: '0 3px 12px rgba(0,0,0,0.08)',
      border: `1.5px solid ${petColor}30`,
      animation: 'bubble-in 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
      minHeight: 92,
      maxHeight: 180,
      overflowY: 'auto',
    }}>
      {isLoading ? (
        <div style={{ display: 'flex', gap: 5, padding: '4px 2px', alignItems: 'center' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 7, height: 7,
              borderRadius: '50%',
              background: petColor,
              animation: `dot-pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      ) : (
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 14.5,
          lineHeight: 1.6,
          color: 'var(--ink)',
          margin: 0,
        }}>
          {displayed}
          {!done && <span style={{ opacity: 0.4 }}>|</span>}
        </p>
      )}
    </div>
  );
}
