import { SITE } from './site.config';
import { ALL_QUESTIONS, EXAM, TOPIC_BY_ID, TOPICS, TRACK_BY_ID, trackQuestions } from './data';
import { faqItems } from './faq';

const YEAR = new Date().getFullYear();

const clip = (s, n = 158) => {
  const t = String(s).replace(/\s+/g, ' ').trim();
  return t.length <= n ? t : `${t.slice(0, n - 1).replace(/\s+\S*$/, '')}…`;
};

export const pathOf = (parts) => `/${parts.join('/')}${parts.length ? '/' : ''}`;

const CTX = 'https://schema.org';

function breadcrumb(items, url) {
  return {
    '@context': CTX,
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${url}${path}` })),
  };
}

const websiteLd = (url) => ({
  '@context': CTX,
  '@type': 'WebSite',
  name: SITE.name,
  url: `${url}/`,
  inLanguage: 'ar',
  description: 'دروس مبسّطة وأسئلة مع الشرح واختبار تجريبي للتحضير لفحص السواقة النظري في الأردن.',
});

const TRACK_SEO = {
  car: {
    title: `فحص السواقة النظري الأردني ${YEAR}: الفئتان الثالثة والرابعة (السيارات)`,
    desc: (n) =>
      `تحضّر لفحص السواقة النظري للسيارات في الأردن: دروس مبسّطة بالرسوم، ${n} سؤالاً مع الشرح والمصدر، واختبار تجريبي ${EXAM.count} سؤالاً. مجاني بلا تسجيل.`,
  },
  heavy: {
    title: `فحص السواقة النظري للفئتين الخامسة والسادسة (شاحنات وحافلات) – الأردن ${YEAR}`,
    desc: (n) =>
      `دروس وأسئلة للفئتين الخامسة والسادسة في الأردن: الفرامل الهوائية، القاطرة والمقطورة، الحمولة والمواد الخطرة، وقانون السير للمركبات الثقيلة. ${n} سؤالاً مع الشرح واختبار تجريبي.`,
  },
  moto: {
    title: `فحص السواقة النظري للدراجة النارية (الفئة الأولى) في الأردن ${YEAR}`,
    desc: (n) =>
      `تحضّر لفحص الدراجة النارية والسكوتر في الأردن: الخوذة والمعدات، الفرملة والمنعطفات، القيادة بين السيارات، وأحكام القانون. ${n} سؤالاً مع الشرح واختبار تجريبي.`,
  },
};

const HOME = {
  title: `فحص السواقة النظري الأردني ${YEAR}: دروس مبسّطة وأسئلة مع الشرح واختبار تجريبي`,
  desc: `الموقع المجاني الأفضل للتحضير لفحص السواقة النظري في الأردن: دروس مبسّطة بالرسوم، ${ALL_QUESTIONS.length} سؤالاً مع الشرح ومواد القانون، واختبار تجريبي ${EXAM.count} سؤالاً للسيارات والشاحنات والدراجات.`,
};

/**
 * بيانات SEO لصفحة حسب مسارها.
 * @param {string[]} parts أجزاء المسار
 * @param {string} url عنوان الموقع الكامل بدون / في النهاية (مع مسار الأساس إن وُجد)
 */
export function metaFor(parts, url = SITE.url) {
  const [a, b, c] = parts;
  const path = pathOf(parts);
  const m = { title: '', description: '', path, canonicalPath: path, noindex: false, ogType: 'website', jsonLd: [], status: 200 };

  if (!a) {
    return {
      ...m,
      title: HOME.title,
      description: HOME.desc,
      jsonLd: [
        websiteLd(url),
        {
          '@context': CTX,
          '@type': 'FAQPage',
          mainEntity: faqItems().map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        },
      ],
    };
  }

  if (a === 'track' && TRACK_BY_ID[b]) {
    const t = TRACK_BY_ID[b];
    const seo = TRACK_SEO[b];
    const n = trackQuestions(t).length;
    return {
      ...m,
      title: seo.title,
      description: clip(seo.desc(n)),
      canonicalPath: b === 'car' ? '/' : path,
      jsonLd: [breadcrumb([['الرئيسية', '/'], [t.title, path]], url)],
    };
  }

  if (a === 'topic' && TOPIC_BY_ID[b]) {
    const t = TOPIC_BY_ID[b];
    if (c === 'practice') {
      return {
        ...m,
        title: `تدريب تفاعلي: ${t.title}`,
        description: clip(`تدرّب على أسئلة ${t.title} مع شرح فوري بعد كل إجابة.`),
        noindex: true,
        canonicalPath: `/topic/${t.id}/`,
      };
    }
    const description = clip(`${t.summary} ${t.sections.length} دروس و${t.all.length} سؤالاً مع الشرح.`);
    return {
      ...m,
      title: `${t.title}: شرح وأسئلة للفحص النظري`,
      description,
      ogType: 'article',
      jsonLd: [
        {
          '@context': CTX,
          '@type': 'LearningResource',
          name: t.title,
          description: t.summary,
          url: `${url}${path}`,
          inLanguage: 'ar',
          isAccessibleForFree: true,
          learningResourceType: 'درس',
          educationalLevel: 'مبتدئ',
          teaches: t.sections.map((s) => s.title),
        },
        breadcrumb([['الرئيسية', '/'], [t.title, path]], url),
      ],
    };
  }

  if (a === 'questions' && TOPIC_BY_ID[b]) {
    const t = TOPIC_BY_ID[b];
    return {
      ...m,
      title: `أسئلة ${t.title} مع الإجابات والشرح`,
      description: clip(`${t.all.length} سؤالاً من مواضيع فحص السواقة النظري في الأردن (${t.title}) مع الإجابة الصحيحة وشرح مبسّط ومصدر لكل سؤال.`),
      jsonLd: [
        {
          '@context': CTX,
          '@type': 'Quiz',
          name: `أسئلة ${t.title}`,
          inLanguage: 'ar',
          educationalLevel: 'مبتدئ',
          about: { '@type': 'Thing', name: t.title },
          hasPart: t.all.slice(0, 40).map((q) => ({
            '@type': 'Question',
            eduQuestionType: 'Multiple choice',
            text: q.q,
            suggestedAnswer: q.options.filter((_, i) => i !== q.answer).map((text) => ({ '@type': 'Answer', text })),
            acceptedAnswer: { '@type': 'Answer', text: q.options[q.answer], answerExplanation: { '@type': 'Comment', text: q.why } },
          })),
        },
        breadcrumb([['الرئيسية', '/'], [t.title, `/topic/${t.id}/`], ['الأسئلة والأجوبة', path]], url),
      ],
    };
  }

  const simple = {
    exam: {
      title: `الاختبار التجريبي الشامل لفحص السواقة النظري (${EXAM.count} سؤالاً)`,
      description: `جرّب اختباراً يحاكي امتحان السواقة النظري: ${EXAM.count} سؤالاً في ${EXAM.minutes} دقيقة والنجاح بـ ${EXAM.pass}، مع نتيجة مفصّلة وشرح كل خطأ.`,
    },
    signs: {
      title: 'قاموس شواخص المرور والإشارات والعلامات الأرضية',
      description: 'كل شواخص المنع والإلزام والتحذير والأفضلية والإشارات الضوئية والعلامات الأرضية مرسومة بوضوح مع معانيها، ووضع «اختبر نفسك» يخفي الأسماء.',
    },
    sources: {
      title: 'المصادر والتوثيق: قانون السير ونظام قواعد السير',
      description: 'النصوص التشريعية الأردنية التي بُنيت عليها دروس الموقع وأسئلته مع روابطها: قانون السير ونظام قواعد السير والمرور ونظام ترخيص السواقين.',
    },
    about: {
      title: 'عن الموقع: من نحن وكيف أُعدّ المحتوى',
      description: 'تعرّف على الموقع المجاني لتعلّم فحص السواقة النظري في الأردن، وكيف كُتبت الدروس والأسئلة وما حدودها.',
    },
    privacy: {
      title: 'سياسة الخصوصية وإخلاء المسؤولية',
      description: 'لا حسابات ولا بيانات شخصية: تقدّمك يُحفظ على جهازك فقط. اقرأ كيف يتعامل الموقع مع الخصوصية وما حدود مسؤوليته.',
    },
  };
  if (simple[a] && parts.length === 1) {
    const jsonLd = a === 'about' || a === 'privacy' || a === 'sources' ? [breadcrumb([['الرئيسية', '/'], [simple[a].title, path]], url)] : [];
    return { ...m, ...simple[a], jsonLd };
  }

  if (['review', 'mixed', 'due', 'diagnostic'].includes(a) && parts.length === 1) {
    const names = { review: 'مراجعة الأخطاء', mixed: 'تدريب مختلط', due: 'مراجعة اليوم', diagnostic: 'الاختبار التشخيصي' };
    return { ...m, title: names[a], description: `${names[a]} على أسئلة فحص السواقة النظري.`, noindex: true, canonicalPath: '/' };
  }

  return { ...m, title: 'الصفحة غير موجودة', description: 'هذه الصفحة غير موجودة.', noindex: true, status: 404 };
}

/** كل مسارات الموقع: ssr = تُرسم محتوى كاملاً، shell = غلاف فارغ (صفحات تفاعلية) */
export function allRoutes() {
  return {
    ssr: [
      [],
      ['track', 'car'],
      ['track', 'heavy'],
      ['track', 'moto'],
      ...TOPICS.map((t) => ['topic', t.id]),
      ...TOPICS.map((t) => ['questions', t.id]),
      ['exam'],
      ['signs'],
      ['sources'],
      ['about'],
      ['privacy'],
    ],
    shell: [...TOPICS.map((t) => ['topic', t.id, 'practice']), ['review'], ['mixed'], ['due'], ['diagnostic']],
  };
}

/** الفئة التي تُرسم بها الصفحة عند البناء (لتظهر تسميات الأجزاء بشكل صحيح) */
export function trackForRoute(parts) {
  const [a, b] = parts;
  if (a === 'track' && TRACK_BY_ID[b]) return b;
  if ((a === 'topic' || a === 'questions') && TOPIC_BY_ID[b]) return TOPIC_BY_ID[b].track;
  return 'car';
}

/** عنوان الصفحة في <title>: نضيف اسم الموقع إن بقي العنوان معقول الطول */
export function fullTitle(m) {
  return m.title.length + SITE.name.length + 3 <= 68 ? `${m.title} | ${SITE.name}` : m.title;
}
