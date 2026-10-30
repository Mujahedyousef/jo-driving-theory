import { Figure } from './QuestionView';
import { Breadcrumbs, ShareBar } from './Growth';
import { Link } from '../router';

const LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ'];

/** كل أسئلة جزء واحد مع الإجابات والشرح كصفحة ثابتة قابلة للفهرسة والطباعة */
export default function QuestionBank({ topic }) {
  const sectionTitle = (ref) => topic.sections.find((s) => s.id === ref)?.title;
  return (
    <div className="qbank">
      <Breadcrumbs items={[['الرئيسية', ''], [topic.title, `topic/${topic.id}`], ['الأسئلة والأجوبة']]} />

      <header className="qb-head">
        <h1>أسئلة {topic.title} مع الإجابات والشرح</h1>
        <p className="lead">
          {topic.all.length} سؤالاً من مواضيع فحص السواقة النظري في الأردن. الإجابة الصحيحة موضّحة تحت كل سؤال مع شرح مبسّط، وكثير منها مع رقم المادة
          القانونية. لتتدرّب بطريقة تفاعلية يظهر فيها الشرح بعد إجابتك، اضغط «ابدأ التدريب».
        </p>
        <div className="actions no-print">
          <Link className="btn primary" to={`topic/${topic.id}/practice`}>
            ابدأ التدريب التفاعلي
          </Link>
          <Link className="btn" to={`topic/${topic.id}`}>
            📖 اقرأ الدرس أولاً
          </Link>
          <button type="button" className="btn" onClick={() => window.print()}>
            🖨️ طباعة / حفظ PDF
          </button>
        </div>
      </header>

      <ol className="qb-list">
        {topic.all.map((q, i) => (
          <li key={q.id} className="qb-item card" id={`q${i + 1}`}>
            <Figure q={q} />
            <h2 className="qb-q">
              <span className="qb-no">{i + 1}</span>
              {q.q}
            </h2>
            <ul className="qb-opts">
              {q.options.map((o, k) => (
                <li key={o} className={k === q.answer ? 'right' : ''}>
                  {q.type === 'tf' ? '' : `${LETTERS[k]}. `}
                  {o}
                  {k === q.answer && <b className="qb-ok"> ✔ الإجابة الصحيحة</b>}
                </li>
              ))}
            </ul>
            <p className="qb-why">
              <b>الشرح: </b>
              {q.why}
            </p>
            {q.source && (
              <p className="fb-source">
                <span aria-hidden="true">📚</span> المصدر: {q.source}
              </p>
            )}
            {q.ref && sectionTitle(q.ref) && (
              <Link className="fb-link no-print" to={`topic/${topic.id}?s=${q.ref}`}>
                📖 راجع الدرس: {sectionTitle(q.ref)}
              </Link>
            )}
          </li>
        ))}
      </ol>

      <div className="no-print">
        <ShareBar path={`/questions/${topic.id}/`} text={`أسئلة ${topic.title} مع الإجابات والشرح لفحص السواقة النظري في الأردن`} />
      </div>
    </div>
  );
}
