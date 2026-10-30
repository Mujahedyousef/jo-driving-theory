import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TRACK_BY_ID } from './data';
import { nextStat } from './learning';

const KEY = 'jdt.progress.v1';

const EMPTY = { sections: {}, stats: {}, best: {}, exams: [], track: 'car' };

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    const data = { ...EMPTY, ...raw };
    // نسخ قديمة: أفضل نتيجة اختبار كانت بدون مسار (كانت للسيارات فقط)
    if (data.best?.exam) {
      const { exam, ...rest } = data.best;
      data.best = { ...rest, 'exam.car': rest['exam.car'] ?? exam };
    }
    if (!TRACK_BY_ID[data.track]) data.track = 'car';
    return data;
  } catch {
    return EMPTY;
  }
}

const Ctx = createContext(null);

export function ProgressProvider({ children, initialTrack }) {
  // صفحات الفئات (/track/..) تفرض الفئة عند أول عرض، وإلا نستخدم المحفوظ
  const [data, setData] = useState(() => {
    const d = load();
    return initialTrack && TRACK_BY_ID[initialTrack] ? { ...d, track: initialTrack } : d;
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* التخزين غير متاح: نكمل بدون حفظ */
    }
  }, [data]);

  const markSection = useCallback(
    (key, value = true) => setData((d) => ({ ...d, sections: { ...d.sections, [key]: value } })),
    [],
  );

  const record = useCallback(
    (results) =>
      setData((d) => {
        const stats = { ...d.stats };
        const now = Date.now();
        for (const [id, correct] of results) stats[id] = nextStat(stats[id], correct, now);
        return { ...d, stats };
      }),
    [],
  );

  const setBest = useCallback(
    (key, score, total) =>
      setData((d) => {
        const prev = d.best[key];
        if (prev && prev.score / prev.total >= score / total) return d;
        return { ...d, best: { ...d.best, [key]: { score, total } } };
      }),
    [],
  );

  const addExam = useCallback(
    (entry) => setData((d) => ({ ...d, exams: [entry, ...d.exams].slice(0, 30) })),
    [],
  );

  const setTrack = useCallback((id) => setData((d) => (TRACK_BY_ID[id] ? { ...d, track: id } : d)), []);

  const reset = useCallback(() => setData(EMPTY), []);

  const importData = useCallback((text) => {
    try {
      const obj = JSON.parse(text);
      const d = obj?.data ?? obj;
      if (!d || typeof d !== 'object' || (!d.stats && !d.sections)) return false;
      setData({ ...EMPTY, ...d, track: TRACK_BY_ID[d.track] ? d.track : 'car' });
      return true;
    } catch {
      return false;
    }
  }, []);

  const api = useMemo(() => {
    const track = TRACK_BY_ID[data.track];
    const ids = new Set([...track.topics, ...track.core]);
    const mine = Object.entries(data.stats).filter(([id]) => ids.has(id.split('.')[0]));
    const wrongIds = mine.filter(([, s]) => s.last === 'w').map(([id]) => id);
    const now = Date.now();
    const dueIds = mine.filter(([, s]) => (s.due ?? 0) <= now).map(([id]) => id);
    const totals = mine.reduce((acc, [, s]) => ({ c: acc.c + s.c, w: acc.w + s.w }), { c: 0, w: 0 });
    const exportData = () =>
      JSON.stringify({ app: 'jo-driving-theory', version: 1, savedAt: new Date().toISOString(), data }, null, 2);
    return {
      data,
      track,
      wrongIds,
      dueIds,
      totals,
      markSection,
      record,
      setBest,
      addExam,
      setTrack,
      reset,
      exportData,
      importData,
    };
  }, [data, markSection, record, setBest, addExam, setTrack, reset, importData]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export const useProgress = () => useContext(Ctx);
