import { useState } from 'react';
import { PetAvatar } from './PetAvatar';
import { PETS } from '../data/pets';

export default function SplashScreen({ onStart }) {
  const [step, setStep] = useState(0);
  const [chosenPet, setChosenPet] = useState(null);

  const petList = Object.values(PETS);

  if (step === 0) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #FFF4E6 0%, #FDEEE8 50%, #F0F8FF 100%)',
        padding: '40px 32px',
        textAlign: 'center',
      }}>
        {/* Logo area */}
        <div style={{
          marginBottom: 32,
          animation: 'bounce-in 0.8s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>
          <div style={{
            fontSize: 64,
            marginBottom: 8,
            filter: 'drop-shadow(0 4px 12px rgba(232,128,138,0.3))',
          }}>
            📔
          </div>
          <h1 style={{
            fontFamily: 'var(--font-hand)',
            fontSize: 42,
            color: 'var(--ink)',
            letterSpacing: 4,
            lineHeight: 1,
            marginBottom: 6,
          }}>
            陪陪记
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13.5,
            color: 'var(--ink-faint)',
            letterSpacing: 1,
          }}>
            有小伙伴陪着你的日记本
          </p>
        </div>

        {/* Preview pets row */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 40,
          animation: 'fade-in 0.6s ease 0.4s both',
        }}>
          {petList.map((p, i) => (
            <div key={p.id} style={{
              animation: `bounce-in 0.5s ease ${0.5 + i * 0.1}s both`,
            }}>
              <PetAvatar petId={p.id} size={52} />
            </div>
          ))}
        </div>

        <div style={{
          animation: 'fade-in 0.6s ease 0.9s both',
          width: '100%',
        }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13.5,
            color: 'var(--ink-light)',
            lineHeight: 1.9,
            marginBottom: 28,
          }}>
            不知道从哪里开始？<br />
            没关系，小伙伴会帮你的 🌸
          </p>
          <button
            onClick={() => setStep(1)}
            style={{
              background: '#E8808A',
              color: 'white',
              border: 'none',
              borderRadius: 20,
              padding: '14px 48px',
              fontFamily: 'var(--font-hand)',
              fontSize: 20,
              letterSpacing: 2,
              cursor: 'pointer',
              boxShadow: '0 6px 24px rgba(232,128,138,0.4)',
              transition: 'transform 0.15s',
            }}
            onTouchStart={e => e.currentTarget.style.transform = 'scale(0.95)'}
            onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            开始记录 ✨
          </button>
        </div>
      </div>
    );
  }

  // Step 1: choose companion
  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(160deg, #FFF4E6 0%, #FFFBF4 100%)',
      padding: '40px 24px 32px',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 28, animation: 'fade-in 0.4s ease both' }}>
        <h2 style={{
          fontFamily: 'var(--font-hand)',
          fontSize: 26,
          color: 'var(--ink)',
          marginBottom: 8,
          letterSpacing: 2,
        }}>
          选一个今天的小伙伴
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          color: 'var(--ink-faint)',
        }}>
          不同时间会有不同小伙伴来做客哦
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 14,
        flex: 1,
        marginBottom: 24,
      }}>
        {petList.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setChosenPet(p.id)}
            style={{
              background: chosenPet === p.id ? `${p.color}15` : 'white',
              border: `2.5px solid ${chosenPet === p.id ? p.color : 'transparent'}`,
              borderRadius: 20,
              padding: '16px 12px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              boxShadow: chosenPet === p.id
                ? `0 6px 20px ${p.color}30`
                : '0 2px 10px rgba(0,0,0,0.06)',
              transition: 'all 0.2s',
              animation: `bounce-in 0.5s ease ${i * 0.08}s both`,
            }}
          >
            <PetAvatar petId={p.id} size={65} />
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-hand)',
                fontSize: 17,
                color: 'var(--ink)',
                letterSpacing: 1,
              }}>{p.name}</div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: 11,
                color: 'var(--ink-faint)',
                marginTop: 2,
                lineHeight: 1.5,
              }}>
                {p.id === 'bunny' && 'fashion girl ✨'}
                {p.id === 'monkey' && '高冷天才 🔭'}
                {p.id === 'apple' && '运动单细胞 💪'}
                {p.id === 'sheep' && '暖心小天使 ☁️'}
                {p.id === 'bird' && '有品味生活家 🎨'}
              </div>
            </div>
            {chosenPet === p.id && (
              <div style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: p.color,
                color: 'white',
                borderRadius: '50%',
                width: 22,
                height: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
              }}>✓</div>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={() => chosenPet && onStart(chosenPet)}
        style={{
          background: chosenPet ? PETS[chosenPet]?.color : '#DDD',
          color: 'white',
          border: 'none',
          borderRadius: 18,
          padding: '14px',
          fontFamily: 'var(--font-hand)',
          fontSize: 19,
          letterSpacing: 2,
          cursor: chosenPet ? 'pointer' : 'not-allowed',
          transition: 'all 0.3s',
          boxShadow: chosenPet ? `0 6px 20px ${PETS[chosenPet]?.color}40` : 'none',
        }}
      >
        {chosenPet ? `和${PETS[chosenPet]?.name}一起写 →` : '先选一个小伙伴吧'}
      </button>
    </div>
  );
}
