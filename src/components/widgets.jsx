import { useEffect, useRef, useState } from 'react';

/* ---------------------------------------------------------------
   حاسبة مسافة التوقف: مسافة رد الفعل + مسافة الكبح
---------------------------------------------------------------- */
const SURFACES = {
  dry: { label: 'طريق جاف', mu: 0.7 },
  wet: { label: 'طريق مبلل', mu: 0.4 },
};
const DRIVERS = {
  alert: { label: 'منتبه', t: 0.75 },
  normal: { label: 'عادي', t: 1.0 },
  tired: { label: 'متعب أو مشتت', t: 1.8 },
};

export function StoppingDistance({ heavy = false }) {
  const [speed, setSpeed] = useState(heavy ? 70 : 60);
  const [surface, setSurface] = useState('dry');
  const [driver, setDriver] = useState('normal');

  // المركبة الثقيلة المحمّلة: فرامل هوائية تتأخر نصف ثانية تقريباً، وتماسك فعلي أقل
  const lag = heavy ? 0.5 : 0;
  const muFactor = heavy ? 0.7 : 1;
  const v = speed / 3.6;
  const reaction = v * (DRIVERS[driver].t + lag);
  const braking = (v * v) / (2 * SURFACES[surface].mu * muFactor * 9.81);
  const total = reaction + braking;
  const MAX = heavy ? 380 : 260;
  const cars = total / (heavy ? 12 : 4.5);

  return (
    <div className="widget" aria-label="حاسبة مسافة التوقف">
      <div className="widget-title">
        {heavy ? '🧮 مركبة ثقيلة محمّلة: كم تحتاج لتتوقف؟' : '🧮 جرّب بنفسك: كم تحتاج لتتوقف؟'}
      </div>

      <label className="field">
        <span>
          السرعة: <b>{speed}</b> كم/س
        </span>
        <input type="range" min="20" max="140" step="5" value={speed} onChange={(e) => setSpeed(+e.target.value)} />
      </label>

      <div className="seg-row">
        <div className="seg" role="group" aria-label="حالة الطريق">
          {Object.entries(SURFACES).map(([k, s]) => (
            <button key={k} className={surface === k ? 'on' : ''} onClick={() => setSurface(k)}>
              {s.label}
            </button>
          ))}
        </div>
        <div className="seg" role="group" aria-label="حالة السائق">
          {Object.entries(DRIVERS).map(([k, s]) => (
            <button key={k} className={driver === k ? 'on' : ''} onClick={() => setDriver(k)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="dist-bar" role="img" aria-label={`المسافة الكلية ${Math.round(total)} متراً`}>
        <div className="dist-react" style={{ width: `${Math.min(100, (reaction / MAX) * 100)}%` }}>
          {reaction > 18 ? 'رد الفعل' : ''}
        </div>
        <div className="dist-brake" style={{ width: `${Math.min(100 - (reaction / MAX) * 100, (braking / MAX) * 100)}%` }}>
          {braking > 30 ? 'الكبح' : ''}
        </div>
      </div>

      <div className="dist-nums">
        <div>
          <small>رد الفعل</small>
          <b>{reaction.toFixed(0)} م</b>
        </div>
        <div>
          <small>الكبح</small>
          <b>{braking.toFixed(0)} م</b>
        </div>
        <div className="sum">
          <small>المجموع</small>
          <b>{total.toFixed(0)} م</b>
        </div>
      </div>
      <p className="widget-note">
        تقريباً {cars.toFixed(0)} {heavy ? 'طول شاحنة (12 م)' : 'طول سيارة'}. لاحظ: عند مضاعفة السرعة تتضاعف مسافة رد الفعل (×2) وتصبح
        مسافة الكبح أربعة أضعاف (×4).
        {heavy && ' الأرقام تقريبية للتعلّم فقط، وتختلف بحسب الحمولة وحالة الفرامل والإطارات.'}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------
   النقاط العمياء حول الشاحنة (منظر علوي، السير على اليمين)
---------------------------------------------------------------- */
const ZONES = [
  {
    id: 'front',
    label: 'الأمام',
    color: '#f59e0b',
    shape: <rect x="112" y="20" width="96" height="42" rx="10" />,
    text: 'أمام الكابينة مباشرة: السائق جالس عالياً فلا يرى ما هو قريب جداً أمامه، وقد لا يرى سيارة صغيرة أو طفلاً.',
  },
  {
    id: 'left',
    label: 'جهة السائق (اليسار)',
    color: '#eab308',
    shape: <polygon points="118,95 118,255 94,255 94,125" />,
    text: 'الجانب الأيسر: نقطة عمياء أضيق نسبياً، لكنها تمتد بمحاذاة الكابينة والمقطورة.',
  },
  {
    id: 'right',
    label: 'الجانب الأيمن',
    color: '#ef4444',
    shape: <polygon points="202,95 202,265 280,265 280,140" />,
    text: 'الجانب الأيمن: أكبر نقطة عمياء. تزداد خطورتها عند انعطاف الشاحنة يميناً لأن من يجاور الحافة قد يُحشر بينها وبين الرصيف.',
  },
  {
    id: 'rear',
    label: 'الخلف',
    color: '#dc2626',
    shape: <rect x="118" y="268" width="84" height="84" rx="10" />,
    text: 'خلف المقطورة: لا توجد رؤية مباشرة وتمتد مسافة طويلة. لا تلاصق الشاحنة، فالسائق لا يراك والمسافة اللازمة للتوقف أكبر.',
  },
];

export function BlindSpots() {
  const [active, setActive] = useState('all');
  const info = ZONES.find((z) => z.id === active);
  return (
    <div className="widget" aria-label="النقاط العمياء حول الشاحنة">
      <div className="widget-title">👁️ أين لا يراك سائق الشاحنة؟</div>
      <svg viewBox="0 0 320 360" className="engine-svg" role="img" aria-label="منظر علوي لشاحنة وحولها مناطق عمياء">
        <rect width="320" height="360" fill="#374151" rx="14" />
        <line x1="40" y1="0" x2="40" y2="360" stroke="#fff" strokeWidth="2" strokeDasharray="12 10" opacity=".5" />
        {ZONES.map((z) => (
          <g key={z.id} fill={z.color} opacity={active === 'all' ? 0.3 : active === z.id ? 0.62 : 0.1}>
            {z.shape}
          </g>
        ))}
        {/* الشاحنة (متجهة للأعلى) */}
        <rect x="122" y="120" width="76" height="142" rx="5" fill="#94a3b8" stroke="#475569" strokeWidth="3" />
        <rect x="128" y="62" width="64" height="56" rx="10" fill="#475569" />
        <rect x="135" y="68" width="50" height="14" rx="4" fill="#93c5fd" />
        <rect x="114" y="76" width="9" height="16" rx="3" fill="#1f2937" />
        <rect x="197" y="76" width="9" height="16" rx="3" fill="#1f2937" />
        {[130, 200, 232].map((y) => (
          <g key={y} fill="#111827">
            <rect x="116" y={y} width="8" height="22" rx="2" />
            <rect x="196" y={y} width="8" height="22" rx="2" />
          </g>
        ))}
      </svg>
      <div className="seg-row">
        <div className="seg" role="group" aria-label="اختيار المنطقة">
          <button className={active === 'all' ? 'on' : ''} onClick={() => setActive('all')}>
            الكل
          </button>
          {ZONES.map((z) => (
            <button key={z.id} className={active === z.id ? 'on' : ''} onClick={() => setActive(z.id)}>
              {z.label}
            </button>
          ))}
        </div>
      </div>
      <p className="widget-note">
        {info ? info.text : 'اختر منطقة لتعرف لماذا هي عمياء. القاعدة الذهبية: إذا لم ترَ مرايا سائق الشاحنة فهو لا يراك.'}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------
   المحرك رباعي الأشواط (آلية الكبّاس والعمود المرفقي)
---------------------------------------------------------------- */
const STROKES = [
  {
    name: 'السحب',
    dir: 'ينزل المكبس',
    text: 'صمام السحب مفتوح وينزل المكبس فيسحب خليط الهواء والوقود إلى الأسطوانة.',
    fill: 'rgba(96,165,250,.35)',
  },
  {
    name: 'الضغط',
    dir: 'يصعد المكبس',
    text: 'الصمامان مغلقان ويصعد المكبس فيضغط الخليط في حيّز صغير.',
    fill: 'rgba(37,99,235,.55)',
  },
  {
    name: 'الاحتراق (القدرة)',
    dir: 'ينزل المكبس بقوة',
    text: 'تشعل الشمعة الخليط المضغوط فيدفع الانفجار المكبس للأسفل وهذا هو الشوط المنتج للقدرة.',
    fill: 'rgba(249,115,22,.75)',
  },
  {
    name: 'العادم',
    dir: 'يصعد المكبس',
    text: 'يُفتح صمام العادم ويصعد المكبس فيدفع الغازات المحترقة إلى الخارج.',
    fill: 'rgba(107,114,128,.55)',
  },
];

const R = 35;
const L = 105;
const CX = 160;
const CY = 300;

export function EngineStrokes() {
  const [theta, setTheta] = useState(90);
  const [playing, setPlaying] = useState(false);
  const raf = useRef(0);
  const last = useRef(0);

  useEffect(() => {
    if (!playing) return undefined;
    const tick = (t) => {
      if (last.current) {
        const dt = (t - last.current) / 1000;
        setTheta((th) => (th + dt * 100) % 720);
      }
      last.current = t;
      raf.current = requestAnimationFrame(tick);
    };
    last.current = 0;
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing]);

  const stroke = Math.floor(theta / 180) % 4;
  const a = ((theta % 360) * Math.PI) / 180;
  const pinX = CX + R * Math.sin(a);
  const pinY = CY - R * Math.cos(a);
  const ppY = pinY - Math.sqrt(L * L - (pinX - CX) ** 2);
  const pTop = ppY - 15;
  const sparkOn = stroke === 2 && theta - 360 < 28;
  const intakeOpen = stroke === 0;
  const exhaustOpen = stroke === 3;

  const choose = (i) => {
    setPlaying(false);
    setTheta(i * 180 + 90);
  };

  return (
    <div className="widget" aria-label="محرك رباعي الأشواط">
      <div className="widget-title">⚙️ شاهد المحرك يعمل</div>
      <svg viewBox="0 0 320 360" className="engine-svg" role="img" aria-label={`شوط ${STROKES[stroke].name}`}>
        {/* مجرى السحب والعادم */}
        <path d="M20 96 H130 V104 H20 Z" fill="#cbd5e1" opacity=".7" />
        <path d="M190 96 H300 V104 H190 Z" fill="#cbd5e1" opacity=".7" />
        {intakeOpen && (
          <g fill="#2563eb">
            <polygon points="60,100 78,90 78,110" />
            <polygon points="90,100 108,90 108,110" />
          </g>
        )}
        {exhaustOpen && (
          <g fill="#6b7280">
            <polygon points="240,100 258,90 258,110" />
            <polygon points="270,100 288,90 288,110" />
          </g>
        )}
        {/* الرأس */}
        <rect x="96" y="100" width="128" height="30" rx="4" fill="#6b7280" />
        {/* الصمامات */}
        <g stroke="#111827" strokeWidth="5" strokeLinecap="round">
          <line x1="130" y1="70" x2="130" y2={intakeOpen ? 140 : 130} />
          <line x1="190" y1="70" x2="190" y2={exhaustOpen ? 140 : 130} />
        </g>
        <rect x="119" y={intakeOpen ? 138 : 128} width="22" height="5" rx="2" fill="#111827" />
        <rect x="179" y={exhaustOpen ? 138 : 128} width="22" height="5" rx="2" fill="#111827" />
        {/* الشمعة */}
        <rect x="155" y="66" width="10" height="64" rx="3" fill="#e5e7eb" stroke="#6b7280" />
        <rect x="158" y="130" width="4" height="10" fill="#6b7280" />
        {sparkOn && <polygon points="160,136 152,150 158,148 150,164 168,146 161,148 168,136" fill="#facc15" />}
        {/* الجدران */}
        <rect x="96" y="130" width="8" height="136" fill="#6b7280" />
        <rect x="216" y="130" width="8" height="136" fill="#6b7280" />
        {/* غرفة الاحتراق */}
        <rect x="104" y="130" width="112" height={Math.max(0, pTop - 130)} fill={STROKES[stroke].fill} />
        {/* ذراع التوصيل والكرنك */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#94a3b8" strokeDasharray="4 5" />
        <line x1={CX} y1={CY} x2={pinX} y2={pinY} stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
        <line x1={CX} y1={ppY} x2={pinX} y2={pinY} stroke="#94a3b8" strokeWidth="9" strokeLinecap="round" />
        <circle cx={CX} cy={CY} r="9" fill="#334155" />
        <circle cx={pinX} cy={pinY} r="7" fill="#f4b400" stroke="#334155" strokeWidth="2" />
        {/* المكبس */}
        <rect x="106" y={pTop} width="108" height="30" rx="5" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
        <line x1="108" y1={pTop + 8} x2="212" y2={pTop + 8} stroke="#64748b" strokeWidth="2" />
        <line x1="108" y1={pTop + 14} x2="212" y2={pTop + 14} stroke="#64748b" strokeWidth="2" />
        <circle cx={CX} cy={ppY} r="5" fill="#475569" />
      </svg>

      <div className="engine-info">
        <b>
          الشوط {stroke + 1}: {STROKES[stroke].name}
        </b>
        <span className="chip">{STROKES[stroke].dir}</span>
        <p>{STROKES[stroke].text}</p>
      </div>

      <div className="seg-row">
        <div className="seg" role="group" aria-label="اختيار الشوط">
          {STROKES.map((s, i) => (
            <button key={s.name} className={stroke === i ? 'on' : ''} onClick={() => choose(i)}>
              {i + 1}. {s.name.split(' ')[0]}
            </button>
          ))}
        </div>
        <button className="btn small" onClick={() => setPlaying((p) => !p)}>
          {playing ? '⏸ إيقاف' : '▶ تشغيل'}
        </button>
      </div>
    </div>
  );
}
