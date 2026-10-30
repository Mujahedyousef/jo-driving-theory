import { useMemo, useState } from 'react';
import { shuffle } from '../utils';

/* ---------------------------------------------------------------
   سيارة من الداخل: اضغط على أي رقم لتعرف الجزء بكلام بسيط
---------------------------------------------------------------- */
const PARTS = [
  {
    id: 'engine',
    emoji: '⚙️',
    name: 'المحرك (الماتور)',
    short: 'المحرك',
    at: [330, 106],
    plain: 'الجهاز الذي يحرق الوقود ليصنع الحركة. هو أهم جزء في السيارة.',
    like: 'عضلات الجسم وقلبه: يأخذ الطعام (الوقود) ويحوّله إلى حركة.',
    broken: 'تتوقف السيارة أو تفقد قوتها، وقد يظهر دخان أو صوت غريب.',
  },
  {
    id: 'battery',
    emoji: '🔋',
    name: 'البطارية',
    short: 'البطارية',
    at: [356, 90],
    plain: 'مخزن كهرباء يشغّل المحرك أول مرة ويضيء الأنوار.',
    like: 'بطارية الهاتف.',
    broken: 'السيارة لا تشتغل أو تضعف الأنوار، وتظهر لمبة البطارية.',
  },
  {
    id: 'radiator',
    emoji: '🌡️',
    name: 'الرادياتير وماء التبريد',
    short: 'الرادياتير',
    at: [374, 120],
    plain: 'مبرّد يمرّ فيه الماء الساخن فيبرد بالهواء ثم يعود إلى المحرك.',
    like: 'العرق الذي يبرّد الجسم عندما يسخن.',
    broken: 'يسخن المحرك ويخرج بخار، وقد يتلف المحرك إن استمررت بالسير.',
  },
  {
    id: 'gearbox',
    emoji: '🕹️',
    name: 'ناقل الحركة (الجير)',
    short: 'الجير',
    at: [236, 112],
    plain: 'صندوق تروس يختار القوة أو السرعة المناسبة التي تصل إلى العجلات.',
    like: 'غيارات الدراجة الهوائية: غيار خفيف للصعود، وغيار سريع على الأرض المستوية.',
    broken: 'صعوبة أو صوت عند تبديل الغيار، أو لا تتحرك السيارة رغم دوران المحرك.',
  },
  {
    id: 'brakes',
    emoji: '🛑',
    name: 'الفرامل',
    short: 'الفرامل',
    at: [304, 136],
    plain: 'قطع تضغط على قرص يدور مع العجلة فتبطئها بالاحتكاك حتى تتوقف.',
    like: 'ضغط يدك على عجلة دراجة تدور فتتباطأ.',
    broken: 'الدواسة رخوة أو تغوص، أو صرير عند الفرملة. افحصها فوراً ولا تؤجل.',
  },
  {
    id: 'tires',
    emoji: '🛞',
    name: 'الإطارات',
    short: 'الإطارات',
    at: [96, 136],
    plain: 'الجزء الوحيد الذي يلمس الطريق ويحمل وزن السيارة كلها.',
    like: 'حذاء السيارة، والنقوش فيه مثل نعل الحذاء تمسك الأرض.',
    broken: 'انزلاق وطول مسافة التوقف، وقد ينفجر الإطار إذا كان ضغطه خاطئاً.',
  },
  {
    id: 'fuel',
    emoji: '⛽',
    name: 'خزان الوقود',
    short: 'الوقود',
    at: [56, 114],
    plain: 'يخزّن البنزين أو الديزل، وتسحبه مضخة إلى المحرك.',
    like: 'المعدة التي تخزّن الطعام.',
    broken: 'السيارة تتقطع أو لا تشتغل رغم سلامة البطارية.',
  },
  {
    id: 'exhaust',
    emoji: '💨',
    name: 'العادم وكاتم الصوت (الشكمان)',
    short: 'العادم',
    at: [176, 142],
    plain: 'أنبوب يُخرج دخان الاحتراق بعيداً، ويخفف الضجيج وينقّي الغازات.',
    like: 'الزفير: الهواء المستهلك يخرج للخارج.',
    broken: 'ضجيج عالٍ أو دخان كثيف أو رائحة. ولا تشغّل المحرك أبداً في مكان مغلق.',
  },
  {
    id: 'shocks',
    emoji: '🦵',
    name: 'المساعدات والنوابض (التعليق)',
    short: 'التعليق',
    at: [264, 128],
    plain: 'تمتص صدمات الطريق وتبقي العجلات ملتصقة بالأرض.',
    like: 'الركبتان عندما تقفز: تمتصان الصدمة فلا تتأذى.',
    broken: 'السيارة ترتد وتهتز بعد المطب، وتطول مسافة الفرملة.',
  },
];

const TRUCK_PARTS = [
  {
    id: 'engine',
    emoji: '⚙️',
    name: 'المحرك والمبطّئ',
    short: 'المحرك',
    at: [346, 92],
    plain: 'محرك ديزل قوي، ومعه «مبطّئ» يساعد على إبطاء المركبة دون استخدام الفرامل.',
    like: 'عضلات رياضي قوي، والمبطّئ مثل كابح خفيف يعمل بالمحرك نفسه.',
    broken: 'ضعف في القوة أو دخان أسود، وفي المنحدر يزيد الحمل على الفرامل.',
  },
  {
    id: 'air',
    emoji: '🌀',
    name: 'الضاغط وخزانات الهواء',
    short: 'الهواء',
    at: [272, 143],
    plain: 'الضاغط يملأ خزانات المركبة بهواء مضغوط يُستخدم لتشغيل الفرامل.',
    like: 'نفّاخ كهربائي يملأ بالونات كبيرة، تُفرَّغ عند الحاجة.',
    broken: 'يهبط الضغط فتضعف الفرامل ويرنّ الإنذار.',
  },
  {
    id: 'chambers',
    emoji: '🛑',
    name: 'غرف الفرملة',
    short: 'الفرملة',
    at: [330, 145],
    plain: 'علب صغيرة عند كل عجلة يدخلها الهواء فتدفع قطع الفرامل لتضغط على الجزء الدائر.',
    like: 'عضلة صغيرة تدفع الفرامل بدلاً من قدمك.',
    broken: 'فرامل ضعيفة أو غير متوازنة بين العجلات.',
  },
  {
    id: 'fifth',
    emoji: '🔗',
    name: 'العجلة الخامسة والمسمار الملك',
    short: 'التعشيق',
    at: [290, 119],
    plain: 'قرص على القاطرة يمسك مسماراً في مقدمة المقطورة ويقفل عليه فتصبحان مربوطتين.',
    like: 'قفل باب: المفتاح يدخل ويُحبس ولا يخرج إلا بإذنك.',
    broken: 'انفصال المقطورة أو اهتزازها، وهو من أخطر الأعطال.',
  },
  {
    id: 'lines',
    emoji: '🔌',
    name: 'خراطيم الهواء والكهرباء',
    short: 'الخراطيم',
    at: [284, 96],
    plain: 'تنقل الهواء إلى فرامل المقطورة والكهرباء إلى أنوارها.',
    like: 'خرطوم ماء وسلك شاحن يصلان بين جهازين منفصلين.',
    broken: 'فرامل المقطورة لا تعمل أو أنوارها لا تضيء.',
  },
  {
    id: 'legs',
    emoji: '🦿',
    name: 'أرجل الدعم',
    short: 'الأرجل',
    at: [229, 146],
    plain: 'تسند المقطورة وهي منفصلة عن القاطرة، وتُرفع كاملة قبل الانطلاق.',
    like: 'أرجل الطاولة التي تقف عليها.',
    broken: 'إن بقيت منزّلة أثناء السير تتحطم أو تعلق بالطريق.',
  },
  {
    id: 'duals',
    emoji: '🛞',
    name: 'الإطارات المزدوجة',
    short: 'الإطارات',
    at: [77, 145],
    plain: 'إطاران متجاوران على كل جانب لحمل وزن أكبر وتوزيعه.',
    like: 'حذاءان جنب بعض يحملان ثقلاً أكبر.',
    broken: 'حصى بين الإطارين أو اختلاف الضغط يسبب انفجاراً أو تآكلاً سريعاً.',
  },
  {
    id: 'trailer',
    emoji: '📦',
    name: 'المقطورة (نصف المقطورة)',
    short: 'المقطورة',
    at: [150, 78],
    plain: 'الصندوق الذي يحمل البضائع، يستند طرفه الأمامي على القاطرة وطرفه الخلفي على عجلاته.',
    like: 'عربة القطار التي يجرّها القاطر.',
    broken: 'حمولة غير متزنة تجعلها تتمايل أو تنطوي على القاطرة.',
  },
];

function CarArt() {
  return (
    <>
      <rect width="400" height="190" rx="16" fill="var(--surface)" />
      <line x1="10" y1="162" x2="390" y2="162" stroke="var(--line)" strokeWidth="3" strokeDasharray="10 8" />
      <path
        d="M24 128 V108 Q24 98 36 95 L92 86 L128 58 Q136 52 150 52 H250 Q264 52 272 60 L300 86 L356 94 Q376 97 378 110 V128 Q378 134 370 134 H32 Q24 134 24 128 Z"
        fill="#cbd5e1"
        stroke="#64748b"
        strokeWidth="3"
      />
      <path d="M104 86 L132 62 H190 V86 Z M200 86 V62 H248 Q256 62 262 68 L284 86 Z" fill="#93c5fd" opacity=".9" />
      {[96, 304].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="136" r="27" fill="#1f2937" />
          <circle cx={cx} cy="136" r="14" fill="#e2e8f0" />
          <circle cx={cx} cy="136" r="4" fill="#64748b" />
        </g>
      ))}
    </>
  );
}

function TruckArt() {
  return (
    <>
      <rect width="460" height="190" rx="16" fill="var(--surface)" />
      <line x1="10" y1="165" x2="450" y2="165" stroke="var(--line)" strokeWidth="3" strokeDasharray="10 8" />
      <rect x="18" y="38" width="252" height="84" rx="6" fill="#cbd5e1" stroke="#64748b" strokeWidth="3" />
      <rect x="18" y="122" width="266" height="8" fill="#64748b" />
      <rect x="226" y="130" width="6" height="24" fill="#475569" />
      <rect x="216" y="152" width="26" height="5" rx="2" fill="#475569" />
      <rect x="284" y="122" width="102" height="10" fill="#64748b" />
      <path d="M296 122 V74 Q296 64 306 62 H346 Q358 62 364 72 L384 104 V122 Z" fill="#94a3b8" stroke="#475569" strokeWidth="3" />
      <path d="M312 70 H344 Q350 70 354 77 L366 98 H312 Z" fill="#93c5fd" opacity=".9" />
      <rect x="288" y="40" width="7" height="60" rx="3" fill="#64748b" />
      {[60, 94, 300, 330, 366].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="146" r="19" fill="#1f2937" />
          <circle cx={cx} cy="146" r="9" fill="#e2e8f0" />
          <circle cx={cx} cy="146" r="3" fill="#64748b" />
        </g>
      ))}
    </>
  );
}

function PartsExplorer({ title, label, viewBox, art, parts }) {
  const [id, setId] = useState(parts[0].id);
  const part = parts.find((p) => p.id === id);
  const pick = (pid) => setId(pid);

  return (
    <div className="widget" aria-label={label}>
      <div className="widget-title">{title}</div>
      <svg viewBox={viewBox} className="car-svg" role="img" aria-label={`${label}: رسم جانبي عليه أرقام الأجزاء`}>
        {art}
        {parts.map((p, i) => {
          const [x, y] = p.at;
          const on = p.id === id;
          return (
            <g
              key={p.id}
              role="button"
              tabIndex={0}
              aria-label={`${i + 1}: ${p.name}`}
              onClick={() => pick(p.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  pick(p.id);
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <circle cx={x} cy={y} r={on ? 14 : 11.5} fill={on ? '#f4b400' : '#0f766e'} stroke="#fff" strokeWidth="2.5" />
              <text x={x} y={y + 4.5} textAnchor="middle" fontSize="13" fontWeight="800" fill={on ? '#1a1300' : '#fff'} fontFamily="Cairo, sans-serif">
                {i + 1}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="chip-row" role="group" aria-label="الأجزاء">
        {parts.map((p, i) => (
          <button key={p.id} className={`chip-btn ${p.id === id ? 'on' : ''}`} onClick={() => pick(p.id)}>
            {i + 1}. {p.emoji} {p.short}
          </button>
        ))}
      </div>

      <div className="part-card" aria-live="polite">
        <h4>
          {part.emoji} {part.name}
        </h4>
        <p>
          <b>بكلام بسيط: </b>
          {part.plain}
        </p>
        <p>
          <b>يشبه: </b>
          {part.like}
        </p>
        <p className="part-broken">
          <b>إذا حصل خلل: </b>
          {part.broken}
        </p>
      </div>
    </div>
  );
}

export function CarParts() {
  return (
    <PartsExplorer
      title="🚗 تعرّف على السيارة من الداخل: اضغط على أي رقم"
      label="سيارة من الداخل"
      viewBox="0 0 400 190"
      art={<CarArt />}
      parts={PARTS}
    />
  );
}

export function TruckParts() {
  return (
    <PartsExplorer
      title="🚛 تعرّف على القاطرة والمقطورة: اضغط على أي رقم"
      label="قاطرة ومقطورة"
      viewBox="0 0 460 190"
      art={<TruckArt />}
      parts={TRUCK_PARTS}
    />
  );
}

/* ---------------------------------------------------------------
   ضغط الهواء في الفرامل الهوائية: حرّك المؤشر وشاهد ما يحدث
   (النسب توضيحية للفهم، وتختلف بين المركبات)
---------------------------------------------------------------- */
const AIR_ZONES = {
  ok: {
    icon: '✅',
    title: 'ضغط طبيعي',
    text: 'الهواء كافٍ: الفرامل تعمل بكامل قوتها ويمكنك الانطلاق.',
    cls: 'tone-blue',
  },
  warn: {
    icon: '⚠️',
    title: 'ضغط منخفض: يرنّ الجرس ويضيء الإنذار',
    text: 'الهواء أقل من اللازم لفرملة آمنة. أوقف المركبة بأمان وأصلح العطل، ولا تتابع السير.',
    cls: 'tone-yellow',
  },
  spring: {
    icon: '🛑',
    title: 'الفرامل النابضية تنطبق وحدها',
    text: 'عندما يهبط الهواء أكثر تنطبق الفرامل النابضية تلقائياً فتتوقف المركبة. هذا تصميم أمان لا عطل: المركبة تفشل «نحو التوقف».',
    cls: 'tone-red',
  },
};

export function AirGauge() {
  const [p, setP] = useState(100);
  const zone = p >= 80 ? 'ok' : p >= 40 ? 'warn' : 'spring';
  const z = AIR_ZONES[zone];

  return (
    <div className="widget" aria-label="جهاز ضغط الهواء">
      <div className="widget-title">🌀 حرّك المؤشر: ماذا يحدث عندما ينخفض ضغط الهواء؟</div>
      <div className="air-bar" dir="ltr" aria-hidden="true">
        <div className="air-zone red" style={{ width: '40%' }}>
          تنطبق وحدها
        </div>
        <div className="air-zone yellow" style={{ width: '40%' }}>
          إنذار
        </div>
        <div className="air-zone green" style={{ width: '20%' }}>
          طبيعي
        </div>
        <div className="air-pointer" style={{ left: `${p}%` }} />
      </div>
      <label className="field">
        <span>
          ضغط الهواء: <b>{p}%</b> من الضغط الطبيعي
        </span>
        <input type="range" min="0" max="100" step="1" value={p} onChange={(e) => setP(+e.target.value)} />
      </label>
      <div className={`light-info ${z.cls}`} aria-live="polite">
        <h4>
          {z.icon} {z.title}
        </h4>
        <p>{z.text}</p>
      </div>
      <p className="widget-note">النسب المكتوبة توضيحية لفهم الفكرة فقط؛ الأرقام الفعلية تختلف بين مركبة وأخرى.</p>
    </div>
  );
}

/* ---------------------------------------------------------------
   لوحة العدادات: اضغط على اللمبة لتعرف معناها وماذا تفعل
---------------------------------------------------------------- */
const TONES = {
  red: { label: 'أحمر: توقّف بأمان الآن', cls: 'tone-red' },
  yellow: { label: 'أصفر: أصلح قريباً', cls: 'tone-yellow' },
  blue: { label: 'أزرق/أخضر: معلومة فقط', cls: 'tone-blue' },
};

const LIGHTS = [
  {
    id: 'oil',
    tone: 'red',
    emoji: '🛢️',
    name: 'ضغط الزيت',
    mean: 'الزيت لا يصل إلى المحرك بالقدر الكافي. بدون زيت تحتك القطع المعدنية وتتلف المحرك خلال دقائق.',
    todo: ['أوقف السيارة في مكان آمن فوراً', 'أطفئ المحرك', 'لا تكمل السير حتى لو كان الطريق قريباً', 'افحص مستوى الزيت بعد دقائق، أو اطلب مساعدة'],
  },
  {
    id: 'temp',
    tone: 'red',
    emoji: '🌡️',
    name: 'حرارة المحرك',
    mean: 'ماء التبريد لا يكفي والمحرك سخن أكثر من اللازم.',
    todo: ['أوقف السيارة بأمان وأطفئ المحرك', 'انتظر حتى يبرد تماماً', 'لا تفتح غطاء الرادياتير وهو ساخن أبداً', 'تأكد من مستوى الماء بعد أن يبرد واطلب مساعدة إن تكرر'],
  },
  {
    id: 'battery',
    tone: 'red',
    emoji: '🔋',
    name: 'البطارية (الشحن)',
    mean: 'الشحن لا يعمل: غالباً المولّد (الدينامو) أو السير. ستفرغ البطارية قريباً.',
    todo: ['أطفئ ما لا تحتاجه (المكيف، الراديو)', 'اذهب إلى أقرب ورشة دون أن تطفئ المحرك (قد لا يعمل بعدها)', 'لا تبدأ رحلة طويلة'],
  },
  {
    id: 'brake',
    tone: 'red',
    emoji: '🛑',
    name: 'الفرامل',
    mean: 'إما أن فرامل اليد مرفوعة، أو أن في نظام الفرامل خللاً (نقص سائل مثلاً).',
    todo: ['تأكد أولاً أن فرامل اليد منزّلة', 'إن بقيت اللمبة: أوقف بأمان ولا تقد', 'اطلب مساعدة، فالفرامل لا تحتمل التأجيل'],
  },
  {
    id: 'belt',
    tone: 'red',
    emoji: '💺',
    name: 'حزام الأمان',
    mean: 'أحد الركاب في المقاعد الأمامية لم يربط الحزام.',
    todo: ['اطلب من الجميع ربط الأحزمة', 'ثم تتحرك'],
  },
  {
    id: 'door',
    tone: 'red',
    emoji: '🚪',
    name: 'باب مفتوح',
    mean: 'باب أو صندوق الأمتعة غير مغلق جيداً.',
    todo: ['أوقف السيارة وأغلق الباب بإحكام', 'لا تسر والباب مفتوح، فقد يسقط أحد'],
  },
  {
    id: 'airbag',
    tone: 'red',
    emoji: '🎈',
    name: 'الوسادة الهوائية',
    mean: 'في نظام الوسائد الهوائية خلل. قد لا تعمل عند الحادث.',
    todo: ['يمكنك السير بحذر', 'لكن اذهب إلى الصيانة في أقرب وقت'],
  },
  {
    id: 'abs',
    tone: 'yellow',
    emoji: '🅰️',
    name: 'ABS (منع انغلاق العجلات)',
    mean: 'الفرامل العادية تعمل، لكن ميزة منع انغلاق العجلات معطّلة.',
    todo: ['قد بحذر وزد المسافة', 'تجنب الفرملة العنيفة', 'افحصها في الصيانة قريباً'],
  },
  {
    id: 'engine',
    tone: 'yellow',
    emoji: '🔧',
    name: 'فحص المحرك',
    mean: 'الحاسوب اكتشف خللاً يحتاج فحصاً، وغالباً في الوقود أو الإشعال أو العادم.',
    todo: ['إن كانت ثابتة: اذهب للفحص قريباً', 'إن كانت تومض وتهتز السيارة: خفف السرعة وأوقف في أقرب فرصة'],
  },
  {
    id: 'fuel',
    tone: 'yellow',
    emoji: '⛽',
    name: 'الوقود منخفض',
    mean: 'الوقود المتبقي قليل.',
    todo: ['اذهب إلى أقرب محطة وقود', 'لا تنتظر حتى ينفد، فقد تتوقف في مكان خطر'],
  },
  {
    id: 'tire',
    tone: 'yellow',
    emoji: '🛞',
    name: 'ضغط الإطارات',
    mean: 'ضغط الهواء في أحد الإطارات منخفض.',
    todo: ['افحص الإطارات في أول محطة', 'انفخها حسب الضغط المطلوب (وهي باردة)', 'تأكد أنه لا يوجد مسمار أو تسريب'],
  },
  {
    id: 'highbeam',
    tone: 'blue',
    emoji: '💡',
    name: 'الأنوار العالية',
    mean: 'الأنوار العالية مشغّلة.',
    todo: ['أخفضها عند مقابلة سيارة أو متابعة سيارة أمامك حتى لا تبهر سائقها'],
  },
];

export function DashboardLights() {
  const [id, setId] = useState('oil');
  const light = LIGHTS.find((l) => l.id === id);
  const tone = TONES[light.tone];

  return (
    <div className="widget" aria-label="لوحة العدادات">
      <div className="widget-title">🚦 لوحة العدادات: اضغط على اللمبة لتعرف ماذا تفعل</div>
      <div className="light-grid" role="group" aria-label="لمبات لوحة العدادات">
        {LIGHTS.map((l) => (
          <button key={l.id} className={`light-tile ${TONES[l.tone].cls} ${l.id === id ? 'on' : ''}`} onClick={() => setId(l.id)}>
            <span className="lt-emoji" aria-hidden="true">
              {l.emoji}
            </span>
            <span>{l.name}</span>
          </button>
        ))}
      </div>
      <div className={`light-info ${tone.cls}`} aria-live="polite">
        <span className="tone-pill">{tone.label}</span>
        <h4>
          {light.emoji} {light.name}
        </h4>
        <p>
          <b>معناها: </b>
          {light.mean}
        </p>
        <b>ماذا تفعل؟</b>
        <ol>
          {light.todo.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   لعبة التوصيل: وصّل كل كلمة بمعناها
---------------------------------------------------------------- */
export function TermMatch({ title, pairs }) {
  const [round, setRound] = useState(0);
  const order = useMemo(
    () => ({ terms: shuffle(pairs.map((_, i) => i)), meanings: shuffle(pairs.map((_, i) => i)) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [round, pairs],
  );
  const [sel, setSel] = useState(null);
  const [done, setDone] = useState([]);
  const [wrong, setWrong] = useState(null);
  const [tries, setTries] = useState(0);
  const finished = done.length === pairs.length;

  const reset = () => {
    setRound((r) => r + 1);
    setSel(null);
    setDone([]);
    setWrong(null);
    setTries(0);
  };

  const pickMeaning = (m) => {
    if (sel == null || done.includes(m)) return;
    setTries((t) => t + 1);
    if (m === sel) {
      setDone((d) => [...d, m]);
      setSel(null);
    } else {
      setWrong({ t: sel, m });
      setTimeout(() => setWrong(null), 700);
    }
  };

  return (
    <div className="widget" aria-label="لعبة توصيل">
      <div className="widget-title">🎯 {title ?? 'لعبة: وصّل كل كلمة بمعناها'}</div>
      <p className="widget-note">اضغط على الكلمة أولاً ثم على معناها الصحيح.</p>
      <div className="match-cols">
        <div className="match-col">
          {order.terms.map((i) => (
            <button
              key={i}
              disabled={done.includes(i)}
              className={`match-btn ${done.includes(i) ? 'ok' : ''} ${sel === i ? 'sel' : ''} ${wrong?.t === i ? 'bad' : ''}`}
              onClick={() => {
                setSel(i);
                setWrong(null);
              }}
            >
              {pairs[i][0]}
            </button>
          ))}
        </div>
        <div className="match-col">
          {order.meanings.map((i) => (
            <button
              key={i}
              disabled={done.includes(i)}
              className={`match-btn meaning ${done.includes(i) ? 'ok' : ''} ${wrong?.m === i ? 'bad' : ''}`}
              onClick={() => pickMeaning(i)}
            >
              {pairs[i][1]}
            </button>
          ))}
        </div>
      </div>
      {finished && (
        <p className="match-done" role="status">
          🎉 أحسنت! وصّلت الكل {tries === pairs.length ? 'من أول مرة' : `بعد ${tries} محاولة`}.{' '}
          <button className="btn small" onClick={reset}>
            العب مرة أخرى
          </button>
        </p>
      )}
    </div>
  );
}
