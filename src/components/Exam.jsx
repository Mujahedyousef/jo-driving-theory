import { useEffect, useMemo, useRef, useState } from 'react';
import QuestionView from './QuestionView';
import { MistakesList, ScoreRing } from './Quiz';
import { EXAM, TOPIC_BY_ID, trackQuestions } from '../data';
import { useProgress } from '../store';
import { Link } from '../router';
import { ShareBar } from './Growth';
import { formatTime, optionOrder, pct, shuffle } from '../utils';

// سحب متوازن بالتناوب بين الأجزاء
function roundRobin(pools, n) {
  const picked = [];
  for (let k = 0; picked.length < n; k++) {
    let added = false;
    for (const p of pools) {
      if (p[k] && picked.length < n) {
        picked.push(p[k]);
        added = true;
      }
    }
    if (!added) break;
  }
  return picked;
}

// ثلثا الأسئلة من أجزاء الفئة نفسها والباقي من الأساسيات المشتركة، ثم نخلط الترتيب
function buildExam(track) {
  const total = trackQuestions(track).length;
  const count = Math.min(EXAM.count, total);
  const own = track.topics.map((id) => shuffle(TOPIC_BY_ID[id].all));
  const core = track.core.map((id) => shuffle(TOPIC_BY_ID[id].all));
  if (!core.length) return shuffle(roundRobin(own, count));
  const ownCount = Math.min(Math.round((count * 2) / 3), own.reduce((s, p) => s + p.length, 0));
  return shuffle([...roundRobin(own, ownCount), ...roundRobin(core, count - ownCount)]);
}

export default function Exam() {
  const { data, track, record, setBest, addExam } = useProgress();
  const [phase, setPhase] = useState('intro');
  const [qs, setQs] = useState([]);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({});
  const [endAt, setEndAt] = useState(0);
  const [left, setLeft] = useState(EXAM.minutes * 60);
  const [confirm, setConfirm] = useState(false);
  const [result, setResult] = useState(null);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const orders = useMemo(() => Object.fromEntries(qs.map((q) => [q.id, optionOrder(q)])), [qs]);
  const total = qs.length || Math.min(EXAM.count, trackQuestions(track).length);
  const passMark = Math.ceil((total * EXAM.pass) / EXAM.count);

  const start = () => {
    const list = buildExam(track);
    setQs(list);
    setAnswers({});
    setI(0);
    setConfirm(false);
    setResult(null);
    setEndAt(Date.now() + EXAM.minutes * 60 * 1000);
    setLeft(EXAM.minutes * 60);
    setPhase('running');
    window.scrollTo({ top: 0 });
  };

  const finish = () => {
    const ans = answersRef.current;
    const score = qs.filter((q) => ans[q.id] === q.answer).length;
    const seconds = Math.min(EXAM.minutes * 60, EXAM.minutes * 60 - Math.max(0, Math.ceil((endAt - Date.now()) / 1000)));
    const byTopic = {};
    for (const q of qs) {
      const t = (byTopic[q.topicId] ||= { c: 0, t: 0 });
      t.t += 1;
      if (ans[q.id] === q.answer) t.c += 1;
    }
    const passed = score >= passMark;
    record(qs.filter((q) => ans[q.id] != null).map((q) => [q.id, ans[q.id] === q.answer]));
    setBest(`exam.${track.id}`, score, qs.length);
    addExam({ date: Date.now(), score, total: qs.length, passed, seconds, track: track.id });
    setResult({ score, passed, seconds, byTopic, wrong: qs.filter((q) => ans[q.id] !== q.answer), ans });
    setPhase('done');
    setConfirm(false);
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    if (phase !== 'running') return undefined;
    const id = setInterval(() => {
      const s = Math.ceil((endAt - Date.now()) / 1000);
      setLeft(s);
      if (s <= 0) finish();
    }, 500);
    return () => clearInterval(id);
  });

  /* ---------- مقدمة ---------- */
  if (phase === 'intro') {
    return (
      <div className="exam-intro">
        <div className="card hero-card">
          <div className="big-emoji" aria-hidden="true">📝</div>
          <h1>الاختبار التجريبي الشامل</h1>
          <p className="pill soft">
            {track.emoji} {track.title}
          </p>
          <p className="lead">محاكاة لأجواء الامتحان الحقيقي: أسئلة متنوعة من كل الأجزاء، ووقت محدد، ولا تظهر الإجابات الصحيحة إلا بعد التسليم.</p>
          <ul className="facts">
            <li>
              <b>{total}</b>
              <span>سؤالاً</span>
            </li>
            <li>
              <b>{EXAM.minutes}</b>
              <span>دقيقة</span>
            </li>
            <li>
              <b>{passMark}</b>
              <span>إجابة صحيحة للنجاح</span>
            </li>
          </ul>
          <div className="tips">
            <p>💡 يمكنك التنقل بين الأسئلة وتغيير إجابتك قبل التسليم.</p>
            <p>💡 ابدأ بالأسئلة السهلة ثم عد للصعبة. الأسئلة غير المجابة تُحتسب خاطئة.</p>
          </div>
          <button className="btn primary big" onClick={start}>
            ابدأ الاختبار الآن
          </button>
        </div>

        {data.exams.some((e) => (e.track ?? 'car') === track.id) && (
          <div className="card">
            <h3>محاولاتك السابقة</h3>
            <ul className="attempts">
              {data.exams
                .filter((e) => (e.track ?? 'car') === track.id)
                .slice(0, 6)
                .map((e) => (
                <li key={e.date} className={e.passed ? 'pass' : 'fail'}>
                  <span>{new Date(e.date).toLocaleDateString('ar-JO', { day: 'numeric', month: 'long' })}</span>
                  <b>
                    {e.score} / {e.total}
                  </b>
                  <span>{e.passed ? 'ناجح ✅' : 'لم تنجح ❌'}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  /* ---------- النتيجة ---------- */
  if (phase === 'done' && result) {
    const percent = pct(result.score, qs.length);
    return (
      <div className="summary">
        <div className={`card verdict ${result.passed ? 'pass' : 'fail'}`}>
          <ScoreRing value={percent} label={`${result.score} من ${qs.length}`} tone={result.passed ? 'good' : 'low'} />
          <div className="result-text">
            <h1>{result.passed ? '🎉 مبروك! نجحت في الاختبار التجريبي' : 'لم تنجح هذه المرة، وهذا طبيعي'}</h1>
            <p>
              تحتاج {passMark} إجابة صحيحة للنجاح، وحصلت على {result.score}. استغرقت {formatTime(result.seconds)} دقيقة.
              {!result.passed && ' راجع أخطاءك بالأسفل ثم أعد المحاولة.'}
            </p>
            <div className="actions">
              <button className="btn primary" onClick={start}>
                🔁 اختبار جديد
              </button>
              <Link className="btn" to="review">
                🧩 راجع الأسئلة الخاطئة
              </Link>
              <Link className="btn ghost" to="">
                الرئيسية
              </Link>
            </div>
            <ShareBar
              label="شارك نتيجتك مع أصدقائك"
              path="/exam/"
              text={`حصلت على ${result.score} من ${qs.length} في الاختبار التجريبي لفحص السواقة النظري الأردني 🚗 جرّب أنت:`}
            />
          </div>
        </div>

        <div className="card">
          <h3>أداؤك في كل جزء</h3>
          <ul className="topic-bars">
            {Object.entries(result.byTopic).map(([id, v]) => {
              const t = TOPIC_BY_ID[id];
              const p = pct(v.c, v.t);
              return (
                <li key={id}>
                  <span className="tb-name">
                    {t.emoji} {t.title}
                  </span>
                  <div className="tb-track">
                    <div style={{ width: `${p}%`, background: p >= 85 ? 'var(--ok)' : p >= 60 ? 'var(--accent)' : 'var(--bad)' }} />
                  </div>
                  <span className="tb-val">
                    {v.c}/{v.t}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <MistakesList items={result.wrong} answers={result.ans} />
      </div>
    );
  }

  /* ---------- أثناء الاختبار ---------- */
  const q = qs[i];
  const answeredCount = qs.filter((x) => answers[x.id] != null).length;
  const urgent = left <= 300;

  return (
    <div className="exam-run">
      <div className="exam-bar">
        <div className={`timer ${urgent ? 'urgent' : ''}`} role="timer" aria-label="الوقت المتبقي">
          ⏱ {formatTime(left)}
        </div>
        <div className="exam-progress">
          أجبت عن <b>{answeredCount}</b> من {qs.length}
        </div>
        <button className="btn danger small" onClick={() => setConfirm(true)}>
          تسليم الاختبار
        </button>
      </div>

      <article className="card q-card">
        <div className="q-no">
          السؤال {i + 1} من {qs.length}
        </div>
        <QuestionView
          key={q.id}
          q={q}
          selected={answers[q.id] ?? null}
          onSelect={(orig) => setAnswers((a) => ({ ...a, [q.id]: orig }))}
          order={orders[q.id]}
        />
        <div className="q-footer">
          <button className="btn" disabled={i === 0} onClick={() => setI(i - 1)}>
            → السابق
          </button>
          <button className="btn primary" disabled={i === qs.length - 1} onClick={() => setI(i + 1)}>
            التالي ←
          </button>
        </div>
      </article>

      <div className="card navigator" aria-label="التنقل بين الأسئلة">
        {qs.map((x, n) => (
          <button
            key={x.id}
            className={`nav-dot ${n === i ? 'current' : ''} ${answers[x.id] != null ? 'done' : ''}`}
            onClick={() => setI(n)}
            aria-label={`السؤال ${n + 1}${answers[x.id] != null ? ' (مجاب)' : ''}`}
          >
            {n + 1}
          </button>
        ))}
      </div>

      {confirm && (
        <div className="modal-back" role="dialog" aria-modal="true">
          <div className="modal card">
            <h3>تسليم الاختبار؟</h3>
            <p>
              {answeredCount < qs.length
                ? `لم تجب عن ${qs.length - answeredCount} سؤال، وستُحتسب خاطئة.`
                : 'أجبت عن كل الأسئلة. هل أنت جاهز لرؤية النتيجة؟'}
            </p>
            <div className="actions">
              <button className="btn danger" onClick={finish}>
                نعم، سلّم الآن
              </button>
              <button className="btn" onClick={() => setConfirm(false)}>
                متابعة الحل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
