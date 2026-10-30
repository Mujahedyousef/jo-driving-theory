import { EXAM, trackTopics } from './data';
import { shuffle } from './utils';

export const DAY = 24 * 60 * 60 * 1000;

// التكرار المتباعد (نظام لايتنر): كل إجابة صحيحة ترفع السؤال صندوقاً فتتباعد مراجعته،
// وأي خطأ يعيده للصندوق 0 فيظهر في «مراجعة اليوم» فوراً.
export const INTERVALS = [0, 1, 3, 7, 14, 30]; // أيام حتى المراجعة التالية، حسب الصندوق

export function nextStat(prev, correct, now = Date.now()) {
  const s = prev || { c: 0, w: 0 };
  const current = s.box ?? (s.last === 'c' ? 1 : 0);
  const box = correct ? Math.min(current + 1, INTERVALS.length - 1) : 0;
  return {
    c: s.c + (correct ? 1 : 0),
    w: s.w + (correct ? 0 : 1),
    last: correct ? 'c' : 'w',
    box,
    due: now + INTERVALS[box] * DAY,
  };
}

// درجة الإتقان لكل سؤال: لم يُجَب = 0، أخطأت آخر مرة = 0.15، ثم ترتفع مع الصندوق
const MASTERY = [0.15, 0.5, 0.7, 0.85, 0.95, 1];
export function masteryOf(s) {
  if (!s) return 0;
  if (s.last === 'w') return 0.15;
  return MASTERY[Math.min(s.box ?? 1, MASTERY.length - 1)];
}

export function topicMastery(topic, stats) {
  let sum = 0;
  let attempted = 0;
  for (const q of topic.all) {
    const s = stats[q.id];
    if (s) attempted += 1;
    sum += masteryOf(s);
  }
  const total = topic.all.length;
  return { mastery: total ? sum / total : 0, attempted, total };
}

export function levelLabel(level) {
  return {
    start: 'في بداية الطريق',
    way: 'في الطريق الصحيح',
    close: 'قريب جداً',
    ready: 'جاهز للامتحان',
  }[level];
}

/** مؤشر الجاهزية لمسار: يجمع الإتقان الفعلي للأسئلة مع نتائج آخر ثلاثة اختبارات شاملة */
export function readiness(track, data) {
  const per = trackTopics(track).map((topic) => ({ topic, ...topicMastery(topic, data.stats) }));
  const total = per.reduce((n, p) => n + p.total, 0);
  const attempted = per.reduce((n, p) => n + p.attempted, 0);
  const mastery = total ? per.reduce((n, p) => n + p.mastery * p.total, 0) / total : 0;
  const coverage = total ? attempted / total : 0;

  const exams = data.exams.filter((e) => (e.track ?? 'car') === track.id).slice(0, 3);
  const examAvg = exams.length ? exams.reduce((n, e) => n + e.score / e.total, 0) / exams.length : null;
  const passRatio = EXAM.pass / EXAM.count;
  const lastTwoPassed = exams.length >= 2 && exams.slice(0, 2).every((e) => e.score / e.total >= passRatio);

  // قبل أي اختبار شامل لا نسمح للمؤشر بتجاوز 85% لأن الإتقان وحده لا يثبت الجاهزية
  const score = Math.round((examAvg == null ? mastery * 0.85 : mastery * 0.6 + examAvg * 0.4) * 100);

  const weakest = [...per].sort((a, b) => a.mastery - b.mastery).slice(0, 3);
  const level =
    mastery >= 0.85 && lastTwoPassed ? 'ready' : score >= 70 ? 'close' : score >= 40 ? 'way' : 'start';

  const checklist = [
    { ok: coverage >= 0.9, text: `جرّبت 90% على الأقل من أسئلة الفئة (الآن ${Math.round(coverage * 100)}%)` },
    { ok: mastery >= 0.85, text: `إتقان الأسئلة 85% فأكثر (الآن ${Math.round(mastery * 100)}%)` },
    { ok: weakest[0] ? weakest[0].mastery >= 0.7 : false, text: 'كل جزء فوق 70% إتقاناً' },
    { ok: lastTwoPassed, text: 'اجتزت اختبارين شاملين متتاليين' },
  ];

  return { score, level, mastery, coverage, per, weakest, checklist, examCount: exams.length };
}

/** اختبار تشخيصي: سؤالان أو ثلاثة من كل جزء ليتبيّن أين تبدأ */
export function buildDiagnostic(track) {
  const topics = trackTopics(track);
  const per = topics.length <= 6 ? 3 : 2;
  return shuffle(topics.flatMap((t) => shuffle(t.all).slice(0, per)));
}
