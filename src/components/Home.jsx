import { EXAM, TRACKS, sectionKey, trackQuestions, trackSectionKeys, trackTopics, TOPIC_BY_ID } from '../data';
import { useProgress } from '../store';
import { Link } from '../router';
import { pct } from '../utils';
import { faqItems } from '../faq';
import { levelLabel, readiness } from '../learning';
import { ScoreRing } from './Quiz';
import { useRef, useState } from 'react';

function nextStop(data, track) {
  for (const t of trackTopics(track)) {
    const s = t.sections.find((x) => !data.sections[sectionKey(t.id, x.id)]);
    if (s) return { topic: t, section: s, fresh: Object.keys(data.sections).length === 0 };
  }
  return null;
}

function TopicCard({ t, data, badge }) {
  const done = t.sections.filter((s) => data.sections[sectionKey(t.id, s.id)]).length;
  const b = data.best[`topic.${t.id}`];
  return (
    <Link to={`topic/${t.id}`} className="topic-card" style={{ '--topic': t.color }}>
      <div className="tc-top">
        <span className="tc-emoji" aria-hidden="true">
          {t.emoji}
        </span>
        <span className="tc-no">{badge}</span>
      </div>
      <h3>{t.title}</h3>
      <p>{t.summary}</p>
      <div className="progress small">
        <div style={{ width: `${(done / t.sections.length) * 100}%` }} />
      </div>
      <div className="tc-meta">
        <span>
          {done}/{t.sections.length} دروس • {t.all.length} سؤالاً
        </span>
        {b && <span className="tc-best">أفضل تدريب {pct(b.score, b.total)}%</span>}
      </div>
    </Link>
  );
}

function Readiness({ track, data, dueCount }) {
  const r = readiness(track, data);
  const tone = r.level === 'ready' ? 'good' : r.level === 'low' || r.level === 'start' ? 'low' : 'mid';
  const weak = r.weakest.filter((w) => w.mastery < 0.85);
  const fresh = r.coverage === 0;
  return (
    <section className="card readiness" aria-label="مؤشر الجاهزية">
      <ScoreRing value={r.score} label="جاهزيتك" tone={tone} />
      <div className="rd-body">
        <h2>
          {levelLabel(r.level)}
          {r.level === 'ready' && ' 🎉'}
        </h2>
        <p className="muted rd-note">
          {fresh
            ? 'ابدأ بالاختبار التشخيصي ليعرف الموقع مستواك ويرتّب لك البداية.'
            : 'يجمع المؤشر إتقانك الفعلي للأسئلة (وليس مجرد الإجابة) مع نتائج آخر اختباراتك الشاملة.'}
        </p>
        <ul className="checklist">
          {r.checklist.map((c) => (
            <li key={c.text} className={c.ok ? 'ok' : ''}>
              <span aria-hidden="true">{c.ok ? '✅' : '⬜'}</span> {c.text}
            </li>
          ))}
        </ul>
        {!fresh && weak.length > 0 && (
          <div className="rd-weak">
            <b>ركّز على:</b>
            {weak.map((w) => (
              <Link key={w.topic.id} to={`topic/${w.topic.id}`} className="chip-link" style={{ '--topic': w.topic.color }}>
                {w.topic.emoji} {w.topic.title} <small>{Math.round(w.mastery * 100)}%</small>
              </Link>
            ))}
          </div>
        )}
        <div className="actions">
          {dueCount > 0 && (
            <Link className="btn primary" to="due">
              🧠 مراجعة اليوم ({dueCount})
            </Link>
          )}
          <Link className={`btn ${dueCount > 0 ? '' : 'primary'}`} to="diagnostic">
            🎯 اختبار تشخيصي
          </Link>
        </div>
      </div>
    </section>
  );
}

function DataTools() {
  const { exportData, importData, reset } = useProgress();
  const fileRef = useRef(null);
  const [msg, setMsg] = useState('');

  const download = () => {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taqadomi-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg('تم تنزيل النسخة الاحتياطية.');
  };

  const upload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setMsg(importData(String(reader.result)) ? 'تمت استعادة تقدّمك بنجاح.' : 'الملف غير صالح.');
    reader.readAsText(file);
    e.target.value = '';
  };

  const wipe = () => {
    if (window.confirm('سيُحذف كل تقدّمك على هذا الجهاز نهائياً. هل أنت متأكد؟')) {
      reset();
      setMsg('تم مسح التقدّم.');
    }
  };

  return (
    <details className="card data-tools">
      <summary>💾 نسخة احتياطية لتقدّمك (للانتقال بين الأجهزة)</summary>
      <p className="muted">تقدّمك محفوظ في هذا المتصفح فقط. نزّل نسخة لتنقلها إلى جهاز آخر أو لتحتفظ بها.</p>
      <div className="actions">
        <button className="btn" onClick={download}>
          ⬇️ تنزيل نسخة
        </button>
        <button className="btn" onClick={() => fileRef.current?.click()}>
          ⬆️ استعادة من ملف
        </button>
        <button className="btn danger small" onClick={wipe}>
          مسح التقدّم
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={upload} />
      </div>
      {msg && (
        <p className="data-msg" role="status">
          {msg}
        </p>
      )}
    </details>
  );
}

export default function Home() {
  const { data, track, wrongIds, dueIds, totals, setTrack } = useProgress();
  const keys = trackSectionKeys(track);
  const doneSections = keys.filter((k) => data.sections[k]).length;
  const stop = nextStop(data, track);
  const attempts = totals.c + totals.w;
  const best = data.best[`exam.${track.id}`];
  const questionCount = trackQuestions(track).length;

  return (
    <div className="home">
      <nav className="track-picker" aria-label="اختر فئة الرخصة">
        {TRACKS.map((t) => (
          <Link
            key={t.id}
            to={t.id === 'car' ? '' : `track/${t.id}`}
            aria-current={track.id === t.id ? 'page' : undefined}
            className={`track-btn ${track.id === t.id ? 'on' : ''}`}
            onClick={() => setTrack(t.id)}
          >
            <span className="track-emoji" aria-hidden="true">
              {t.emoji}
            </span>
            <span>
              <b>{t.title}</b>
              <small>{t.blurb}</small>
            </span>
          </Link>
        ))}
      </nav>

      <section className="hero">
        <div className="hero-text">
          <span className="pill">
            {track.emoji} الفحص النظري • {track.title}
          </span>
          <h1>{track.hero.title}</h1>
          <p>
            {track.hero.text} ({EXAM.count} سؤالاً في {EXAM.minutes} دقيقة)
          </p>
          <div className="actions">
            {stop ? (
              <Link className="btn primary big" to={`topic/${stop.topic.id}?s=${stop.section.id}`}>
                {stop.fresh ? 'ابدأ من الدرس الأول' : 'تابع من حيث توقفت'} ←
              </Link>
            ) : (
              <Link className="btn primary big" to="exam">
                أنهيت كل الدروس! جرّب الاختبار الشامل ←
              </Link>
            )}
            <Link className="btn big" to="exam">
              📝 الاختبار التجريبي
            </Link>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="road">
            <div className="car">{track.id === 'heavy' ? '🚛' : track.id === 'moto' ? '🏍️' : '🚙'}</div>
          </div>
          <div className="hero-signs">🛑 ⚠️ 🅿️ 🚸</div>
        </div>
      </section>

      <Readiness track={track} data={data} dueCount={dueIds.length} />

      <section className="stats" aria-label="تقدّمك">
        <div className="stat">
          <b>
            {doneSections}
            <small> / {keys.length}</small>
          </b>
          <span>دروس مكتملة</span>
        </div>
        <div className="stat">
          <b>{attempts ? `${pct(totals.c, attempts)}%` : '—'}</b>
          <span>نسبة إجاباتك الصحيحة</span>
        </div>
        <div className="stat">
          <b>{best ? `${best.score}/${best.total}` : '—'}</b>
          <span>أفضل نتيجة اختبار</span>
        </div>
        <Link className="stat link" to="review">
          <b>{wrongIds.length}</b>
          <span>سؤال يحتاج مراجعة</span>
        </Link>
      </section>

      <section className="how">
        <h2>كيف تدرس بأفضل طريقة؟</h2>
        <div className="how-grid">
          <div className="how-card">
            <span className="how-no">١</span>
            <b>اقرأ الدرس</b>
            <p>شرح قصير بالرسوم، ومعه «لماذا؟» توضح السبب فتفهم بدل أن تحفظ.</p>
          </div>
          <div className="how-card">
            <span className="how-no">٢</span>
            <b>اختبر فهمك</b>
            <p>سؤالان بعد كل درس مع تفسير فوري لكل إجابة، حتى لو أخطأت.</p>
          </div>
          <div className="how-card">
            <span className="how-no">٣</span>
            <b>تدرّب وراجع أخطاءك</b>
            <p>أسئلة التدريب تجمع ما أخطأت فيه لتعيدها حتى تثبّت المعلومة.</p>
          </div>
          <div className="how-card">
            <span className="how-no">٤</span>
            <b>جرّب الامتحان</b>
            <p>اختبار شامل بنفس الشروط. إن نجحت مرتين متتاليتين فأنت جاهز.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="section-title">أجزاء المنهج</h2>
        <div className="topic-grid">
          {track.topics.map((id) => (
            <TopicCard key={id} t={TOPIC_BY_ID[id]} data={data} badge={`الجزء ${TOPIC_BY_ID[id].no}`} />
          ))}
        </div>
      </section>

      {track.core.length > 0 && (
        <section>
          <h2 className="section-title">أساسيات مشتركة لكل الفئات</h2>
          <p className="muted">هذه الأجزاء تدخل أيضاً في الاختبار الشامل لهذه الفئة، فراجعها قبل الامتحان.</p>
          <div className="topic-grid">
            {track.core.map((id) => (
              <TopicCard key={id} t={TOPIC_BY_ID[id]} data={data} badge="مشترك" />
            ))}
          </div>
        </section>
      )}

      <section className="extras">
        <Link to="signs" className="extra-card">
          <span className="extra-ico">🗂️</span>
          <div>
            <b>قاموس الشواخص والعلامات</b>
            <p>كل الشواخص في مكان واحد، مع وضع «اختبر نفسك» يخفي الأسماء.</p>
          </div>
        </Link>
        <Link to="mixed" className="extra-card">
          <span className="extra-ico">🎲</span>
          <div>
            <b>تدريب مختلط (20 سؤالاً)</b>
            <p>أسئلة عشوائية من كل أجزاء هذه الفئة لتختبر نفسك بلا ترتيب.</p>
          </div>
        </Link>
        <Link to="review" className="extra-card">
          <span className="extra-ico">🧩</span>
          <div>
            <b>مراجعة الأخطاء</b>
            <p>الأسئلة التي أخطأت بها آخر مرة فقط، لتركّز جهدك حيث تحتاج.</p>
          </div>
        </Link>
      </section>

      <section className="faq" aria-labelledby="faq-title">
        <h2 id="faq-title">أسئلة شائعة</h2>
        {faqItems().map((f) => (
          <details key={f.q} className="faq-item">
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </section>

      <DataTools />

      <p className="fine">
        أسئلة هذه الفئة: {questionCount} سؤالاً مع شرح. المحتوى للدراسة والفهم وهو غير مرتبط بأي جهة رسمية؛ ولا يغني عن دليل دائرة ترخيص السواقين والمركبات والأنظمة المعمول بها.
      </p>
    </div>
  );
}
