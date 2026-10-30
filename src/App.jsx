import { useEffect } from 'react';
import { useRoute, Link } from './router';
import { stopSpeaking } from './speech';
import { useProgress } from './store';
import { TOPIC_BY_ID, TRACKS, QUESTION_BY_ID, trackQuestions } from './data';
import { shuffle } from './utils';
import { SITE } from './site.config';
import { SITE_ORIGIN } from './siteOrigin';
import { metaFor } from './seo';
import { applyMeta } from './head';
import Home from './components/Home';
import TopicPage from './components/TopicPage';
import QuizSession from './components/Quiz';
import Exam from './components/Exam';
import SignsLibrary from './components/SignsLibrary';
import SourcesPage from './components/SourcesPage';
import QuestionBank from './components/QuestionBank';
import { AboutPage, PrivacyPage } from './components/StaticPages';
import { InstallButton, ShareBar } from './components/Growth';
import { buildDiagnostic } from './learning';

function Header({ active }) {
  const { wrongIds, track } = useProgress();
  const items = [
    ['', 'الرئيسية', ''],
    ['signs', 'الشواخص', 'signs'],
    ['mixed', 'تدريب مختلط', 'mixed'],
    ['review', 'مراجعة الأخطاء', 'review'],
  ];
  return (
    <header className="site-header">
      <div className="wrap header-row">
        <Link to="" className="brand" aria-label="الصفحة الرئيسية">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 100 100" width="26" height="26">
              <path d="M50 14 88 82H12Z" fill="#fff" stroke="#f4b400" strokeWidth="9" strokeLinejoin="round" />
            </svg>
          </span>
          <span>{SITE.shortName}</span>
        </Link>
        <Link to="" className="track-chip" title="تغيير الفئة">
          {track.emoji} {track.short}
        </Link>
        <nav className="nav" aria-label="التنقل الرئيسي">
          {items.map(([to, label, key]) => (
            <Link key={label} to={to} className={active === key ? 'on' : ''}>
              {label}
              {key === 'review' && wrongIds.length > 0 && <span className="count">{wrongIds.length}</span>}
            </Link>
          ))}
          <Link to="exam" className={`nav-cta ${active === 'exam' ? 'on' : ''}`}>
            الاختبار التجريبي
          </Link>
        </nav>
      </div>
    </header>
  );
}

function NotFound() {
  return (
    <div className="card empty">
      <div className="empty-icon">🧭</div>
      <h1>هذه الصفحة غير موجودة</h1>
      <Link className="btn primary" to="">
        العودة للرئيسية
      </Link>
    </div>
  );
}

// صفحة الفئة: تضبط الفئة المختارة ثم تعرض الرئيسية بمحتواها
function TrackRoute({ id }) {
  const { track, setTrack } = useProgress();
  useEffect(() => {
    if (track.id !== id) setTrack(id);
  }, [id, track.id, setTrack]);
  return <Home />;
}

function Page({ parts, query }) {
  const { wrongIds, dueIds, track } = useProgress();
  const [a, b, c] = parts;

  if (!a) return <Home />;

  if (a === 'track') return TRACKS.some((t) => t.id === b) ? <TrackRoute id={b} /> : <NotFound />;

  if (a === 'topic') {
    const topic = TOPIC_BY_ID[b];
    if (!topic) return <NotFound />;
    if (c === 'practice') {
      return (
        <QuizSession
          key={`practice-${topic.id}`}
          title={`تدريب: ${topic.title}`}
          makeQuestions={() => shuffle(topic.all)}
          backTo={`topic/${topic.id}`}
          backLabel="العودة للدرس"
          bestKey={`topic.${topic.id}`}
        />
      );
    }
    return <TopicPage key={topic.id} topic={topic} focus={query.s} />;
  }

  if (a === 'questions') {
    const topic = TOPIC_BY_ID[b];
    return topic ? <QuestionBank key={topic.id} topic={topic} /> : <NotFound />;
  }

  if (a === 'review') {
    return (
      <QuizSession
        key={`review-${track.id}`}
        title="مراجعة الأسئلة التي أخطأت بها"
        makeQuestions={() => shuffle(wrongIds.map((id) => QUESTION_BY_ID[id]).filter(Boolean))}
        backTo=""
        backLabel="الرئيسية"
      />
    );
  }

  if (a === 'due') {
    return (
      <QuizSession
        key={`due-${track.id}`}
        title="مراجعة اليوم (التكرار المتباعد)"
        makeQuestions={() => shuffle(dueIds.map((id) => QUESTION_BY_ID[id]).filter(Boolean)).slice(0, 20)}
        backTo=""
        backLabel="الرئيسية"
      />
    );
  }

  if (a === 'diagnostic') {
    return (
      <QuizSession
        key={`diag-${track.id}`}
        title="الاختبار التشخيصي"
        makeQuestions={() => buildDiagnostic(track)}
        backTo=""
        backLabel="الرئيسية"
      />
    );
  }

  if (a === 'mixed') {
    return (
      <QuizSession
        key={`mixed-${track.id}`}
        title="تدريب مختلط"
        makeQuestions={() => shuffle(trackQuestions(track)).slice(0, 20)}
        backTo=""
        backLabel="الرئيسية"
      />
    );
  }

  if (parts.length === 1) {
    if (a === 'exam') return <Exam />;
    if (a === 'signs') return <SignsLibrary />;
    if (a === 'sources') return <SourcesPage />;
    if (a === 'about') return <AboutPage />;
    if (a === 'privacy') return <PrivacyPage />;
  }
  return <NotFound />;
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-about">
            <b>{SITE.name}</b>
            <p>
              موقع تعليمي مجاني للاستعداد لفحص السواقة النظري في الأردن. تقدّمك محفوظ على جهازك فقط. المحتوى للدراسة والفهم، وتأكّد دائماً من الأنظمة
              الرسمية المعتمدة.
            </p>
            <InstallButton />
          </div>
          <nav aria-label="روابط الموقع" className="footer-links">
            <b>الموقع</b>
            <ul>
              <li>
                <Link to="exam">الاختبار التجريبي</Link>
              </li>
              <li>
                <Link to="signs">قاموس الشواخص</Link>
              </li>
              <li>
                <Link to="sources">المصادر والتوثيق</Link>
              </li>
              <li>
                <Link to="about">عن الموقع</Link>
              </li>
              <li>
                <Link to="privacy">الخصوصية وإخلاء المسؤولية</Link>
              </li>
            </ul>
          </nav>
          {TRACKS.map((t) => (
            <nav key={t.id} aria-label={`دروس ${t.title}`} className="footer-links">
              <b>
                {t.emoji} <Link to={t.id === 'car' ? '' : `track/${t.id}`}>{t.title}</Link>
              </b>
              <ul>
                {t.topics.map((id) => (
                  <li key={id}>
                    <Link to={`questions/${id}`}>أسئلة {TOPIC_BY_ID[id].title}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <ShareBar />
        <p className="copyright">
          © {new Date().getFullYear()} {SITE.name}. جميع الحقوق محفوظة للمحتوى الأصلي.
        </p>
      </div>
    </footer>
  );
}

export default function App() {
  const { parts, query } = useRoute();
  const active = parts[0] ?? '';
  const key = parts.join('/');

  // لا تستمر القراءة بعد الانتقال إلى صفحة أخرى
  useEffect(() => stopSpeaking, [key]);

  // تحديث العنوان والوصف والبيانات المنظمة عند التنقل داخل التطبيق
  useEffect(() => {
    applyMeta(metaFor(parts, SITE_ORIGIN));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <>
      <a className="skip-link" href="#main">
        انتقل إلى المحتوى
      </a>
      <Header active={active} />
      <main id="main" className="wrap main">
        <Page parts={parts} query={query} />
      </main>
      <SiteFooter />
    </>
  );
}
