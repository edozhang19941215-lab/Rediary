import { useState, useRef, useEffect } from 'react';
import StickerPicker from './StickerPicker';
import { PetAvatar } from './PetAvatar';

// Sticker slot definitions
const SLOTS = [
  { id: 's1', style: { top: 16, right: 44 } },
  { id: 's2', style: { top: '28%', left: 6 } },
  { id: 's3', style: { top: '52%', right: 6 } },
  { id: 's4', style: { bottom: 110, left: 30 } },
  { id: 's5', style: { bottom: 72, right: 48 } },
];

function StickerSlot({ slotId, emoji, onOpen, onRemove, dark }) {
  if (emoji) {
    return (
      <div style={{ position: 'absolute', ...SLOTS.find(s => s.id === slotId)?.style, zIndex: 10 }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <span style={{ fontSize: 26, lineHeight: 1, cursor: 'pointer' }}
            onClick={() => onRemove(slotId)}>{emoji}</span>
          <div style={{
            position: 'absolute', top: -4, right: -4,
            width: 14, height: 14, borderRadius: '50%',
            background: 'rgba(0,0,0,0.25)', color: 'white',
            fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }} onClick={() => onRemove(slotId)}>×</div>
        </div>
      </div>
    );
  }
  return (
    <button onClick={() => onOpen(slotId)} style={{
      position: 'absolute', ...SLOTS.find(s => s.id === slotId)?.style, zIndex: 10,
      width: 20, height: 20, borderRadius: '50%',
      border: `1px dashed ${dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.10)'}`,
      background: 'transparent',
      color: dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.13)',
      fontSize: 10, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
    }}>+</button>
  );
}

// Draggable polaroid photo
function DraggablePhoto({ photo, index, onRemove, onMove, canvasRef }) {
  const dragStart = useRef(null);

  const handlePointerDown = (e) => {
    if (e.target.closest('button')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    dragStart.current = {
      startX: photo.x ?? 20,
      startY: photo.y ?? 20,
      pointerX: e.clientX - rect.left,
      pointerY: e.clientY - rect.top,
      canvasW: rect.width,
      canvasH: rect.height,
    };
  };

  const handlePointerMove = (e) => {
    if (!dragStart.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const curX = e.clientX - rect.left;
    const curY = e.clientY - rect.top;
    const dx = curX - dragStart.current.pointerX;
    const dy = curY - dragStart.current.pointerY;
    const newX = Math.max(0, Math.min(dragStart.current.startX + dx, dragStart.current.canvasW - 108));
    const newY = Math.max(0, Math.min(dragStart.current.startY + dy, dragStart.current.canvasH - 120));
    onMove(photo.id, newX, newY);
  };

  const handlePointerUp = () => { dragStart.current = null; };

  const rotation = photo.rotation ?? ((index % 2 === 0 ? 1 : -1) * (1 + index % 3));

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: 'absolute',
        left: photo.x ?? (20 + index * 12),
        top: photo.y ?? (60 + index * 10),
        zIndex: 15,
        cursor: 'grab',
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      <div style={{
        background: 'white',
        padding: '5px 5px 18px',
        borderRadius: 3,
        boxShadow: '0 4px 18px rgba(0,0,0,0.22)',
        transform: `rotate(${rotation}deg)`,
        position: 'relative',
      }}>
        <img
          src={photo.src}
          alt=""
          draggable={false}
          referrerPolicy="no-referrer"
          style={{ width: 88, height: 88, objectFit: 'cover', display: 'block', borderRadius: 1 }}
        />
        <button
          onClick={() => onRemove(photo.id)}
          style={{
            position: 'absolute', top: -6, right: -6,
            background: 'rgba(0,0,0,0.45)', color: 'white', border: 'none',
            borderRadius: '50%', width: 18, height: 18, fontSize: 11,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1,
          }}
        >×</button>
      </div>
    </div>
  );
}

export default function DiaryCanvas({
  stationery, text, onTextChange, mood, moods,
  photos, onRemovePhoto, onUpdatePhotoPos, onAIPhoto, onLocalPhoto, fileInputRef,
  entry, pet, diaryFlash, wordCount,
  stickers = {}, onStickerChange,
  aiGenerating,
}) {
  const [pickerSlot, setPickerSlot] = useState(null);
  const [showPhotoSheet, setShowPhotoSheet] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(380);
  const canvasRef = useRef(null);

  // Measure canvas width once on mount for photo-text reflow
  useEffect(() => {
    if (canvasRef.current) setCanvasWidth(canvasRef.current.offsetWidth);
  }, []);

  const today = entry ? new Date(entry.date) : new Date();
  const weekdays = ['周日','周一','周二','周三','周四','周五','周六'];
  const moodLabel = moods.find(m => m.emoji === mood)?.label;

  // Dynamic padding so text columns avoid photo zones
  const photoRight = photos.some(p => (p.x ?? 20) + 54 > canvasWidth / 2);
  const photoLeft  = photos.some(p => (p.x ?? 20) + 54 <= canvasWidth / 2);
  const textPaddingRight = photoRight ? '130px' : '44px';
  const textPaddingLeft  = photoLeft  ? '130px' : '18px';

  const handleStickerSelect = (emoji) => {
    onStickerChange({ ...stickers, [pickerSlot]: emoji });
  };
  const handleStickerRemove = (slotId) => {
    const next = { ...stickers };
    delete next[slotId];
    onStickerChange(next);
  };

  return (
    <div
      ref={canvasRef}
      style={{
        flex: 1, margin: '0 16px 12px',
        background: stationery.paperBg,
        borderRadius: 20,
        boxShadow: diaryFlash
          ? `0 4px 28px ${pet.color}55`
          : '0 4px 20px rgba(0,0,0,0.07)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', position: 'relative',
        transition: 'box-shadow 0.3s',
      }}
    >
      {/* Paper pattern layer */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: stationery.bgImage,
        backgroundSize: stationery.bgSize || 'auto',
        backgroundPositionY: stationery.bgPositionY || '48px',
        pointerEvents: 'none', borderRadius: 20,
      }} />
      {stationery.rulerColor && stationery.rulerColor !== 'transparent' && (
        <div style={{
          position: 'absolute', left: 40, top: 0, bottom: 0,
          width: 1, background: stationery.rulerColor, pointerEvents: 'none',
        }} />
      )}

      {/* Sticker slots */}
      {SLOTS.map(slot => (
        <StickerSlot
          key={slot.id} slotId={slot.id}
          emoji={stickers[slot.id]}
          onOpen={setPickerSlot} onRemove={handleStickerRemove}
          dark={stationery.dark}
        />
      ))}

      {/* Draggable photos — absolutely on the canvas */}
      {photos.map((photo, i) => (
        <DraggablePhoto
          key={photo.id} photo={photo} index={i}
          onRemove={onRemovePhoto}
          onMove={onUpdatePhotoPos}
          canvasRef={canvasRef}
        />
      ))}

      {/* ── Paper header ── */}
      <div style={{ padding: '18px 18px 10px 18px', position: 'relative', zIndex: 1, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
          <span style={{
            fontFamily: 'var(--font-hand)', fontSize: 28, lineHeight: 1,
            color: stationery.textColor || 'var(--ink)', letterSpacing: 1,
          }}>
            {today.getMonth() + 1}月{today.getDate()}日
          </span>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: 12,
            color: stationery.dark ? 'rgba(200,210,240,0.7)' : 'var(--ink-faint)',
          }}>
            {weekdays[today.getDay()]}
          </span>
        </div>
        {mood ? (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: stationery.dark ? 'rgba(255,255,255,0.10)' : `${pet.color}14`,
            borderRadius: 20, padding: '3px 10px',
          }}>
            <span style={{ fontSize: 14 }}>{mood}</span>
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: 11,
              color: stationery.dark ? 'rgba(200,210,240,0.85)' : pet.color,
            }}>{moodLabel}</span>
          </div>
        ) : (
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: 11,
            color: stationery.dark ? 'rgba(200,210,240,0.4)' : 'var(--ink-faint)',
            fontStyle: 'italic',
          }}>选择今日心情后这里会显示…</div>
        )}
        <div style={{
          marginTop: 10, height: 1,
          background: stationery.dark ? 'rgba(255,255,255,0.08)' : `${pet.color}22`,
        }} />
      </div>

      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 1 }}>
        <textarea
          value={text}
          onChange={onTextChange}
          placeholder="今天发生了什么…"
          style={{
            width: '100%', border: 'none', outline: 'none', resize: 'none',
            background: 'transparent',
            padding: `8px ${textPaddingRight} 8px ${textPaddingLeft}`,
            transition: 'padding 0.3s ease',
            fontFamily: 'var(--font-body)', fontSize: 15,
            lineHeight: '32px',
            color: stationery.textColor || 'var(--ink)',
            minHeight: 160,
            boxSizing: 'border-box',
          }}
        />

        {/* Word count */}
        <div style={{
          padding: '0 18px 16px',
          fontFamily: 'var(--font-deco)', fontSize: 11,
          color: stationery.dark ? 'rgba(200,210,240,0.3)' : 'var(--ink-faint)',
          textAlign: 'right',
        }}>{wordCount} 字</div>
      </div>

      {/* ── Add photo button (bottom-right) ── */}
      <button
        onClick={() => setShowPhotoSheet(true)}
        style={{
          position: 'absolute', bottom: 14, right: 14, zIndex: 12,
          width: 36, height: 36, borderRadius: '50%',
          background: stationery.dark ? 'rgba(255,255,255,0.12)' : `${pet.color}18`,
          border: `1.5px dashed ${stationery.dark ? 'rgba(255,255,255,0.25)' : pet.color + '60'}`,
          cursor: 'pointer', fontSize: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {aiGenerating ? (
          <span style={{ fontSize: 12, animation: 'dot-pulse 1s infinite' }}>✨</span>
        ) : '📷'}
      </button>

      {/* ✨ flash badge */}
      {diaryFlash && (
        <div style={{
          position: 'absolute', top: 10, right: 42, zIndex: 20,
          background: `${pet.color}22`, color: pet.color,
          borderRadius: 10, padding: '3px 10px',
          fontFamily: 'var(--font-body)', fontSize: 11,
          animation: 'fade-in 0.3s ease both',
        }}>✨ 已记录</div>
      )}

      {/* Sticker picker bottom sheet */}
      {pickerSlot && (
        <StickerPicker
          onSelect={handleStickerSelect}
          onClose={() => setPickerSlot(null)}
          petColor={pet.color}
        />
      )}

      {/* Photo source choice sheet */}
      {showPhotoSheet && (
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 50,
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          }}
          onClick={() => setShowPhotoSheet(false)}
        >
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

            {/* Pet bubble */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, padding: '8px 18px 14px' }}>
              <PetAvatar petId={pet.id} state="happy" size={48} />
              <div style={{
                background: pet.accent,
                borderRadius: '12px 12px 12px 4px',
                padding: '9px 13px',
                fontFamily: 'var(--font-body)', fontSize: 13.5,
                color: 'var(--ink)', lineHeight: 1.5,
              }}>
                要不要试试我帮你配一张插图？✨
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10, padding: '0 18px' }}>
              <button
                onClick={() => {
                  setShowPhotoSheet(false);
                  onAIPhoto();
                }}
                style={{
                  flex: 1, padding: '12px 0',
                  background: `${pet.color}18`,
                  border: `1.5px solid ${pet.color}40`,
                  borderRadius: 16, cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: 14,
                  color: pet.color, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <span>✨</span> AI配图
              </button>
              <button
                onClick={() => {
                  setShowPhotoSheet(false);
                  fileInputRef.current?.click();
                }}
                style={{
                  flex: 1, padding: '12px 0',
                  background: 'var(--surface)',
                  border: '1.5px solid transparent',
                  borderRadius: 16, cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: 14,
                  color: 'var(--ink-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <span>📷</span> 本地上传
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
