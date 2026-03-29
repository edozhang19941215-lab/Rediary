import { useState, useEffect, useRef, useCallback } from 'react';
import { PetAvatar } from './PetAvatar';
import SpeechBubble from './SpeechBubble';
import MediaSuggestion from './MediaSuggestion';
import ShareModal from './ShareModal';
import DiaryCanvas from './DiaryCanvas';
import { getPetById, PHOTO_TRIGGERS, VOICE_TRIGGERS } from '../data/pets';
import { getMoodResponse, getChatReply, updateDiaryFromChat, getProactiveMessage, generateDiaryIllustration } from '../api/claude';
import { saveEntry, getEntries, formatDate } from '../utils/storage';
import { usePetState } from '../hooks/usePetState';
import { TOPICS, getScript } from '../data/petScripts';
import { getStationery } from '../data/stationery';

const MOODS = [
  { emoji: '😊', label: '开心' },
  { emoji: '🥰', label: '温柔' },
  { emoji: '😌', label: '平静' },
  { emoji: '🤔', label: '思考' },
  { emoji: '😢', label: '难过' },
  { emoji: '😤', label: '气气' },
  { emoji: '😴', label: '困了' },
  { emoji: '🌟', label: '充实' },
];

const POSITIVE_MOODS = ['😊', '🥰', '🌟'];
const PROACTIVE_DELAY = 15000; // 15s

export default function DiaryScreen({ entryId, petId, stationeryId = 'lined', onBack }) {
  const pet = getPetById(petId);
  const stationery = getStationery(stationeryId);

  // ── Core diary state ──────────────────────────────────────────────────────
  const [entry, setEntry]               = useState(null);
  const [text, setText]                 = useState('');
  const [mood, setMood]                 = useState(null);
  const [photos, setPhotos]             = useState([]);
  const [wordCount, setWordCount]       = useState(0);
  const [showShare, setShowShare]       = useState(false);
  const [isRecording, setIsRecording]   = useState(false);
  const [mediaSuggestion, setMediaSuggestion] = useState(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [diaryFlash, setDiaryFlash]     = useState(false);
  const [stickers, setStickers]         = useState({});

  // ── Pet interaction state ─────────────────────────────────────────────────
  const [petMessage, setPetMessage]     = useState('');
  const [petLoading, setPetLoading]     = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [petState, setPetState]         = usePetState('welcome');
  const [chatInput, setChatInput]       = useState('');


  // ── Refs for timer callbacks (avoid stale closures) ───────────────────────
  const fileInputRef        = useRef(null);
  const triggeredKeywords   = useRef(new Set());
  const proactiveNoResponse = useRef(0); // consecutive proactives without user response
  const proactiveTimer      = useRef(null);
  const lastInteraction     = useRef('none'); // 'chat' | 'diary' | 'none'
  const chatInputRef        = useRef('');     // mirrors chatInput for timer callback
  const textRef             = useRef(text);
  const historyRef          = useRef(conversationHistory);
  useEffect(() => { textRef.current = text; }, [text]);
  useEffect(() => { historyRef.current = conversationHistory; }, [conversationHistory]);


  // ── Load entry ────────────────────────────────────────────────────────────
  useEffect(() => {
    const entries = getEntries();
    const found = entries.find(e => e.id === entryId);
    if (found) {
      setEntry(found);
      setText(found.text || '');
      setMood(found.mood);
      setPhotos(found.photos || []);
      setStickers(found.stickers || {});
      setWordCount(found.text?.length || 0);
    } else {
      setEntry({
        id: entryId, petId: pet.id,
        date: new Date().toISOString(),
        text: '', photos: [], mood: null, createdAt: Date.now(),
      });
    }
  }, [entryId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Opening greeting — scripted, no LLM call ─────────────────────────────
  useEffect(() => {
    if (!entry) return;
    const opening = getScript(pet.id, TOPICS[0], 'opening');
    setPetMessage(opening);
    const initHistory = [
      { role: 'user', content: '（打开日记本）' },
      { role: 'assistant', content: opening },
    ];
    setConversationHistory(initHistory);
    startProactiveTimer();
  }, [entry?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-save ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!entry || !text) return;
    saveEntry({ ...entry, text, mood, photos, stickers });
  }, [text, mood, photos, stickers]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Proactive timer ───────────────────────────────────────────────────────
  const startProactiveTimer = useCallback(() => {
    clearTimeout(proactiveTimer.current);
    proactiveTimer.current = setTimeout(async () => {
      // Don't interrupt user while composing a chat reply
      if (chatInputRef.current.trim()) { startProactiveTimer(); return; }

      const diaryText = textRef.current.trim();
      let msg;
      if (proactiveNoResponse.current >= 1) {
        // User didn't respond to last LLM proactive — use scripted topic to shift direction
        const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
        msg = getScript(pet.id, topic, 'opening');
        proactiveNoResponse.current = 0; // reset: give LLM another shot next time
      } else {
        setPetLoading(true);
        setPetState('typing');
        msg = await getProactiveMessage({
          pet,
          diaryText,
          conversationHistory: historyRef.current,
        });
        setPetLoading(false);
        proactiveNoResponse.current += 1;
      }

      if (!msg) { startProactiveTimer(); return; }

      setPetState('talking');
      setPetMessage(msg);
      setConversationHistory(prev => [...prev, { role: 'assistant', content: msg }]);
      startProactiveTimer();
    }, PROACTIVE_DELAY);
  }, [pet, setPetState]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => clearTimeout(proactiveTimer.current), []);

  // ── Mood selection ─────────────────────────────────────────────────────────
  const handleMoodSelect = useCallback(async (selected) => {
    const next = mood === selected ? null : selected;
    setMood(next);
    if (!next) return;

    if (POSITIVE_MOODS.includes(next)) setPetState('happy', { thenTalking: 2000 });
    lastInteraction.current = 'chat';
    startProactiveTimer();

    setPetLoading(true);
    const msg = await getMoodResponse({
      pet,
      mood: next,
      moodLabel: MOODS.find(m => m.emoji === next)?.label || '',
    });
    setPetMessage(msg);
    setPetLoading(false);
    if (!POSITIVE_MOODS.includes(next)) setPetState('talking');
    setConversationHistory(prev => [
      ...prev,
      { role: 'user', content: `用户选择了心情：${next}` },
      { role: 'assistant', content: msg },
    ]);
  }, [mood, pet, setPetState, startProactiveTimer]);

  // ── Chat send ──────────────────────────────────────────────────────────────
  const handleChatSend = useCallback(async () => {
    const msg = chatInput.trim();
    if (!msg || petLoading) return;
    setChatInput('');
    chatInputRef.current = '';
    lastInteraction.current = 'chat';
    proactiveNoResponse.current = 0;
    startProactiveTimer();

    const userEntry = { role: 'user', content: msg };
    const updatedHistory = [...historyRef.current, userEntry];
    setConversationHistory(updatedHistory);

    setPetLoading(true);
    setPetState('typing');
    const reply = await getChatReply({
      pet,
      userMessage: msg,
      conversationHistory: historyRef.current,
      diaryText: textRef.current,
    });
    const finalHistory = [...updatedHistory, { role: 'assistant', content: reply }];
    setPetMessage(reply);
    setPetLoading(false);
    setPetState('talking');
    setConversationHistory(finalHistory);

    // Check user message AND pet reply for photo/voice triggers
    analyzeForMedia(msg);
    checkPetPhotoHint(reply);

    // Background diary update
    updateDiaryFromChat({ conversationHistory: finalHistory, currentDiary: textRef.current })
      .then(newContent => appendToDiary(newContent));
  }, [chatInput, petLoading, pet, setPetState, startProactiveTimer, analyzeForMedia, checkPetPhotoHint]);

  // ── Diary textarea ─────────────────────────────────────────────────────────
  const handleTextChange = (e) => {
    const val = e.target.value;
    setText(val);
    setWordCount(val.length);
    lastInteraction.current = 'diary';
    proactiveNoResponse.current = 0;
    // Do NOT reset the proactive timer here — pet should poll while user types
    analyzeForMedia(val);
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const appendToDiary = (newContent) => {
    if (!newContent) return;
    setText(prev => prev ? prev + '\n' + newContent : newContent);
    setDiaryFlash(true);
    setTimeout(() => setDiaryFlash(false), 1400);
  };

  const analyzeForMedia = useCallback((currentText) => {
    const lower = currentText.toLowerCase();
    // Voice triggers — once per session
    if (!triggeredKeywords.current.has('__voice__')) {
      const hasVoice = VOICE_TRIGGERS.some(t => lower.includes(t));
      if (hasVoice) {
        triggeredKeywords.current.add('__voice__');
        setMediaSuggestion('voice');
        return;
      }
    }
    // Photo triggers — per unique keyword, so new items re-trigger
    const newKw = PHOTO_TRIGGERS.find(t => lower.includes(t) && !triggeredKeywords.current.has(t));
    if (newKw) {
      triggeredKeywords.current.add(newKw);
      setMediaSuggestion('photo');
    }
  }, []);

  // Detect if pet reply explicitly suggests taking a photo
  const PET_PHOTO_HINTS = ['拍照', '留下影像', '拍下来', '拍张', '留下来', '必须记录', '留念', '影像', '拍一张', '留下这'];
  const checkPetPhotoHint = useCallback((replyText) => {
    if (triggeredKeywords.current.has('__pet_photo__')) return;
    const lower = replyText.toLowerCase();
    if (PET_PHOTO_HINTS.some(h => lower.includes(h))) {
      triggeredKeywords.current.add('__pet_photo__');
      setMediaSuggestion('photo');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePhotoAdd = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const existing = photos.length;
      setPhotos(prev => [...prev, {
        id: Date.now(), src: e.target.result,
        x: 20 + existing * 12, y: 60 + existing * 10,
        rotation: (existing % 2 === 0 ? 1 : -1) * (1 + existing % 3),
      }]);
      setMediaSuggestion(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAIPhoto = async () => {
    setAiGenerating(true);
    try {
      const url = await generateDiaryIllustration(text, pet);
      // Fetch and convert to base64 so it persists after OSS URL expires
      let src = url;
      try {
        const blob = await fetch(url).then(r => r.blob());
        src = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = e => resolve(e.target.result);
          reader.readAsDataURL(blob);
        });
      } catch { /* use URL directly if fetch fails */ }
      const existing = photos.length;
      setPhotos(prev => [...prev, {
        id: Date.now(), src,
        x: 20 + existing * 12, y: 60 + existing * 10,
        rotation: (Math.random() * 6 - 3),
      }]);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleUpdatePhotoPos = (id, x, y) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, x, y } : p));
  };

  const handleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('请使用 Chrome 浏览器以支持语音输入'); return; }
    const recog = new SR();
    recog.lang = 'zh-CN';
    recog.continuous = false;
    recog.interimResults = false;
    setIsRecording(true);
    recog.onresult = (e) => {
      setText(prev => prev + e.results[0][0].transcript);
      setIsRecording(false);
    };
    recog.onerror = () => setIsRecording(false);
    recog.onend = () => setIsRecording(false);
    recog.start();
    setMediaSuggestion(null);
  };

  const handleSave = () => {
    saveEntry({ ...entry, text, mood, photos });
    setPetState('goodbye');
    if (text.trim().length > 20) {
      setTimeout(() => setShowShare(true), 600);
    } else {
      setTimeout(onBack, 600);
    }
  };

  const today = entry ? formatDate(entry.date) : null;
  if (!entry) return null;


  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: pet.bgColor, position: 'relative',
    }}>
      {/* Washi tape top */}
      <div style={{
        height: 6,
        background: `repeating-linear-gradient(90deg, ${pet.color}70 0px, ${pet.color}70 18px, transparent 18px, transparent 26px)`,
      }} />

      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px 8px', flexShrink: 0,
      }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', fontSize: 22, cursor: 'pointer',
          padding: '4px 8px 4px 0', color: 'var(--ink-light)',
        }}>←</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-hand)', fontSize: 18, color: 'var(--ink)' }}>
            {today?.month}月{today?.day}日
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-faint)' }}>
            {today?.weekday}
          </div>
        </div>
        <button onClick={handleSave} style={{
          background: pet.color, color: 'white', border: 'none', borderRadius: 12,
          padding: '6px 16px', fontFamily: 'var(--font-hand)', fontSize: 15,
          cursor: 'pointer', boxShadow: `0 3px 12px ${pet.color}40`,
        }}>保存</button>
      </div>

      {/* ── Pet chat card (prominent) ── */}
      <div style={{
        margin: '0 16px 10px', flexShrink: 0,
        background: 'white',
        borderRadius: 24,
        boxShadow: `0 4px 24px ${pet.color}22`,
        border: `1.5px solid ${pet.accent}`,
        padding: '14px 14px 12px',
      }}>
        {/* Mood row — compact inside card */}
        <div style={{ display: 'flex', gap: 5, overflowX: 'auto', scrollbarWidth: 'none', marginBottom: 12 }}>
          {MOODS.map(m => (
            <button key={m.emoji} onClick={() => handleMoodSelect(m.emoji)}
              style={{
                flexShrink: 0,
                background: mood === m.emoji ? `${pet.color}18` : 'var(--surface)',
                border: `1.5px solid ${mood === m.emoji ? pet.color : 'transparent'}`,
                borderRadius: 20, padding: '3px 10px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 3,
                transition: 'all 0.15s',
                transform: mood === m.emoji ? 'scale(1.08)' : 'scale(1)',
              }}>
              <span style={{ fontSize: 16 }}>{m.emoji}</span>
              <span style={{ fontSize: 10.5, fontFamily: 'var(--font-body)', color: mood === m.emoji ? pet.color : 'var(--ink-light)', whiteSpace: 'nowrap' }}>
                {m.label}
              </span>
            </button>
          ))}
        </div>

        {/* Pet + bubble */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <div style={{ flexShrink: 0 }}>
            <PetAvatar petId={pet.id} state={petState} size={110} />
          </div>
          <div style={{ flex: 1 }}>
            <SpeechBubble text={petMessage} isLoading={petLoading} petColor={pet.color} />
          </div>
        </div>

        {/* Chat input */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={chatInput}
            onChange={e => { setChatInput(e.target.value); chatInputRef.current = e.target.value; startProactiveTimer(); }}
            onKeyDown={e => e.key === 'Enter' && handleChatSend()}
            placeholder="试试和我聊天也可以写日记哟"
            style={{
              flex: 1, background: 'var(--surface)', border: 'none', borderRadius: 22,
              padding: '9px 16px', fontFamily: 'var(--font-body)', fontSize: 13.5,
              color: 'var(--ink)', outline: 'none',
            }}
          />
          <button
            onClick={handleChatSend}
            disabled={!chatInput.trim() || petLoading}
            style={{
              width: 36, height: 36, borderRadius: '50%', border: 'none',
              background: chatInput.trim() && !petLoading ? pet.color : 'var(--surface-high)',
              color: chatInput.trim() && !petLoading ? 'white' : 'var(--ink-faint)',
              cursor: chatInput.trim() && !petLoading ? 'pointer' : 'default',
              fontSize: 16, transition: 'all 0.15s', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >↑</button>
        </div>
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => e.target.files[0] && handlePhotoAdd(e.target.files[0])} />

      {/* 手帐 paper canvas */}
      <DiaryCanvas
        stationery={stationery}
        text={text}
        onTextChange={handleTextChange}
        mood={mood}
        moods={MOODS}
        photos={photos}
        onRemovePhoto={(id) => setPhotos(prev => prev.filter(p => p.id !== id))}
        onUpdatePhotoPos={handleUpdatePhotoPos}
        onAIPhoto={handleAIPhoto}
        onLocalPhoto={handlePhotoAdd}
        fileInputRef={fileInputRef}
        entry={entry}
        pet={pet}
        diaryFlash={diaryFlash}
        wordCount={wordCount}
        stickers={stickers}
        onStickerChange={setStickers}
        aiGenerating={aiGenerating}
      />

      {/* Bottom toolbar — voice only, photo is in canvas */}
      <div style={{
        padding: '4px 16px 24px', display: 'flex',
        alignItems: 'center', gap: 10, flexShrink: 0, background: pet.bgColor,
      }}>
        <button onClick={handleVoice}
          style={{
            background: isRecording ? pet.color : 'white',
            border: 'none', borderRadius: 14, padding: '9px 16px',
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            fontSize: 16, transition: 'background 0.2s',
            display: 'flex', alignItems: 'center', gap: 6,
            color: isRecording ? 'white' : 'var(--ink-light)',
            fontFamily: 'var(--font-body)',
          }}>
          🎙️ {isRecording ? '录音中…' : '语音输入'}
        </button>
      </div>

      {mediaSuggestion && (
        <MediaSuggestion
          type={mediaSuggestion} petName={pet.name} petColor={pet.color}
          onPhoto={handlePhotoAdd} onVoice={handleVoice}
          onDismiss={() => setMediaSuggestion(null)}
        />
      )}

      {showShare && (
        <ShareModal
          pet={pet}
          diaryText={text}
          conversationHistory={conversationHistory}
          onClose={() => { setShowShare(false); onBack(); }}
        />
      )}
    </div>
  );
}
