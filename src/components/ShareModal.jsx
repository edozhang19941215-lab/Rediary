import { useState, useEffect, useRef } from 'react';
import { PetAvatar } from './PetAvatar';
import { generateGoldenQuote } from '../api/claude';

const CARDS = [
  { id: 'red',    src: '/card-red.png',    label: '热情红' },
  { id: 'blue',   src: '/card-blue.png',   label: '云朵蓝' },
  { id: 'yellow', src: '/card-yellow.png', label: '阳光黄' },
];

const PET_CARD_LINES = {
  sheep: '小云帮你把今天提炼成一句话啦～选一张喜欢的卡片发出去吧',
  monkey: '（面无表情）…分析完毕。这是今天的精华，选一张卡片。',
  bird: '✨闪✨ 今天的你有点东西！这句话必须发出去让大家看到！',
};

export default function ShareModal({ pet, diaryText, conversationHistory = [], onClose }) {
  const [phase, setPhase] = useState('generating'); // generating | preview | error
  const [quote, setQuote] = useState('');
  const [editingQuote, setEditingQuote] = useState('');
  const [selectedCard, setSelectedCard] = useState('red');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);

  const petSays = PET_CARD_LINES[pet.id] || PET_CARD_LINES.sheep;

  const fetchQuote = () => {
    setPhase('generating');
    generateGoldenQuote({ diaryText, conversationHistory })
      .then(q => {
        setQuote(q);
        setEditingQuote(q);
        setPhase('preview');
      })
      .catch(() => setPhase('error'));
  };

  useEffect(() => { fetchQuote(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleShare = async () => {
    const text = editingQuote;
    // Try Web Share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch { /* fall through */ }
    }
    // Fallback: copy to clipboard + prompt to open XHS
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      // Try to open Xiaohongshu app
      window.location.href = 'xhsdiscover://';
    }, 800);
  };

  const cardSrc = CARDS.find(c => c.id === selectedCard)?.src;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      background: 'rgba(0,0,0,0.45)',
      backdropFilter: 'blur(6px)',
      animation: 'fade-in 0.25s ease both',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '28px 28px 0 0',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.14)',
        animation: 'slide-up 0.4s cubic-bezier(0.34,1.2,0.64,1) both',
        maxHeight: '92vh',
        overflowY: 'auto',
        paddingBottom: 'env(safe-area-inset-bottom, 16px)',
      }}>
        {/* ── Pet header ── */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 12,
          padding: '20px 20px 14px',
          borderBottom: `2px solid ${pet.accent}`,
        }}>
          <PetAvatar petId={pet.id} state="happy" size={60} />
          <div style={{ flex: 1 }}>
            <div style={{
              background: pet.accent,
              borderRadius: '12px 12px 12px 4px',
              padding: '9px 13px',
              fontFamily: 'var(--font-body)', fontSize: 13.5,
              color: 'var(--ink)', lineHeight: 1.5,
            }}>
              {petSays}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 22,
            color: 'var(--ink-faint)', cursor: 'pointer',
            alignSelf: 'flex-start', padding: '0 0 0 8px', lineHeight: 1,
          }}>×</button>
        </div>

        {phase === 'error' ? (
          <div style={{
            padding: '40px 24px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 16, textAlign: 'center',
          }}>
            <span style={{ fontSize: 36 }}>😮‍💨</span>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-faint)', lineHeight: 1.7 }}>
              金句生成失败了<br />再试一次？
            </p>
            <button onClick={fetchQuote} style={{
              background: pet.color, color: 'white', border: 'none',
              borderRadius: 14, padding: '10px 28px',
              fontFamily: 'var(--font-hand)', fontSize: 16, cursor: 'pointer',
            }}>重新生成</button>
          </div>
        ) : phase === 'generating' ? (
          <div style={{
            padding: '56px 20px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 14,
          }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 9, height: 9, borderRadius: '50%',
                  background: pet.color,
                  animation: `dot-pulse 1.2s ease ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 13,
              color: 'var(--ink-faint)',
            }}>正在提炼今天的金句…</p>
          </div>
        ) : (
          <div style={{ padding: '18px 20px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* ── Card preview ── */}
            <div style={{
              position: 'relative', width: '100%', paddingBottom: '100%',
              borderRadius: 20, overflow: 'hidden',
              boxShadow: '0 6px 28px rgba(0,0,0,0.14)',
              animation: 'fade-in 0.4s ease both',
            }}>
              <img
                src={cardSrc}
                alt="card"
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%', objectFit: 'cover',
                }}
              />
              {/* Editable quote overlay — centered */}
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '14% 12%',
              }}>
                <textarea
                  ref={textareaRef}
                  value={editingQuote}
                  onChange={e => setEditingQuote(e.target.value)}
                  maxLength={40}
                  rows={3}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none', outline: 'none', resize: 'none',
                    fontFamily: "'Ma Shan Zheng', var(--font-hand)", fontSize: 22,
                    lineHeight: 1.55, letterSpacing: 1,
                    color: 'white',
                    textAlign: 'center',
                    textShadow: '0 1px 8px rgba(0,0,0,0.25)',
                    caretColor: 'white',
                  }}
                />
              </div>
              {/* Edit hint */}
              <div style={{
                position: 'absolute', bottom: 10, left: 0, right: 0,
                textAlign: 'center',
                fontFamily: 'var(--font-body)', fontSize: 11,
                color: 'rgba(255,255,255,0.6)',
              }}>点击文字可编辑</div>
            </div>

            {/* ── Card style picker ── */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              {CARDS.map(card => (
                <button
                  key={card.id}
                  onClick={() => setSelectedCard(card.id)}
                  style={{
                    width: 60, height: 60, borderRadius: 14,
                    overflow: 'hidden', padding: 0, cursor: 'pointer',
                    border: selectedCard === card.id
                      ? `3px solid ${pet.color}`
                      : '3px solid transparent',
                    boxShadow: selectedCard === card.id
                      ? `0 0 0 2px ${pet.color}40`
                      : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  <img src={card.src} alt={card.label}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>

            {/* ── Share button ── */}
            <button
              onClick={handleShare}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #FF2442 0%, #FF6B81 100%)',
                color: 'white', border: 'none', borderRadius: 18,
                padding: '15px 0',
                fontFamily: 'var(--font-hand)', fontSize: 18, letterSpacing: 1,
                cursor: 'pointer',
                boxShadow: '0 6px 24px rgba(255,36,66,0.30)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'opacity 0.15s',
              }}
            >
              <span style={{ fontSize: 20 }}>📕</span>
              {copied ? '已复制，去小红书粘贴～' : '一键发布小红书'}
            </button>

            <button
              onClick={onClose}
              style={{
                width: '100%', background: 'none', border: 'none',
                fontFamily: 'var(--font-body)', fontSize: 13,
                color: 'var(--ink-faint)', cursor: 'pointer', padding: '4px 0',
              }}
            >下次再发</button>
          </div>
        )}
      </div>
    </div>
  );
}
