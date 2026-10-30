import { useEffect, useState } from 'react';
import Blocks from './Blocks';
import QuestionView from './QuestionView';
import { TOPIC_BY_ID, TRACK_BY_ID, sectionKey } from '../data';
import { useProgress } from '../store';
import { Link } from '../router';
import { ReadButton, SpeechSettings, lessonItems, useActiveTag } from './ReadAloud';
import { Breadcrumbs } from './Growth';

function Section({ topic, section, index }) {
  const { data, markSection, record } = useProgress();
  const key = sectionKey(topic.id, section.id);
  const done = !!data.sections[key];
  const [answers, setAnswers] = useState({});
  const answeredAll = section.checks.every((c) => answers[c.id] != null);
  const readId = `lesson:${key}`;
  const activeTag = useActiveTag(readId);

  useEffect(() => {
    if (answeredAll && !done) markSection(key, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answeredAll]);

  const pick = (c, orig) => {
    if (answers[c.id] != null) return;
    setAnswers((a) => ({ ...a, [c.id]: orig }));
    record([[c.id, orig === c.answer]]);
  };

  return (
    <section id={`sec-${section.id}`} className="card lesson" style={{ '--topic': topic.color }}>
      <header className="lesson-head">
        <span className="lesson-no">الدرس {index + 1}</span>
        <h2>{section.title}</h2>
        {done && <span className="badge ok">✓ أكملته</span>}
      </header>

      <div className="read-bar">
        <ReadButton id={readId} getItems={() => lessonItems(section)} title="استمع إلى شرح الدرس">
          🔊 استمع للدرس
        </ReadButton>
        <SpeechSettings />
      </div>

      <Blocks blocks={section.blocks} active={activeTag} />

      <div className="check-zone">
        <div className="check-head">🧠 اختبر فهمك قبل أن تكمل</div>
        {section.checks.map((c) => (
          <QuestionView
            key={c.id}
            q={c}
            selected={answers[c.id] ?? null}
            reveal={answers[c.id] != null}
            locked={answers[c.id] != null}
            onSelect={(orig) => pick(c, orig)}
            showRef={false}
          />
        ))}
      </div>

      <footer className="lesson-foot">
        <button className="btn small ghost" onClick={() => markSection(key, !done)}>
          {done ? 'إلغاء علامة الإكمال' : 'علّم الدرس كمكتمل ✓'}
        </button>
      </footer>
    </section>
  );
}

export default function TopicPage({ topic, focus }) {
  const { data, wrongIds, track } = useProgress();
  const doneCount = topic.sections.filter((s) => data.sections[sectionKey(topic.id, s.id)]).length;
  const topicWrong = wrongIds.filter((id) => id.startsWith(`${topic.id}.`)).length;
  // التنقل بين الأجزاء داخل المسار الحالي، وإن فتحت جزءاً من مسار آخر فداخل مساره
  const order = [...track.topics, ...track.core];
  const list = order.includes(topic.id) ? order : TRACK_BY_ID[topic.track].topics;
  const idx = list.indexOf(topic.id);
  const prev = TOPIC_BY_ID[list[idx - 1]];
  const next = TOPIC_BY_ID[list[idx + 1]];
  const ownerTrack = order.includes(topic.id) ? track.id : topic.track;
  const label = (t) => (t.track === ownerTrack ? `الجزء ${t.no}` : 'أساسيات مشتركة');

  useEffect(() => {
    if (!focus) return;
    const t = setTimeout(() => document.getElementById(`sec-${focus}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    return () => clearTimeout(t);
  }, [focus, topic.id]);

  const jump = (id) => document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="topic-page" style={{ '--topic': topic.color }}>
      <header className="topic-hero">
        <Breadcrumbs items={[['الرئيسية', ''], [topic.title]]} />
        <div className="topic-hero-row">
          <div className="topic-emoji" aria-hidden="true">
            {topic.emoji}
          </div>
          <div>
            <div className="eyebrow">{label(topic)}</div>
            <h1>{topic.title}</h1>
            <p>{topic.summary}</p>
          </div>
        </div>
        <div className="topic-meter">
          <div className="progress">
            <div style={{ width: `${(doneCount / topic.sections.length) * 100}%` }} />
          </div>
          <span>
            {doneCount} من {topic.sections.length} دروس
          </span>
        </div>
      </header>

      <div className="topic-layout">
        <aside className="toc" aria-label="فهرس الدروس">
          <b>دروس هذا الجزء</b>
          <ol>
            {topic.sections.map((s, i) => {
              const done = data.sections[sectionKey(topic.id, s.id)];
              return (
                <li key={s.id}>
                  <button onClick={() => jump(s.id)} className={done ? 'done' : ''}>
                    <span className="toc-no">{done ? '✓' : i + 1}</span>
                    {s.title}
                  </button>
                </li>
              );
            })}
            <li>
              <button onClick={() => document.getElementById('practice')?.scrollIntoView({ behavior: 'smooth' })}>
                <span className="toc-no">★</span>
                التدريب
              </button>
            </li>
          </ol>
        </aside>

        <div className="lessons">
          {topic.sections.map((s, i) => (
            <Section key={`${topic.id}.${s.id}`} topic={topic} section={s} index={i} />
          ))}

          <section id="practice" className="card cta">
            <h2>جاهز للتدريب؟</h2>
            <p>
              {topic.all.length} سؤالاً من هذا الجزء، وبعد كل إجابة تظهر لك الإجابة الصحيحة مع الشرح والرابط للدرس المناسب.
            </p>
            <div className="actions">
              <Link className="btn primary big" to={`topic/${topic.id}/practice`}>
                ابدأ تدريب هذا الجزء
              </Link>
              <Link className="btn" to={`questions/${topic.id}`}>
                📄 كل الأسئلة مع الإجابات
              </Link>
              {topicWrong > 0 && (
                <Link className="btn" to="review">
                  🧩 لديك {topicWrong} سؤالاً للمراجعة
                </Link>
              )}
            </div>
          </section>

          <nav className="pager">
            {prev ? (
              <Link to={`topic/${prev.id}`}>
                → {label(prev)}: {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link to={`topic/${next.id}`}>
                {label(next)}: {next.title} ←
              </Link>
            ) : (
              <Link to="exam">جرّب الاختبار الشامل ←</Link>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
