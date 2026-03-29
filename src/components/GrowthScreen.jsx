import { useState, useEffect } from 'react';
import { getWeekEntries, getMonthEntries, formatDate, getGrowthCache, setGrowthCache } from '../utils/storage';
import { generateGrowthSummary, generateGrowthIllustration } from '../api/claude';
import { PetAvatar } from './PetAvatar';
import { getTodaysPet } from '../data/pets';

// ── Period key helpers ──────────────────────────────────────────────────────

function getMondayOfWeek(offsetWeeks) {
  const now = new Date();
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek - offsetWeeks * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function weekPeriodKey(offset) {
  return `week_${getMondayOfWeek(offset).toISOString().slice(0, 10)}`;
}

function monthPeriodKey(offset) {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  return `month_${d.getFullYear()}_${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function weekLabel(offset) {
  if (offset === 0) return '本周';
  if (offset === 1) return '上周';
  const monday = getMondayOfWeek(offset);
  return `${monday.getMonth() + 1}月 第${getWeekOfMonth(monday)}周`;
}

function monthLabel(offset) {
  if (offset === 0) return '本月';
  if (offset === 1) return '上月';
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月`;
}

function getWeekOfMonth(date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  return Math.ceil((date.getDate() + (firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1)) / 7);
}

// ── Main component ──────────────────────────────────────────────────────────

export default function GrowthScreen({ onBack }) {
  const [tab, setTab] = useState('week');
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);

  // per-period data: { summary, imageUrl }
  const [cache, setCache] = useState({}); // in-memory mirror of localStorage cache
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);

  const pet = getTodaysPet();
  const offset = tab === 'week' ? weekOffset : monthOffset;
  const periodKey = tab === 'week' ? weekPeriodKey(weekOffset) : monthPeriodKey(monthOffset);
  const entries = tab === 'week' ? getWeekEntries(weekOffset) : getMonthEntries(monthOffset);
  const currentData = cache[periodKey] || null;

  // Load from localStorage cache on mount and whenever periodKey changes
  useEffect(() => {
    const stored = getGrowthCache(periodKey);
    if (stored && stored.entryCount === entries.length && stored.summary) {
      setCache(prev => ({ ...prev, [periodKey]: stored }));
    } else if (entries.length > 0) {
      generate();
    }
  }, [periodKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const generate = async () => {
    if (entries.length === 0) return;
    setLoading(true);
    const summary = await generateGrowthSummary(entries, tab);
    setLoading(false);

    const partial = { summary, imageUrl: null, entryCount: entries.length };
    setCache(prev => ({ ...prev, [periodKey]: partial }));
    setGrowthCache(periodKey, partial);

    if (summary) {
      setImgLoading(true);
      try {
        const url = await generateGrowthIllustration(summary);
        // Convert to base64 so cached URL doesn't expire (MiniMax OSS ~30min TTL)
        let imageUrl = url;
        try {
          const blob = await fetch(url).then(r => r.blob());
          imageUrl = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.readAsDataURL(blob);
          });
        } catch { /* use raw URL if fetch fails */ }
        const full = { ...partial, imageUrl };
        setCache(prev => ({ ...prev, [periodKey]: full }));
        setGrowthCache(periodKey, full);
      } catch {}
      setImgLoading(false);
    }
  };

  const periodTitle = tab === 'week' ? weekLabel(weekOffset) : monthLabel(monthOffset);

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(180deg, #f6f6f6 0%, #ffffff 100%)',
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <button onClick={onBack} style={{
            background: 'none', border: 'none', fontSize: 22, cursor: 'pointer',
            color: 'var(--ink-light)', padding: '4px 8px 4px 0',
          }}>←</button>
          <h1 style={{
            fontFamily: 'var(--font-hand)', fontSize: 26,
            color: 'var(--ink)', letterSpacing: 2,
          }}>成长轨迹</h1>
          <div style={{ marginLeft: 'auto' }}>
            <PetAvatar petId={pet.id} state="playing" size={44} />
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex', background: 'white', borderRadius: 14,
          padding: 4, boxShadow: 'var(--shadow-soft)', marginBottom: 14,
        }}>
          {[['week', '本周'], ['month', '月份']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1,
              background: tab === key ? pet.color : 'transparent',
              color: tab === key ? 'white' : 'var(--ink-faint)',
              border: 'none', borderRadius: 11, padding: '9px 0',
              fontFamily: 'var(--font-hand)', fontSize: 16, letterSpacing: 1,
              cursor: 'pointer', transition: 'all 0.25s',
              boxShadow: tab === key ? `0 3px 12px ${pet.color}40` : 'none',
            }}>{label}</button>
          ))}
        </div>

        {/* Period navigation */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 16, padding: '0 4px',
        }}>
          <button
            onClick={() => tab === 'week' ? setWeekOffset(o => o + 1) : setMonthOffset(o => o + 1)}
            style={{
              background: 'white', border: 'none', borderRadius: 10,
              padding: '6px 14px', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-light)',
              boxShadow: 'var(--shadow-soft)',
            }}
          >← 更早</button>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: 'var(--font-hand)', fontSize: 17, color: 'var(--ink)', letterSpacing: 1,
            }}>{periodTitle}</div>
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-faint)', marginTop: 2,
            }}>{entries.length} 篇日记</div>
          </div>

          <button
            onClick={() => tab === 'week' ? setWeekOffset(o => Math.max(0, o - 1)) : setMonthOffset(o => Math.max(0, o - 1))}
            disabled={offset === 0}
            style={{
              background: offset === 0 ? 'transparent' : 'white',
              border: 'none', borderRadius: 10,
              padding: '6px 14px',
              cursor: offset === 0 ? 'default' : 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 14,
              color: offset === 0 ? 'var(--ink-faint)' : 'var(--ink-light)',
              opacity: offset === 0 ? 0.3 : 1,
              boxShadow: offset === 0 ? 'none' : 'var(--shadow-soft)',
            }}
          >更近 →</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0 20px 100px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {entries.length === 0 ? (
          <div style={{
            background: 'white', borderRadius: 20, padding: '40px 24px',
            textAlign: 'center', boxShadow: 'var(--shadow-soft)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🌱</div>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 14,
              color: 'var(--ink-faint)', lineHeight: 1.9,
            }}>
              {periodTitle}还没有日记呢<br />
              写下去，这里会慢慢生长 ✨
            </p>
          </div>
        ) : (
          <>
            {/* AI Illustration */}
            <div style={{
              borderRadius: 20, overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
              animation: 'fade-in 0.5s ease both',
              aspectRatio: '1 / 1',
              background: currentData?.imageUrl ? 'transparent' : `${pet.color}10`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {currentData?.imageUrl ? (
                <img
                  src={currentData.imageUrl}
                  alt="成长插图"
                  referrerPolicy="no-referrer"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 10, padding: 40,
                }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{
                        width: 8, height: 8, borderRadius: '50%', background: pet.color,
                        animation: `dot-pulse 1.2s ease ${i * 0.2}s infinite`,
                      }} />
                    ))}
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: 13, color: `${pet.color}80`,
                  }}>正在生成配图…</span>
                </div>
              )}
            </div>

            {loading ? (
              <div style={{
                background: 'white', borderRadius: 20, padding: '32px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                boxShadow: 'var(--shadow-soft)',
              }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      width: 8, height: 8, borderRadius: '50%', background: pet.color,
                      animation: `dot-pulse 1.2s ease ${i*0.2}s infinite`,
                    }} />
                  ))}
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-faint)' }}>
                  {pet.name}正在帮你整理{periodTitle}…
                </p>
              </div>
            ) : currentData?.summary ? (
              <>
                {/* Highlight quote */}
                <div style={{
                  background: 'white', borderRadius: 20, padding: '20px',
                  boxShadow: 'var(--shadow-soft)', position: 'relative', overflow: 'hidden',
                  animation: 'fade-in 0.5s ease 0.1s both',
                }}>
                  <div style={{
                    position: 'absolute', top: 8, left: 14,
                    fontFamily: 'var(--font-deco)', fontSize: 72,
                    color: pet.color, opacity: 0.07, lineHeight: 1,
                  }}>"</div>
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.9,
                    color: 'var(--ink)', position: 'relative', fontStyle: 'italic',
                  }}>{currentData.summary.highlight}</p>
                </div>

                {/* Keywords */}
                <div style={{
                  background: 'white', borderRadius: 20, padding: '18px 20px',
                  boxShadow: 'var(--shadow-soft)', animation: 'fade-in 0.5s ease 0.2s both',
                }}>
                  <p style={{
                    fontFamily: 'var(--font-hand)', fontSize: 14,
                    color: 'var(--ink-faint)', marginBottom: 12, letterSpacing: 1,
                  }}>关键词</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {currentData.summary.keywords?.map((kw, i) => (
                      <span key={i} style={{
                        background: i === 0 ? pet.color : `${pet.color}${18 + i * 8}`,
                        color: i === 0 ? 'white' : pet.color,
                        borderRadius: 20, padding: '6px 14px',
                        fontSize: 14, fontFamily: 'var(--font-hand)', letterSpacing: 1,
                        animation: `bounce-in 0.4s ease ${i * 0.1}s both`,
                      }}>{kw}</span>
                    ))}
                  </div>
                </div>

                {/* Pet summary */}
                <div style={{
                  background: pet.bgColor, borderRadius: 20, padding: '18px 20px',
                  boxShadow: 'var(--shadow-soft)', animation: 'fade-in 0.5s ease 0.3s both',
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                }}>
                  <PetAvatar petId={pet.id} state="talking" size={48} />
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontFamily: 'var(--font-body)', fontSize: 13.5,
                      lineHeight: 1.75, color: 'var(--ink-light)',
                    }}>{currentData.summary.summary}</p>
                    <p style={{
                      fontFamily: 'var(--font-body)', fontSize: 12,
                      color: 'var(--ink-faint)', marginTop: 6,
                    }}>情绪基调：{currentData.summary.emotion}</p>
                  </div>
                </div>

                {/* Entry list */}
                <div style={{
                  background: 'white', borderRadius: 20, padding: '16px 18px',
                  boxShadow: 'var(--shadow-soft)', animation: 'fade-in 0.5s ease 0.4s both',
                }}>
                  <p style={{
                    fontFamily: 'var(--font-hand)', fontSize: 14,
                    color: 'var(--ink-faint)', marginBottom: 12, letterSpacing: 1,
                  }}>日记记录</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {entries.map((entry, i) => {
                      const d = formatDate(entry.date);
                      return (
                        <div key={entry.id} style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0',
                          borderBottom: i < entries.length - 1 ? '1px solid var(--cream)' : 'none',
                        }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: `${pet.color}15`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <span style={{
                              fontFamily: 'var(--font-hand)', fontSize: 14, color: pet.color,
                            }}>{d.day}</span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{
                              fontFamily: 'var(--font-body)', fontSize: 12.5,
                              color: 'var(--ink-light)',
                              display: '-webkit-box', WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical', overflow: 'hidden',
                            }}>{entry.text || '（空白的一页）'}</p>
                          </div>
                          <span style={{
                            fontSize: 10, color: 'var(--ink-faint)',
                            fontFamily: 'var(--font-body)', flexShrink: 0,
                          }}>{d.weekday}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Share button */}
                <button
                  onClick={() => {
                    const content = `${currentData.summary.highlight}\n\n${currentData.summary.keywords?.map(k => '#' + k).join(' ')}`;
                    navigator.clipboard?.writeText(content).catch(() => {});
                    alert('已复制！快去小红书发布吧 ✨');
                  }}
                  style={{
                    background: 'var(--brand-gradient)', color: 'white',
                    border: 'none', borderRadius: 16, padding: '14px 0', width: '100%',
                    fontFamily: 'var(--font-hand)', fontSize: 17, letterSpacing: 1,
                    cursor: 'pointer', boxShadow: '0 6px 20px rgba(204,26,26,0.22)',
                    animation: 'fade-in 0.5s ease 0.5s both',
                  }}
                >📖 生成成长笔记发小红书</button>
              </>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
