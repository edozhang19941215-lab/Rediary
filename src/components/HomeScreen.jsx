import { useState, useEffect, useRef } from 'react';
import { PetAvatar } from './PetAvatar';
import { PETS } from '../data/pets';
import { getEntries, formatDate, deleteEntry } from '../utils/storage';

const SWIPE_MAX = 76;       // how far the card slides (px)
const SWIPE_THRESHOLD = 44; // trigger point to snap open

export default function HomeScreen({ homePet, onSwitchPet, onNewEntry, onOpenEntry, onGrowth }) {
  const [entries, setEntries] = useState([]);
  const [swipeMap, setSwipeMap] = useState({}); // { [id]: translateX }
  const touchRef = useRef({});                  // { [id]: { startX, startY, moved } }

  useEffect(() => {
    setEntries(getEntries());
  }, []);

  const today = new Date();
  const weekdays = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
  const months = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];

  const msgIndex = Math.floor(Date.now() / 86400000) % (homePet.encourageMessages?.length || 1);
  const encourageMsg = homePet.encourageMessages?.[msgIndex] || homePet.visitGreeting[0];

  const handleDelete = (id) => {
    deleteEntry(id);
    setEntries(prev => prev.filter(e => e.id !== id));
    setSwipeMap(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  // Close all open swipes except the given id
  const closeOthers = (keepId) => {
    setSwipeMap(prev => {
      const hasOthers = Object.entries(prev).some(([id, x]) => id !== keepId && x < 0);
      if (!hasOthers) return prev;
      const next = {};
      if (prev[keepId]) next[keepId] = prev[keepId];
      return next;
    });
  };

  const renderCard = (entry, i, animate = true) => {
    const d = formatDate(entry.date);
    const pet = PETS[entry.petId] || PETS.sheep;
    const tx = swipeMap[entry.id] || 0;
    const isOpen = tx <= -SWIPE_THRESHOLD;

    const onTouchStart = (e) => {
      closeOthers(entry.id);
      touchRef.current[entry.id] = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        moved: false,
      };
    };

    const onTouchMove = (e) => {
      const t = touchRef.current[entry.id];
      if (!t) return;
      const dx = e.touches[0].clientX - t.startX;
      const dy = e.touches[0].clientY - t.startY;
      // Only hijack clearly horizontal swipes
      if (!t.moved && Math.abs(dy) > Math.abs(dx)) return;
      if (Math.abs(dx) > 4) t.moved = true;
      if (!t.moved) return;
      if (dx > 0) {
        // Right swipe: close if open, otherwise ignore
        if (tx < 0) setSwipeMap(prev => ({ ...prev, [entry.id]: Math.min(0, tx + (dx * 0.5)) }));
        return;
      }
      e.preventDefault(); // prevent scroll while swiping left
      const clamped = Math.max(dx, -SWIPE_MAX);
      setSwipeMap(prev => ({ ...prev, [entry.id]: clamped }));
    };

    const onTouchEnd = () => {
      const t = touchRef.current[entry.id];
      if (!t) return;
      const cur = swipeMap[entry.id] || 0;
      setSwipeMap(prev => ({
        ...prev,
        [entry.id]: cur < -SWIPE_THRESHOLD ? -SWIPE_MAX : 0,
      }));
    };

    const onCardClick = () => {
      if ((swipeMap[entry.id] || 0) < -4) {
        // Close swipe instead of opening entry
        setSwipeMap(prev => ({ ...prev, [entry.id]: 0 }));
      } else {
        onOpenEntry(entry.id);
      }
    };

    return (
      <div key={entry.id} style={{ position: 'relative', borderRadius: 20, overflow: 'hidden' }}>
        {/* Delete button (revealed behind card) */}
        <div
          onClick={() => handleDelete(entry.id)}
          style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: SWIPE_MAX,
            background: '#FF3B30',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 3, cursor: 'pointer', borderRadius: '0 20px 20px 0',
            opacity: isOpen ? 1 : Math.min(1, Math.abs(tx) / SWIPE_MAX),
          }}
        >
          <span style={{ fontSize: 20 }}>🗑</span>
          <span style={{ fontSize: 11, color: 'white', fontFamily: 'var(--font-body)' }}>删除</span>
        </div>

        {/* Card */}
        <div
          onClick={onCardClick}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{
            background: 'white', borderRadius: 20, padding: '14px 16px',
            boxShadow: 'var(--shadow-soft)', cursor: 'pointer',
            animation: animate ? `fade-in 0.3s ease ${i * 0.04}s both` : undefined,
            borderLeft: `4px solid ${pet.color}`,
            position: 'relative', overflow: 'hidden',
            transform: `translateX(${tx}px)`,
            transition: touchRef.current[entry.id]?.moved ? 'none' : 'transform 0.25s ease',
            willChange: 'transform',
          }}
        >
          <div style={{
            position: 'absolute', top: 0, right: 0, bottom: 0, width: 56,
            background: `linear-gradient(90deg, transparent, ${pet.accent}50)`,
            pointerEvents: 'none',
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span style={{ fontFamily: 'var(--font-hand)', fontSize: 18, color: 'var(--ink)' }}>
                  {d.month}月{d.day}日
                </span>
                <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'var(--font-body)' }}>
                  {d.weekday} {d.time}
                </span>
                {entry.mood && <span style={{ fontSize: 14 }}>{entry.mood}</span>}
              </div>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-light)',
                lineHeight: 1.6, display: '-webkit-box',
                WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {entry.text || '（空白的一页…）'}
              </p>
              {entry.photos?.length > 0 && (
                <span style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 4, display: 'block' }}>
                  📷 {entry.photos.length} 张
                </span>
              )}
            </div>
            <div style={{ flexShrink: 0, marginLeft: 8 }}>
              <PetAvatar petId={entry.petId || 'sheep'} state="talking" size={40} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(180deg, #f6f6f6 0%, #ffffff 100%)',
      overflowY: 'auto', position: 'relative',
    }}>
      {/* Coloured top stripe */}
      <div style={{
        height: 6,
        background: 'repeating-linear-gradient(90deg, #F5D0CC 0,#F5D0CC 20px, #FAE0B0 20px,#FAE0B0 40px, #D4EDE0 40px,#D4EDE0 60px, #D8EBF5 60px,#D8EBF5 80px)',
        opacity: 0.8, flexShrink: 0,
      }} />

      {/* Header */}
      <div style={{ padding: '20px 20px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-deco)', fontSize: 14, color: 'var(--ink-faint)', marginBottom: 2 }}>
              {weekdays[today.getDay()]}
            </p>
            <h1 style={{ fontFamily: 'var(--font-hand)', fontSize: 32, color: 'var(--ink)', lineHeight: 1, letterSpacing: 2 }}>
              {today.getDate()} {months[today.getMonth()]}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={onGrowth}
              style={{
                background: 'white', border: 'none', borderRadius: 14,
                padding: '8px 14px', cursor: 'pointer',
                boxShadow: 'var(--shadow-soft)',
                fontFamily: 'var(--font-hand)', fontSize: 14,
                color: 'var(--ink-light)', letterSpacing: 1,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
              🌱 成长
            </button>
            <button
              onClick={onNewEntry}
              style={{
                background: homePet.color, color: 'white', border: 'none',
                borderRadius: '50%', width: 46, height: 46, fontSize: 22,
                cursor: 'pointer', boxShadow: `0 4px 16px ${homePet.color}50`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✏️</button>
          </div>
        </div>
      </div>

      {/* Today's pet card */}
      <div style={{
        margin: '16px 20px 0', flexShrink: 0,
        background: 'white', borderRadius: 24, padding: '14px 16px',
        boxShadow: 'var(--shadow-card)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle at 15% 80%, ${homePet.accent}90 0%, transparent 65%)`,
          pointerEvents: 'none',
        }} />
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, position: 'relative' }}>
          <div style={{ flexShrink: 0 }}>
            <PetAvatar petId={homePet.id} state="talking" size={80} />
            <div style={{
              textAlign: 'center', marginTop: -4,
              background: homePet.color, color: 'white',
              borderRadius: 10, padding: '2px 8px', fontSize: 11,
              fontFamily: 'var(--font-hand)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            }}>{homePet.name}</div>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-faint)', marginBottom: 6 }}>
              今天的小伙伴
            </p>
            <div style={{
              background: homePet.accent, borderRadius: '14px 14px 14px 4px',
              padding: '9px 13px',
            }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.6 }}>
                {encourageMsg}
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, position: 'relative' }}>
          <button
            onClick={onNewEntry}
            style={{
              flex: 1, background: 'var(--brand-gradient)', color: 'white',
              border: 'none', borderRadius: 12, padding: '9px 0',
              fontFamily: 'var(--font-hand)', fontSize: 15, letterSpacing: 1,
              cursor: 'pointer', boxShadow: '0 3px 12px rgba(204,26,26,0.22)',
            }}
          >
            开始写日记 ✍️
          </button>
          <button
            onClick={onSwitchPet}
            style={{
              background: 'var(--surface)', border: 'none', borderRadius: 12,
              padding: '9px 14px', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-faint)',
              whiteSpace: 'nowrap',
            }}
          >我想见其他人</button>
        </div>
      </div>

      {/* Entries */}
      {(() => {
        const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
        const isToday = (e) => {
          const d = new Date(e.date);
          return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` === todayStr;
        };
        const todayEntry = entries.find(isToday) || null;
        const pastEntries = entries
          .filter(e => !isToday(e))
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        return (
          <div style={{ padding: '16px 20px 100px', display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontFamily: 'var(--font-deco)', fontSize: 13, color: 'var(--ink-faint)' }}>今天的日记</span>
              <div style={{ flex: 1, height: 1, background: 'var(--ink-faint)', opacity: 0.15 }} />
            </div>
            {todayEntry ? renderCard(todayEntry, 0, true) : (
              <div style={{
                background: 'white', borderRadius: 20, padding: '14px 18px',
                boxShadow: 'var(--shadow-soft)',
                borderLeft: '4px solid var(--surface-high)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 20, opacity: 0.35 }}>📖</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-faint)', fontStyle: 'italic' }}>
                  还没有写日记哦，今天发生了什么？
                </span>
              </div>
            )}

            {pastEntries.length > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 10px' }}>
                  <span style={{ fontFamily: 'var(--font-deco)', fontSize: 13, color: 'var(--ink-faint)' }}>过去的故事</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--ink-faint)', opacity: 0.15 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {pastEntries.map((entry, i) => renderCard(entry, i))}
                </div>
              </>
            )}
          </div>
        );
      })()}
    </div>
  );
}
