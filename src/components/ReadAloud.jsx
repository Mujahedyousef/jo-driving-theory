import { signName } from './Signs';
import {
  arabicVoice,
  arabicVoices,
  hasArabicVoice,
  setAuto,
  setRate,
  setVoice,
  speak,
  speechSupported,
  stopSpeaking,
  useSpeech,
  voicesLoaded,
} from '../speech';

const LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ'];

// ---------- تحويل المحتوى إلى نص يُقرأ ----------
export function blockToText(b) {
  switch (b.t) {
    case 'p':
      return b.text;
    case 'list':
      return [b.title && `${b.title}:`, ...b.items.map((it) => `${it}.`)].filter(Boolean).join(' ');
    case 'steps':
      return [b.title && `${b.title}:`, ...b.items.map((it, i) => `الخطوة ${i + 1}: ${it}.`)].filter(Boolean).join(' ');
    case 'table': {
      const rows = b.rows.map((r) => `${r[0]}: ${r.slice(1).filter(Boolean).join('، ')}.`);
      return [`جدول: ${b.head.join('، ')}.`, ...rows].join(' ');
    }
    case 'signs':
      return [b.title && `${b.title}:`, ...b.items.map((s) => `${signName(s.id)}${s.note ? `، ${s.note}` : ''}.`)]
        .filter(Boolean)
        .join(' ');
    case 'markings':
      return b.items.map((m) => `${m.label}: ${m.note}.`).join(' ');
    case 'lights':
      return [b.title && `${b.title}:`, ...b.items.map((l) => `${l.label}: ${l.note}.`)].filter(Boolean).join(' ');
    case 'compare':
      return [b.title && `${b.title}:`, ...[b.left, b.right].map((c) => `${c.title}: ${c.points.join('، ')}.`)]
        .filter(Boolean)
        .join(' ');
    case 'diagram':
      return `مخطط: ${b.label ?? ''}`;
    case 'widget':
      return 'هذه أداة تفاعلية، جرّبها بنفسك على الشاشة.';
    case 'match':
      return `لعبة تفاعلية: ${b.title ?? 'وصّل كل كلمة بمعناها'}. جرّبها بنفسك على الشاشة.`;
    case 'simple':
      return `بكلام بسيط: ${b.text}`;
    case 'analogy':
      return [`${b.title ?? 'تخيّل أن'}: ${b.text}`, b.map ? blockToText({ t: 'table', head: b.head, rows: b.map }) : '']
        .filter(Boolean)
        .join(' ');
    case 'glossary':
      return [b.title && `${b.title}:`, ...b.items.map((g) => `${g.term}: ${g.plain}${g.like ? ` يشبه: ${g.like}` : ''}`)]
        .filter(Boolean)
        .join(' ');
    case 'flow':
      return [b.title && `${b.title}:`, ...b.items.map((st, i) => `الخطوة ${i + 1}: ${st.title}. ${st.text ?? ''}`)]
        .filter(Boolean)
        .join(' ');
    case 'recap':
      return `${b.title ?? 'الخلاصة بجملة واحدة'}: ${b.items.join('. ')}.`;
    case 'tip':
      return `تذكّر: ${b.text}`;
    case 'warn':
      return `انتبه: ${b.text}`;
    case 'why':
      return b.text;
    default:
      return '';
  }
}

export function lessonItems(section) {
  return [
    { tag: 'title', text: `الدرس: ${section.title}.` },
    ...section.blocks.map((b, i) => ({ tag: i, text: blockToText(b) })).filter((x) => x.text),
  ];
}

export function questionItems(q, order) {
  const ord = order ?? q.options.map((_, i) => i);
  const opts =
    q.type === 'tf'
      ? 'صح أم خطأ؟'
      : ord.map((orig, pos) => `الخيار ${LETTERS[pos]}: ${q.options[orig]}.`).join(' ');
  return [{ tag: 'q', text: `${q.q} ${opts}` }];
}

export function explanationItems(q, selected) {
  const verdict =
    selected == null
      ? 'لم تُجِب عن هذا السؤال.'
      : selected === q.answer
        ? 'إجابة صحيحة.'
        : `إجابة غير صحيحة. الجواب الصحيح: ${q.options[q.answer]}.`;
  return [{ tag: 'e', text: `${verdict} الشرح: ${q.why}${q.source ? ` المصدر: ${q.source}.` : ''}` }];
}

// ---------- الواجهة ----------
export function ReadButton({ id, getItems, children, className = '', title, stopLabel = '⏹ إيقاف' }) {
  const sp = useSpeech();
  if (!speechSupported) return null;
  const on = sp.id === id;
  return (
    <button
      type="button"
      className={`read-btn ${on ? 'on' : ''} ${className}`}
      aria-pressed={on}
      title={title}
      aria-label={title}
      onClick={() => (on ? stopSpeaking() : speak(id, getItems()))}
    >
      {on ? stopLabel : children}
    </button>
  );
}

export function useActiveTag(id) {
  const sp = useSpeech();
  return sp.id === id ? sp.tag : null;
}

const isEdge = typeof navigator !== 'undefined' && /Edg\//.test(navigator.userAgent);
const TEST_TEXT = 'مرحباً بك. هذا اختبار للصوت العربي. القاعدة الذهبية: السلامة أولاً.';

export function SpeechSettings() {
  const sp = useSpeech();
  if (!speechSupported) return null;
  const list = arabicVoices();
  const noArabic = voicesLoaded() && list.length === 0;
  const voice = arabicVoice();
  const saudi = voice?.lang?.toLowerCase().replace('_', '-') === 'ar-sa';
  return (
    <details className="speech-settings">
      <summary>⚙️ إعدادات الصوت</summary>
      <div className="ss-body">
        {list.length > 0 && (
          <div className="seg-row">
            <label htmlFor="voice-pick">الصوت</label>
            <select id="voice-pick" className="voice-select" value={voice?.voiceURI ?? ''} onChange={(e) => setVoice(e.target.value)}>
              {list.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
            <button type="button" className="btn small" onClick={() => speak('voice-test', [{ tag: 't', text: TEST_TEXT }])}>
              🔊 جرّب الصوت
            </button>
          </div>
        )}
        <div className="seg-row">
          <span>السرعة</span>
          <div className="seg" role="group" aria-label="سرعة القراءة">
            {[
              [0.85, 'أبطأ'],
              [1, 'عادية'],
              [1.25, 'أسرع'],
            ].map(([r, label]) => (
              <button key={r} className={sp.rate === r ? 'on' : ''} onClick={() => setRate(r)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <label className="check-line">
          <input type="checkbox" checked={sp.auto} onChange={(e) => setAuto(e.target.checked)} />
          <span>قراءة الشرح تلقائياً بعد كل إجابة</span>
        </label>
        {voice && saudi && <p className="voice-note ok">✅ صوت سعودي: {voice.name}</p>}
        {voice && !saudi && (
          <p className="voice-note">
            الصوت الحالي: {voice.name} ({voice.lang}) وليس سعودياً. للحصول على الصوت السعودي افتح الموقع في Microsoft Edge، أو ثبّت صوت «العربية
            (السعودية)» عبر ملف install-saudi-voice.bat.
          </p>
        )}
        {noArabic && (
          <p className="voice-note">
            ⚠️ لا يوجد صوت عربي في هذا المتصفح.{' '}
            {isEdge
              ? 'تأكد من اتصالك بالإنترنت: يوفّر Edge أصواتاً سعودية طبيعية (حامد وزارية) عبر الإنترنت.'
              : 'أسرع حل: افتح الموقع في Microsoft Edge، فهو يوفّر أصواتاً سعودية طبيعية (حامد وزارية) عند الاتصال بالإنترنت.'}{' '}
            وللعمل دون إنترنت: شغّل الملف install-saudi-voice.bat من مجلد المشروع (يطلب موافقتك كمسؤول) ثم أعد تشغيل المتصفح.
          </p>
        )}
      </div>
    </details>
  );
}
