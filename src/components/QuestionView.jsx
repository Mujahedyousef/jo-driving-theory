import { useEffect, useMemo, useRef } from 'react';
import { SignView, RoadMarking, TrafficLight } from './Signs';
import Intersection from './Intersection';
import { optionOrder } from '../utils';
import { Link } from '../router';
import { TOPIC_BY_ID } from '../data';
import { ReadButton, explanationItems, questionItems } from './ReadAloud';
import { autoReadEnabled, speak } from '../speech';

const LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ'];

export function Figure({ q }) {
  if (q.sign) return <div className="q-figure"><SignView id={q.sign} size={120} title="شاخصة مرورية" /></div>;
  if (q.marking) return <div className="q-figure"><RoadMarking kind={q.marking} size={170} withCar={q.withCar} /></div>;
  if (q.light) return <div className="q-figure"><TrafficLight on={q.light.on} size={120} /></div>;
  if (q.diagram) return <div className="q-figure wide"><Intersection {...q.diagram} /></div>;
  return null;
}

/**
 * عرض سؤال واحد.
 * selected: الفهرس الأصلي للخيار المختار (أو null)
 * reveal:   هل نُظهر الصحيح والخطأ والشرح؟
 */
export default function QuestionView({ q, selected, onSelect, reveal = false, locked = false, order, showRef = true }) {
  const ord = useMemo(() => order ?? optionOrder(q), [q, order]);
  const isRight = selected === q.answer;
  const topic = TOPIC_BY_ID[q.topicId];

  // قراءة الشرح تلقائياً عند كشف الإجابة (وليس عند عرض أخطاء سابقة مكشوفة أصلاً)
  const prevReveal = useRef(reveal);
  useEffect(() => {
    if (!prevReveal.current && reveal && selected != null && autoReadEnabled()) {
      speak(`e:${q.id}`, explanationItems(q, selected));
    }
    prevReveal.current = reveal;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reveal]);

  return (
    <div className="question">
      <Figure q={q} />
      <div className="q-line">
        <h3 className="q-text">{q.q}</h3>
        <ReadButton
          id={`q:${q.id}`}
          getItems={() => questionItems(q, ord)}
          className="icon"
          title="اقرأ السؤال والخيارات"
          stopLabel="⏹"
        >
          🔊
        </ReadButton>
      </div>

      <div className={`options ${q.type === 'tf' ? 'two' : ''}`} role="radiogroup" aria-label="الخيارات">
        {ord.map((orig, pos) => {
          const state =
            reveal && orig === q.answer ? 'right' : reveal && selected === orig ? 'wrong' : selected === orig ? 'picked' : '';
          return (
            <button
              key={orig}
              role="radio"
              aria-checked={selected === orig}
              className={`option ${state}`}
              disabled={locked}
              onClick={() => onSelect?.(orig)}
            >
              <span className="letter">{q.type === 'tf' ? (orig === 0 ? '✓' : '✗') : LETTERS[pos]}</span>
              <span className="otext">{q.options[orig]}</span>
              {reveal && orig === q.answer && <span className="mark" aria-label="الإجابة الصحيحة">✔</span>}
              {reveal && selected === orig && orig !== q.answer && <span className="mark" aria-label="إجابة خاطئة">✖</span>}
            </button>
          );
        })}
      </div>

      {reveal && (
        <div className={`feedback ${isRight ? 'ok' : selected == null ? 'skip' : 'bad'}`} role="status">
          <div className="fb-head">
            {isRight ? '✅ أحسنت! إجابة صحيحة' : selected == null ? '⏭ لم تجب عن هذا السؤال' : '❌ إجابة غير صحيحة'}
          </div>
          {!isRight && (
            <p className="fb-answer">
              الجواب الصحيح: <b>{q.options[q.answer]}</b>
            </p>
          )}
          <p className="fb-why">
            <b>الشرح: </b>
            {q.why}
          </p>
          <ReadButton id={`e:${q.id}`} getItems={() => explanationItems(q, selected)} className="small" title="اقرأ الشرح">
            🔊 اقرأ الشرح
          </ReadButton>
          {q.source && (
            <p className="fb-source">
              <span aria-hidden="true">📚</span> المصدر: {q.source}
            </p>
          )}
          {showRef && q.ref && topic && (
            <Link className="fb-link" to={`topic/${topic.id}?s=${q.ref}`}>
              📖 راجع الدرس في «{topic.title}»
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
