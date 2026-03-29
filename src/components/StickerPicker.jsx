import { useState } from 'react';
import { STICKER_CATEGORIES } from '../data/stickers';

export default function StickerPicker({ onSelect, onClose, petColor }) {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '24px 24px 0 0',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
          animation: 'slide-up 0.3s cubic-bezier(0.34,1.2,0.64,1) both',
          paddingBottom: 24,
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--surface-high)' }} />
        </div>

        {/* Category tabs */}
        <div style={{
          display: 'flex', gap: 6, padding: '0 16px 10px',
          overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          {STICKER_CATEGORIES.map((cat, i) => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(i)}
              style={{
                flexShrink: 0,
                background: activeCategory === i ? `${petColor}18` : 'var(--surface)',
                color: activeCategory === i ? petColor : 'var(--ink-faint)',
                border: `1.5px solid ${activeCategory === i ? petColor : 'transparent'}`,
                borderRadius: 16, padding: '4px 12px',
                fontFamily: 'var(--font-body)', fontSize: 12,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >{cat.label}</button>
          ))}
        </div>

        {/* Sticker grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)',
          gap: 4, padding: '0 16px',
        }}>
          {STICKER_CATEGORIES[activeCategory].items.map(emoji => (
            <button
              key={emoji}
              onClick={() => { onSelect(emoji); onClose(); }}
              style={{
                background: 'var(--surface)',
                border: 'none', borderRadius: 12,
                padding: '10px 0', fontSize: 22,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'transform 0.1s',
                aspectRatio: '1',
              }}
              onTouchStart={e => e.currentTarget.style.transform = 'scale(1.3)'}
              onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
            >{emoji}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
