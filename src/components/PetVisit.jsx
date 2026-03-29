import { useState, useEffect, useRef } from 'react';
import { PetAvatar } from './PetAvatar';
import { getPetResponse } from '../api/claude';
import { setVisitDismissed } from '../utils/storage';
import { usePetState } from '../hooks/usePetState';
import { STATIONERY } from '../data/stationery';

function StationeryCarousel({ selected, onChange }) {
  const idx = STATIONERY.findIndex(s => s.id === selected);
  const currentIdx = idx >= 0 ? idx : 0;
  const s = STATIONERY[currentIdx];

  // Touch swipe
  const touchStartX = useRef(null);
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return;
    if (dx < 0 && currentIdx < STATIONERY.length - 1) onChange(STATIONERY[currentIdx + 1].id);
    if (dx > 0 && currentIdx > 0) onChange(STATIONERY[currentIdx - 1].id);
  };

  const prev = () => currentIdx > 0 && onChange(STATIONERY[currentIdx - 1].id);
  const next = () => currentIdx < STATIONERY.length - 1 && onChange(STATIONERY[currentIdx + 1].id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, flex: 1, justifyContent: 'center' }}>
      <p style={{ fontFamily: 'var(--font-hand)', fontSize: 18, color: 'var(--ink)', letterSpacing: 2, margin: 0 }}>
        选一张信纸
      </p>

      {/* Main card + arrows */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={prev} style={{
          width: 32, height: 32, borderRadius: '50%', border: 'none',
          background: currentIdx > 0 ? 'white' : 'transparent',
          color: currentIdx > 0 ? 'var(--ink-light)' : 'transparent',
          fontSize: 16, cursor: currentIdx > 0 ? 'pointer' : 'default',
          boxShadow: currentIdx > 0 ? '0 2px 8px rgba(0,0,0,0.10)' : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>‹</button>

        {/* Large preview card */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            width: 160, height: 210,
            borderRadius: 18,
            background: s.paperBg,
            boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
            position: 'relative', overflow: 'hidden',
            flexShrink: 0,
            transition: 'background 0.25s',
          }}
        >
          {/* Pattern */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: s.bgImage,
            backgroundSize: s.bgSize || 'auto',
            backgroundPositionY: s.bgPositionY || '48px',
          }} />
          {/* Ruler line */}
          {s.rulerColor && s.rulerColor !== 'transparent' && (
            <div style={{
              position: 'absolute', left: 26, top: 0, bottom: 0,
              width: 1, background: s.rulerColor,
            }} />
          )}
          {/* Fake text lines */}
          <div style={{ position: 'absolute', inset: 0, padding: '24px 20px 20px 36px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[80, 100, 65, 90, 55, 75, 40].map((w, i) => (
              <div key={i} style={{
                height: 6, borderRadius: 3,
                background: s.dark ? 'rgba(255,255,255,0.12)' : `${s.rulerColor !== 'transparent' ? s.rulerColor : 'rgba(0,0,0,0.08)'}`,
                width: `${w}%`,
              }} />
            ))}
          </div>
          {/* Name badge */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: s.dark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.80)',
            backdropFilter: 'blur(6px)',
            padding: '6px 0',
            fontFamily: 'var(--font-hand)', fontSize: 13,
            color: s.dark ? '#c8d2f0' : 'var(--ink)',
            textAlign: 'center', letterSpacing: 1,
          }}>{s.name}</div>
        </div>

        <button onClick={next} style={{
          width: 32, height: 32, borderRadius: '50%', border: 'none',
          background: currentIdx < STATIONERY.length - 1 ? 'white' : 'transparent',
          color: currentIdx < STATIONERY.length - 1 ? 'var(--ink-light)' : 'transparent',
          fontSize: 16, cursor: currentIdx < STATIONERY.length - 1 ? 'pointer' : 'default',
          boxShadow: currentIdx < STATIONERY.length - 1 ? '0 2px 8px rgba(0,0,0,0.10)' : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>›</button>
      </div>

      {/* Pagination dots */}
      <div style={{ display: 'flex', gap: 6 }}>
        {STATIONERY.map((s, i) => (
          <div key={s.id} onClick={() => onChange(s.id)} style={{
            width: i === currentIdx ? 16 : 6,
            height: 6, borderRadius: 3,
            background: i === currentIdx ? 'var(--primary)' : 'rgba(0,0,0,0.15)',
            transition: 'all 0.2s', cursor: 'pointer',
          }} />
        ))}
      </div>
    </div>
  );
}

export default function PetVisit({ pet, onDismiss, onStartDiary, onSwitchPet }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState('arriving'); // arriving | chatting | leaving
  const [displayedGreeting, setDisplayedGreeting] = useState('');
  const [petState, setPetState] = usePetState('welcome');
  const [selectedStationery, setSelectedStationery] = useState('lined');
  const chatRef = useRef(null);

  const greeting = pet.visitGreeting[Math.floor(Date.now() / 86400000) % pet.visitGreeting.length];

  useEffect(() => {
    setDisplayedGreeting('');
    setPhase('arriving');
    let i = 0;
    const t = setInterval(() => {
      i++;
      setDisplayedGreeting(greeting.slice(0, i));
      if (i >= greeting.length) {
        clearInterval(t);
        setPhase('chatting');
        setPetState('talking');
      }
    }, 40);
    return () => clearInterval(t);
  }, [greeting]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (text) => {
    if (!text.trim()) return;
    const userMsg = text.trim();
    setInputText('');

    const leaveWords = ['走吧','走开','不用了','再见','拜拜','bye','去吧','好了好了','知道了'];
    if (leaveWords.some(w => userMsg.includes(w))) {
      handleLeave();
      return;
    }

    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    setPetState('typing');

    const history = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text
    }));

    try {
      const reply = await getPetResponse({ pet, diaryText: '', conversationHistory: history, isOpening: false });
      setMessages(prev => [...prev, { role: 'pet', text: reply }]);
      setPetState('talking');
    } catch {
      setMessages(prev => [...prev, { role: 'pet', text: pet.visitGreeting[0] }]);
      setPetState('talking');
    }
    setLoading(false);
  };

  const handleLeave = () => {
    const leaveMsg = pet.leaveResponse[Math.floor(Math.random() * pet.leaveResponse.length)];
    setPhase('leaving');
    setPetState('goodbye');
    setMessages(prev => [...prev, { role: 'pet', text: leaveMsg }]);
    setTimeout(() => {
      setVisitDismissed();
      onDismiss();
    }, 1800);
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      display: 'flex', flexDirection: 'column',
      background: 'rgba(240,240,240,0.85)',
      backdropFilter: 'blur(10px)',
      animation: 'fade-in 0.4s ease both',
    }}>

      {/* ── Top: Stationery carousel ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px 20px 8px' }}>
        <StationeryCarousel selected={selectedStationery} onChange={setSelectedStationery} />
      </div>

      {/* ── Bottom: Pet chat panel ── */}
      <div style={{
        background: 'white',
        borderRadius: '28px 28px 0 0',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.10)',
        animation: 'slide-up 0.5s cubic-bezier(0.34,1.2,0.64,1) both',
        maxHeight: '62vh',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Pet header */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 12,
          padding: '18px 20px 14px',
          borderBottom: `2px solid ${pet.accent}`,
        }}>
          <PetAvatar petId={pet.id} state={petState} size={76} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontFamily: 'var(--font-hand)', fontSize: 17, color: 'var(--ink)', letterSpacing: 1 }}>
                {pet.name}
              </span>
              <span style={{
                background: `${pet.color}20`, color: pet.color,
                borderRadius: 8, padding: '2px 8px',
                fontSize: 10, fontFamily: 'var(--font-body)',
              }}>{pet.personality}</span>
            </div>
            <div style={{
              background: pet.accent,
              borderRadius: '12px 12px 12px 4px',
              padding: '8px 12px', display: 'inline-block',
            }}>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 13.5,
                color: 'var(--ink)', lineHeight: 1.5, minHeight: 20,
              }}>
                {displayedGreeting}
                {phase === 'arriving' && <span style={{ opacity: 0.4 }}>|</span>}
              </p>
            </div>
          </div>
          <button onClick={handleLeave} style={{
            background: 'none', border: 'none', fontSize: 20,
            color: 'var(--ink-faint)', cursor: 'pointer', padding: 4,
            alignSelf: 'flex-start',
          }}>×</button>
        </div>

        {/* Chat messages */}
        {messages.length > 0 && (
          <div ref={chatRef} style={{
            flex: 1, overflowY: 'auto', padding: '10px 16px',
            display: 'flex', flexDirection: 'column', gap: 9, maxHeight: 160,
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                animation: 'fade-in 0.3s ease both',
              }}>
                {msg.role === 'pet' && (
                  <div style={{ marginRight: 8, flexShrink: 0 }}>
                    <PetAvatar petId={pet.id} state="talking" size={28} />
                  </div>
                )}
                <div style={{
                  background: msg.role === 'user' ? pet.color : pet.accent,
                  color: msg.role === 'user' ? 'white' : 'var(--ink)',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  padding: '7px 12px', maxWidth: '75%',
                  fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.5,
                }}>{msg.text}</div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PetAvatar petId={pet.id} state="typing" size={28} />
                <div style={{ display: 'flex', gap: 4, background: pet.accent, borderRadius: 12, padding: '7px 12px' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: '50%', background: pet.color,
                      animation: `dot-pulse 1.2s ease ${i*0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action buttons + input */}
        <div style={{ padding: '10px 16px 24px' }}>
          {phase === 'chatting' && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <button
                onClick={() => onStartDiary(selectedStationery)}
                style={{
                  flex: 1, background: 'var(--brand-gradient)', color: 'white',
                  border: 'none', borderRadius: 14, padding: '11px 0',
                  fontFamily: 'var(--font-hand)', fontSize: 16, letterSpacing: 1,
                  cursor: 'pointer', boxShadow: '0 4px 16px rgba(204,26,26,0.25)',
                }}
              >
                开始写日记 ✍️
              </button>
              <button
                onClick={onSwitchPet}
                style={{
                  background: 'var(--surface)', border: 'none', borderRadius: 14,
                  padding: '11px 14px', fontFamily: 'var(--font-body)',
                  fontSize: 13, color: 'var(--ink-light)', cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                我想见其他人
              </button>
            </div>
          )}
          {phase === 'chatting' && (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend(inputText)}
                placeholder={`和${pet.name}说点什么…`}
                style={{
                  flex: 1, background: 'var(--surface)', border: 'none',
                  borderRadius: 12, padding: '10px 14px',
                  fontFamily: 'var(--font-body)', fontSize: 13.5,
                  color: 'var(--ink)', outline: 'none',
                }}
              />
              <button
                onClick={() => handleSend(inputText)}
                style={{
                  background: inputText.trim() ? pet.color : 'var(--surface)',
                  color: inputText.trim() ? 'white' : 'var(--ink-faint)',
                  border: 'none', borderRadius: 12, padding: '10px 14px',
                  cursor: 'pointer', transition: 'all 0.2s', fontSize: 16,
                }}
              >↑</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
