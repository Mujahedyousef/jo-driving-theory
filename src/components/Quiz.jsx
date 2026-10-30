import { useEffect, useMemo, useState } from 'react';
import QuestionView from './QuestionView';
import { useProgress } from '../store';
import { Link } from '../router';
import { optionOrder, pct } from '../utils';
import { TOPIC_BY_ID } from '../data';
import { SpeechSettings } from './ReadAloud';

export function ScoreRing({ value, label, tone }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className={`ring ${tone ?? ''}`} role="img" aria-label={`${value}%`}>
      <svg viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} className="ring-bg" />
        <circle
          cx="60"
          cy="60"
          r={r}
          className="ring-fg"
          strokeDasharray={c}
          strokeDashoffset={c - (c * value) / 100}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="ring-text">
        <b>{value}%</b>
        <small>{label}</small>
      </div>
    </div>
  );
}

export function MistakesList({ items, answers }) {
  if (!items.length) return null;
  return (
    <div className="mistakes">
      <h3>راجع ما أخطأت فيه ({items.length})</h3>
      {items.map((q, n) => (
        <article key={q.id} className="card mistake">
          <div className="mistake-no">{n + 1}</div>
          <QuestionView q={q} selected={answers[q.id] ?? null} reveal locked order={q.options.map((_, i) => i)} />
        </article>
      ))}
    </div>
  );
}

function Summary({ title, questions, answers, onRestart, onRetry, backTo, backLabel }) {
  const correct = questions.filter((q) => answers[q.id] === q.answer).length;
  const percent = pct(correct, questions.length);
  const wrong = questions.filter((q) => answers[q.id] !== q.answer);
  const tone = percent >= 85 ? 'good' : percent >= 60 ? 'mid' : 'low';
  const msg =
    percent >= 85
      ? 'ممتاز! أنت بمستوى النجاح. استمر بالمراجعة حتى تثبت المعلومات.'
      : percent >= 60
        ? 'جيد، لكن ما زلت تحتاج لتثبيت بعض النقاط. راجع أخطاءك بالأسفل.'
        : 'لا بأس، هذه بداية. ارجع إلى الدرس واقرأ الشرح ثم أعد المحاولة.';

  return (
    <div className="summary">
      <div className="card result-card">
        <ScoreRing value={percent} label={`${correct} من ${questions.length}`} tone={tone} />
        <div className="result-text">
          <h2>انتهى: {title}</h2>
          <p>{msg}</p>
          <div className="actions">
            {wrong.length > 0 && (
              <button className="btn primary" onClick={() => onRetry(wrong)}>
                🔁 أعد الأسئلة التي أخطأت بها ({wrong.length})
              </button>
            )}
            <button className="btn" onClick={onRestart}>
              🎲 تدريب جديد
            </button>
            <Link className="btn ghost" to={backTo}>
              {backLabel}
            </Link>
          </div>
        </div>
      </div>
      <TopicBreakdown questions={questions} answers={answers} />
      <MistakesList items={wrong} answers={answers} />
    </div>
  );
}

function TopicBreakdown({ questions, answers }) {
  const groups = {};
  for (const q of questions) {
    const g = (groups[q.topicId] ||= { c: 0, t: 0 });
    g.t += 1;
    if (answers[q.id] === q.answer) g.c += 1;
  }
  const entries = Object.entries(groups);
  if (entries.length < 2) return null;
  return (
    <div className="card">
      <h3>أداؤك حسب الجزء</h3>
      <ul className="topic-bars">
        {entries.map(([id, v]) => {
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
      {entries.some(([, v]) => pct(v.c, v.t) < 70) && (
        <p className="muted">
          الأجزاء التي دون 70%:{' '}
          {entries
            .filter(([, v]) => pct(v.c, v.t) < 70)
            .map(([id]) => (
              <Link key={id} className="fb-link" to={`topic/${id}`}>
                {TOPIC_BY_ID[id].title}
              </Link>
            ))
            .reduce((acc, el, i) => (i ? [...acc, ' • ', el] : [el]), [])}
        </p>
      )}
    </div>
  );
}

function Runner({ title, questions, backTo, backLabel, bestKey, onRestart, onRetry }) {
  const { record, setBest } = useProgress();
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);

  const orders = useMemo(() => Object.fromEntries(questions.map((q) => [q.id, optionOrder(q)])), [questions]);
  const q = questions[i];
  const sel = answers[q.id] ?? null;
  const answered = sel != null;
  const last = i === questions.length - 1;

  const choose = (orig) => {
    if (answered) return;
    setAnswers((a) => ({ ...a, [q.id]: orig }));
    record([[q.id, orig === q.answer]]);
  };

  const next = () => {
    if (!answered) return;
    if (last) {
      const score = questions.filter((x) => (x.id === q.id ? sel : answers[x.id]) === x.answer).length;
      if (bestKey) setBest(bestKey, score, questions.length);
      setDone(true);
    } else {
      setI(i + 1);
    }
  };

  useEffect(() => {
    if (done) return undefined;
    const onKey = (e) => {
      if (e.target.closest?.('input,textarea,select')) return;
      const n = Number(e.key);
      if (n >= 1 && n <= orders[q.id].length && !answered) choose(orders[q.id][n - 1]);
      if ((e.key === 'Enter' || e.key === 'ArrowLeft') && answered) next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (done) {
    return (
      <Summary
        title={title}
        questions={questions}
        answers={answers}
        onRestart={onRestart}
        onRetry={onRetry}
        backTo={backTo}
        backLabel={backLabel}
      />
    );
  }

  return (
    <div className="runner">
      <div className="runner-head">
        <Link className="back" to={backTo}>
          ← {backLabel}
        </Link>
        <div className="runner-title">{title}</div>
        <div className="runner-count">
          {i + 1} / {questions.length}
        </div>
      </div>
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={i + (answered ? 1 : 0)}>
        <div style={{ width: `${((i + (answered ? 1 : 0)) / questions.length) * 100}%` }} />
      </div>

      <SpeechSettings />

      <article className="card q-card">
        <QuestionView q={q} selected={sel} onSelect={choose} reveal={answered} locked={answered} order={orders[q.id]} />
        <div className="q-footer">
          <small className="hint">اختصار: اضغط 1 – {orders[q.id].length} للإجابة، وEnter للتالي</small>
          <button className="btn primary" disabled={!answered} onClick={next}>
            {last ? 'اعرض النتيجة' : 'السؤال التالي'} ←
          </button>
        </div>
      </article>
    </div>
  );
}

/** جلسة تدريب: تدير إعادة الأسئلة الخاطئة والتدريب من جديد */
export default function QuizSession({ title, makeQuestions, backTo, backLabel, bestKey }) {
  const [qs, setQs] = useState(makeQuestions);
  const [run, setRun] = useState(0);
  const restart = (list) => {
    setQs(list);
    setRun((r) => r + 1);
    window.scrollTo({ top: 0 });
  };

  if (!qs.length) {
    return (
      <div className="card empty">
        <div className="empty-icon">🎉</div>
        <h2>لا توجد أسئلة هنا بعد</h2>
        <p>أجب عن بعض الأسئلة أولاً، وسنجمع لك هنا الأسئلة التي تحتاج لمراجعتها.</p>
        <Link className="btn primary" to={backTo}>
          {backLabel}
        </Link>
      </div>
    );
  }

  return (
    <Runner
      key={run}
      title={title}
      questions={qs}
      backTo={backTo}
      backLabel={backLabel}
      bestKey={bestKey}
      onRestart={() => restart(makeQuestions())}
      onRetry={(list) => restart(list)}
    />
  );
}
