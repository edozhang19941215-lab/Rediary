const ENTRIES_KEY = 'peiPei_entries';
const VISIT_KEY = 'peiPei_todayVisit';
const SEEDED_KEY = 'peiPei_seeded';

// Seed mock diaries on first launch (no existing data)
export function seedIfEmpty() {
  if (localStorage.getItem(SEEDED_KEY)) return;
  const existing = JSON.parse(localStorage.getItem(ENTRIES_KEY) || '[]');
  if (existing.length > 0) { localStorage.setItem(SEEDED_KEY, '1'); return; }
  import('../utils/mockDiaries.js').then(({ MOCK_ENTRIES }) => {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(MOCK_ENTRIES));
    localStorage.setItem(SEEDED_KEY, '1');
  });
}

export function getEntries() {
  try { return JSON.parse(localStorage.getItem(ENTRIES_KEY) || '[]'); }
  catch { return []; }
}

export function saveEntry(entry) {
  const entries = getEntries();
  const i = entries.findIndex(e => e.id === entry.id);
  if (i >= 0) entries[i] = entry; else entries.unshift(entry);
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  return entry;
}

export function getEntryById(id) {
  return getEntries().find(e => e.id === id);
}

export function deleteEntry(id) {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(getEntries().filter(e => e.id !== id)));
}

export function formatDate(isoString) {
  const d = new Date(isoString);
  const weekdays = ['周日','周一','周二','周三','周四','周五','周六'];
  return {
    month: d.getMonth() + 1,
    day: d.getDate(),
    weekday: weekdays[d.getDay()],
    year: d.getFullYear(),
    time: d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    iso: isoString,
  };
}

// Daily pet visit: same pet all day, tracked per day
export function getTodayVisitStatus() {
  try {
    const data = JSON.parse(localStorage.getItem(VISIT_KEY) || '{}');
    const today = new Date().toDateString();
    if (data.date === today) return data;
    return { date: today, dismissed: false, chatted: false };
  } catch { return { dismissed: false, chatted: false }; }
}

export function setVisitDismissed() {
  const today = new Date().toDateString();
  localStorage.setItem(VISIT_KEY, JSON.stringify({ date: today, dismissed: true }));
}

// Growth summary cache
const GROWTH_CACHE_KEY = 'peiPei_growth_cache';

export function getGrowthCache(periodKey) {
  try {
    const cache = JSON.parse(localStorage.getItem(GROWTH_CACHE_KEY) || '{}');
    return cache[periodKey] || null;
  } catch { return null; }
}

export function setGrowthCache(periodKey, data) {
  try {
    const cache = JSON.parse(localStorage.getItem(GROWTH_CACHE_KEY) || '{}');
    cache[periodKey] = data;
    localStorage.setItem(GROWTH_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

// Get entries for a given week (Mon-Sun)
export function getWeekEntries(offsetWeeks = 0) {
  const entries = getEntries();
  const now = new Date();
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1; // Mon=0
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek - offsetWeeks * 7);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return entries.filter(e => {
    const d = new Date(e.date);
    return d >= monday && d <= sunday;
  });
}

// Get entries for a given month
export function getMonthEntries(offsetMonths = 0) {
  const entries = getEntries();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() - offsetMonths;
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return entries.filter(e => {
    const d = new Date(e.date);
    return d >= start && d <= end;
  });
}
