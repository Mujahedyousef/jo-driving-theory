import { ALL_QUESTIONS, TOPICS } from '../data';
import { SOURCES, SOURCES_CHECKED } from '../data/sources';
import { Link } from '../router';
import { pct } from '../utils';

export default function SourcesPage() {
  const sourced = ALL_QUESTIONS.filter((q) => q.source).length;
  const byTopic = TOPICS.map((t) => ({ t, n: t.all.filter((q) => q.source).length }));

  return (
    <div className="library">
      <div className="lib-head">
        <Link className="back" to="">
          ← الرئيسية
        </Link>
        <h1>📚 المصادر والتوثيق</h1>
        <p>
          الأسئلة والشروح الجديدة مبنية على نصوص التشريعات الأردنية المنشورة، وبجانب كل إجابة رقم المادة. الكتاب الرسمي للفحص النظري غير منشور
          كملف متاح، لذلك اعتمدنا على الأنظمة التي يقوم عليها.
        </p>
      </div>

      <div className="card">
        <h2>النصوص المعتمدة</h2>
        <ul className="source-list">
          {SOURCES.map((s) => (
            <li key={s.id}>
              <b>{s.title}</b>
              <p>{s.note}</p>
              <div className="source-links">
                {s.links.map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noreferrer noopener">
                    🔗 {l.label}
                  </a>
                ))}
              </div>
            </li>
          ))}
        </ul>
        <p className="muted">آخر مطابقة للنصوص: {SOURCES_CHECKED}. الغرامات والأرقام المنشورة حتى تعديل 2023، وقد يصدر بعدها تعديل.</p>
      </div>

      <div className="card">
        <h2>نسبة الأسئلة الموثّقة</h2>
        <p>
          {sourced} من {ALL_QUESTIONS.length} سؤالاً ({pct(sourced, ALL_QUESTIONS.length)}%) تحمل مصدراً. باقي الأسئلة قواعد عامة مرافقة للدروس.
        </p>
        <ul className="topic-bars">
          {byTopic.map(({ t, n }) => (
            <li key={t.id}>
              <span className="tb-name">
                {t.emoji} {t.title}
              </span>
              <div className="tb-track">
                <div style={{ width: `${pct(n, t.all.length)}%`, background: 'var(--brand)' }} />
              </div>
              <span className="tb-val">
                {n}/{t.all.length}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2>هل وجدت خطأً أو نصاً حديثاً؟</h2>
        <p>
          عدّل ملف الجزء في <code>src/data/topics</code> وأضف حقل <code>source</code> للسؤال، ثم شغّل <code>npm run check</code> للتأكد من سلامة
          البيانات.
        </p>
      </div>
    </div>
  );
}
