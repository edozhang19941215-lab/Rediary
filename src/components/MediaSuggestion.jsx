import { useRef, useState } from 'react';

export default function MediaSuggestion({ type, petName, petColor, onPhoto, onAIPhoto, onVoice, onDismiss }) {
  const fileRef = useRef();
  const [aiLoading, setAiLoading] = useState(false);

  const isPhoto = type === 'photo';

  const handleAI = async () => {
    setAiLoading(true);
    await onAIPhoto();
    setAiLoading(false);
    onDismiss();
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: 130,
      left: 16,
      right: 16,
      background: 'white',
      borderRadius: 20,
      padding: '16px 18px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      border: `2px solid ${petColor}40`,
      animation: 'slide-up 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
      zIndex: 50,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 13.5,
          color: 'var(--ink)',
          lineHeight: 1.6,
          flex: 1,
          marginRight: 8,
        }}>
          {isPhoto
            ? `${petName}觉得这个时刻值得留下一张照片 📷`
            : `${petName}想听听这美好的声音 🎙️`}
        </p>
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 18,
            color: 'var(--ink-faint)',
            cursor: 'pointer',
            padding: '0 4px',
            lineHeight: 1,
          }}
        >×</button>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {isPhoto && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => {
                if (e.target.files[0]) { onPhoto(e.target.files[0]); onDismiss(); }
              }}
            />
            <button
              onClick={handleAI}
              disabled={aiLoading}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: 12,
                border: `1.5px solid ${petColor}`,
                background: petColor,
                color: 'white',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                cursor: aiLoading ? 'default' : 'pointer',
                fontWeight: 500,
                opacity: aiLoading ? 0.7 : 1,
              }}
            >{aiLoading ? '生成中…' : '✨ AI生图'}</button>
            <button
              onClick={() => fileRef.current.click()}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: 12,
                border: `1.5px solid ${petColor}`,
                background: `${petColor}15`,
                color: petColor,
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >📷 插入照片</button>
          </>
        )}
        {!isPhoto && (
          <button
            onClick={onVoice}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 12,
              border: `1.5px solid ${petColor}`,
              background: `${petColor}15`,
              color: petColor,
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >🎙️ 语音备忘</button>
        )}
        <button
          onClick={onDismiss}
          style={{
            padding: '10px 16px',
            borderRadius: 12,
            border: '1.5px solid var(--ink-faint)',
            background: 'transparent',
            color: 'var(--ink-faint)',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >下次吧</button>
      </div>
    </div>
  );
}
