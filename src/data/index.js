import signs from './topics/signs';
import safety from './topics/safety';
import licenses from './topics/licenses';
import rules from './topics/rules';
import mechanics from './topics/mechanics';
import priority from './topics/priority';
import scenarios from './topics/scenarios';
import heavyVehicles from './topics/heavy-vehicles';
import heavyLoads from './topics/heavy-loads';
import heavyDriving from './topics/heavy-driving';
import motoReady from './topics/moto-ready';
import motoControl from './topics/moto-control';
import motoRoad from './topics/moto-road';
import lawRules from './topics/law-rules';
import lawPenalties from './topics/law-penalties';
import heavyLaw from './topics/heavy-law';
import motoLaw from './topics/moto-law';

// نفس مواصفات الاختبار الشامل الرسمي: 60 سؤالاً، 60 دقيقة، النجاح بـ 51
export const EXAM = { count: 60, minutes: 60, pass: 51 };

// المسارات: topics = أجزاء المسار نفسه، core = أساسيات مشتركة تُضاف للاختبار الشامل
export const TRACKS = [
  {
    id: 'car',
    title: 'الفئتان الثالثة والرابعة',
    short: 'السيارات',
    emoji: '🚗',
    blurb: 'السيارات الخصوصية والعمومية',
    topics: ['signs', 'safety', 'licenses', 'rules', 'mechanics', 'priority', 'scenarios', 'law-rules', 'law-penalties'],
    core: [],
    hero: {
      title: 'افهم قواعد السير، ولا تحفظها فقط',
      text: 'دروس مبسّطة بالرسوم، وأسئلة فهم بعد كل درس، وشرح لكل إجابة، واختبار تجريبي مثل الامتحان الحقيقي.',
    },
  },
  {
    id: 'heavy',
    title: 'الفئتان الخامسة والسادسة',
    short: 'الشاحنات والحافلات',
    emoji: '🚛',
    blurb: 'المركبات الثقيلة والقاطرات والحافلات',
    topics: ['heavy-vehicles', 'heavy-loads', 'heavy-driving', 'heavy-law'],
    core: ['signs', 'priority', 'rules', 'law-rules', 'law-penalties'],
    hero: {
      title: 'المركبة الكبيرة تحتاج فهماً أعمق',
      text: 'الفرامل الهوائية، الحمولة والأوزان، المنحدرات، والنقاط العمياء. ثم أساسيات الشواخص والأولويات المشتركة، واختبار تجريبي بنفس شروط الامتحان.',
    },
  },
  {
    id: 'moto',
    title: 'الدراجة النارية (الفئة الأولى)',
    short: 'الدراجات النارية',
    emoji: '🏍️',
    blurb: 'الدراجة الآلية والسكوتر',
    topics: ['moto-ready', 'moto-control', 'moto-road', 'moto-law'],
    core: ['signs', 'priority', 'rules', 'law-rules', 'law-penalties'],
    hero: {
      title: 'الدراجة النارية: السلامة قبل السرعة',
      text: 'الخوذة والمعدات، التحكم والفرملة والمنعطفات، والقيادة بين السيارات. ثم أساسيات الشواخص والأولويات المشتركة، واختبار تجريبي مثل الامتحان.',
    },
  },
];

export const TRACK_BY_ID = Object.fromEntries(TRACKS.map((t) => [t.id, t]));

const RAW = [
  signs,
  safety,
  licenses,
  rules,
  mechanics,
  priority,
  scenarios,
  heavyVehicles,
  heavyLoads,
  heavyDriving,
  motoReady,
  motoControl,
  motoRoad,
  lawRules,
  lawPenalties,
  heavyLaw,
  motoLaw,
];

// أي مسار يملك كل جزء، ورقم الجزء داخل مساره
const OWNER = {};
for (const tr of TRACKS) tr.topics.forEach((id, i) => (OWNER[id] = { track: tr.id, no: i + 1 }));

// نعطي كل سؤال معرّفاً ثابتاً ونربطه بدرسه
function compile(topic) {
  const sections = topic.sections.map((s) => ({
    ...s,
    checks: s.checks.map((q, i) => ({
      ...q,
      id: `${topic.id}.${s.id}.c${i + 1}`,
      topicId: topic.id,
      ref: q.ref ?? s.id,
      source: q.source ?? topic.sources?.[s.id],
      origin: 'check',
    })),
  }));
  const practice = topic.questions.map((q, i) => ({
    ...q,
    id: `${topic.id}.q${i + 1}`,
    topicId: topic.id,
    source: q.source ?? topic.sources?.[q.ref],
    origin: 'practice',
  }));
  const all = [...sections.flatMap((s) => s.checks), ...practice];
  return { ...topic, ...OWNER[topic.id], sections, practice, all };
}

export const TOPICS = RAW.map(compile);

export const TOPIC_BY_ID = Object.fromEntries(TOPICS.map((t) => [t.id, t]));

export const ALL_QUESTIONS = TOPICS.flatMap((t) => t.all);

export const QUESTION_BY_ID = Object.fromEntries(ALL_QUESTIONS.map((q) => [q.id, q]));

export const sectionKey = (topicId, sectionId) => `${topicId}.${sectionId}`;

export const ALL_SECTION_KEYS = TOPICS.flatMap((t) => t.sections.map((s) => sectionKey(t.id, s.id)));

// أجزاء المسار (الخاصة ثم المشتركة) وأسئلته وأقسامه
export const trackTopics = (track) => [...track.topics, ...track.core].map((id) => TOPIC_BY_ID[id]);
export const trackQuestions = (track) => trackTopics(track).flatMap((t) => t.all);
export const trackSectionKeys = (track) =>
  trackTopics(track).flatMap((t) => t.sections.map((s) => sectionKey(t.id, s.id)));
