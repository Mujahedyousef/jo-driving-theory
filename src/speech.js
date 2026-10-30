import { useSyncExternalStore } from 'react';

// القراءة الصوتية بالاعتماد على Web Speech API المدمجة في المتصفح (لا تحتاج خدمة خارجية).
// تعتمد جودة الصوت على أصوات النظام: ويندوز/أندرويد/iOS فيها أصوات عربية، وكروم يوفّر «Google العربية» عند الاتصال.

const KEY = 'jdt.speech.v1';

export const speechSupported =
  typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';

function loadPrefs() {
  try {
    return { rate: 1, auto: false, voice: null, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return { rate: 1, auto: false, voice: null };
  }
}

const prefs = loadPrefs();
let state = { id: null, tag: null, rate: prefs.rate, auto: prefs.auto, voice: prefs.voice, voicesVersion: 0 };
const listeners = new Set();
const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getState = () => state;
const emit = (patch) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

export const useSpeech = () => useSyncExternalStore(subscribe, getState, getState);
export const autoReadEnabled = () => state.auto;

function savePrefs() {
  try {
    localStorage.setItem(KEY, JSON.stringify({ rate: state.rate, auto: state.auto, voice: state.voice }));
  } catch {
    /* لا مشكلة إن تعذّر الحفظ */
  }
}
export const setRate = (rate) => {
  emit({ rate });
  savePrefs();
};
export const setAuto = (auto) => {
  emit({ auto });
  savePrefs();
};
export const setVoice = (voice) => {
  emit({ voice });
  savePrefs();
};

// ---------- الأصوات ----------
let voices = [];
function refreshVoices() {
  voices = window.speechSynthesis.getVoices?.() ?? [];
  emit({ voicesVersion: state.voicesVersion + 1 });
}
if (speechSupported) {
  refreshVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', refreshVoices);
}

// ترتيب الأصوات العربية: السعودية أولاً، والعصبية الطبيعية (Natural/Online) قبل العادية
function voiceScore(v) {
  const lang = v.lang.toLowerCase().replace('_', '-');
  let score = 10;
  if (lang === 'ar-sa') score = 40;
  else if (lang === 'ar') score = 20;
  else if (lang === 'ar-eg') score = 15;
  else if (lang === 'ar-jo') score = 12;
  if (/natural/i.test(v.name)) score += 30;
  if (/online/i.test(v.name)) score += 15;
  if (/google/i.test(v.name)) score += 5;
  return score;
}

export function arabicVoices() {
  return voices
    .filter((v) => v.lang?.toLowerCase().replace('_', '-').startsWith('ar'))
    .sort((a, b) => voiceScore(b) - voiceScore(a));
}

export function arabicVoice() {
  const list = arabicVoices();
  return list.find((v) => v.voiceURI === state.voice) ?? list[0] ?? null;
}
export const voicesLoaded = () => voices.length > 0;
export const hasArabicVoice = () => !!arabicVoice();

// ---------- تنظيف النص ليُقرأ جيداً ----------
export function cleanForSpeech(text = '') {
  return String(text)
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, ' ')
    .replace(/(?<![ء-ي])م(\d+)(?:\/([ء-ي])(?:\/(\d+))?)?/g, (_, n, f, b) =>
      `المادة ${n}${f ? ` فقرة ${f}` : ''}${b ? ` بند ${b}` : ''}`,
    )
    .replace(/كم\s*\/\s*(س|ساعة)/g, ' كيلومتر في الساعة')
    .replace(/%/g, ' بالمئة')
    .replace(/[×]/g, ' ضرب ')
    .replace(/\s=\s/g, ' يعني ')
    .replace(/[«»"]/g, ' ')
    .replace(/[←→•]/g, ' ')
    .replace(/\s*[—–]\s*/g, '، ')
    .replace(/\//g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.،؛:!؟?])/g, '$1')
    .trim();
}

// تقسيم لقطع قصيرة: كروم يقطع القراءة الطويلة
function chunk(text, max = 200) {
  const sentences = text
    .split(/(?<=[.!؟?؛:\n])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const out = [];
  let cur = '';
  const push = (s) => s && out.push(s);
  for (const s of sentences) {
    if (s.length > max) {
      push(cur);
      cur = '';
      let part = '';
      for (const w of s.split(/\s+/)) {
        if (part && `${part} ${w}`.length > max) {
          push(part);
          part = w;
        } else part = part ? `${part} ${w}` : w;
      }
      push(part);
    } else if (cur && `${cur} ${s}`.length > max) {
      push(cur);
      cur = s;
    } else cur = cur ? `${cur} ${s}` : s;
  }
  push(cur);
  return out;
}

// ---------- التشغيل ----------
let token = 0;
let current = null; // نحتفظ بمرجع حتى لا يجمعه المتصفح قبل أن ينتهي

export function stopSpeaking() {
  token += 1;
  if (speechSupported) window.speechSynthesis.cancel();
  current = null;
  if (state.id !== null || state.tag !== null) emit({ id: null, tag: null });
}

/** items: [{ tag, text }] تُقرأ بالتتابع، ويُعلَن tag الحالي للتظليل */
export function speak(id, items) {
  if (!speechSupported) return;
  stopSpeaking();
  const my = token;
  const queue = items.flatMap(({ tag, text }) => chunk(cleanForSpeech(text)).map((t) => ({ tag, text: t })));
  if (!queue.length) return;
  emit({ id, tag: queue[0].tag });
  const voice = arabicVoice();
  let i = 0;
  const next = () => {
    if (my !== token) return;
    if (i >= queue.length) {
      current = null;
      emit({ id: null, tag: null });
      return;
    }
    const { tag, text } = queue[i++];
    const u = new SpeechSynthesisUtterance(text);
    u.lang = voice?.lang || 'ar-SA';
    if (voice) u.voice = voice;
    u.rate = state.rate;
    u.onstart = () => {
      if (my === token) emit({ tag });
    };
    u.onend = next;
    u.onerror = (e) => {
      if (e.error === 'canceled' || e.error === 'interrupted') return;
      next();
    };
    current = u;
    window.speechSynthesis.speak(u);
  };
  // مهلة قصيرة بعد cancel() تتجنب إسقاط أول جملة في كروم
  setTimeout(next, 60);
}
