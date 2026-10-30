// مكتبة الشواخص والإشارات مرسومة بـ SVG داخل مربع 100×100.
// كل شاخصة دالة ترجع <g>؛ SignView يضعها داخل <svg>.

const RED = '#d62828';
const BLUE = '#1558b0';
const YELLOW = '#f4b400';
const INK = '#111827';

const rot = (deg) => `rotate(${deg} 50 50)`;
const mirror = 'translate(100 0) scale(-1 1)';

// ---------- قواعد الأشكال الأساسية ----------
const WarnTriangle = ({ children }) => (
  <g>
    <polygon points="50,9 94,86 6,86" fill="#fff" stroke={RED} strokeWidth="9" strokeLinejoin="round" />
    {children}
  </g>
);

const ProhibitDisc = ({ children }) => (
  <g>
    <circle cx="50" cy="50" r="43" fill="#fff" stroke={RED} strokeWidth="9" />
    {children}
  </g>
);

const MandatoryDisc = ({ children }) => (
  <g>
    <circle cx="50" cy="50" r="46" fill={BLUE} />
    {children}
  </g>
);

const InfoSquare = ({ children }) => (
  <g>
    <rect x="5" y="5" width="90" height="90" rx="10" fill={BLUE} stroke="#fff" strokeWidth="3" />
    {children}
  </g>
);

// ---------- رسومات صغيرة قابلة للتكرار ----------
const Person = ({ x = 0, y = 0, s = 1, color = INK }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={color} fill={color} strokeLinecap="round">
    <circle cx="50" cy="30" r="6.5" stroke="none" />
    <path
      d="M50 39 L47 58 M50 43 L38 53 M50 43 L61 51 M47 58 L40 76 M47 58 L57 75"
      fill="none"
      strokeWidth="5.5"
    />
  </g>
);

const Car = ({ x = 0, y = 0, s = 1, color = INK }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={color}>
    <path d="M0 26 L7 10 Q9 5 16 5 H38 Q45 5 49 11 L58 22 Q65 23 65 29 V33 H0 Z" />
    <circle cx="15" cy="34" r="7.5" stroke="#fff" strokeWidth="2.5" />
    <circle cx="50" cy="34" r="7.5" stroke="#fff" strokeWidth="2.5" />
  </g>
);

const Truck = ({ x = 0, y = 0, s = 1, color = INK }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={color}>
    <rect x="10" y="30" width="48" height="30" rx="2" />
    <path d="M60 40 H76 L88 52 V60 H60 Z" />
    <circle cx="26" cy="64" r="7" stroke="#fff" strokeWidth="2.5" />
    <circle cx="46" cy="64" r="7" stroke="#fff" strokeWidth="2.5" />
    <circle cx="76" cy="64" r="7" stroke="#fff" strokeWidth="2.5" />
  </g>
);

const Motorcycle = ({ x = 0, y = 0, s = 1, color = INK }) => (
  <g
    transform={`translate(${x} ${y}) scale(${s})`}
    fill="none"
    stroke={color}
    strokeWidth="7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="24" cy="66" r="11" />
    <circle cx="76" cy="66" r="11" />
    <path d="M24 66 L40 46 H60 L76 66" />
    <path d="M60 46 L66 32 H76" />
    <path d="M36 40 H52" />
  </g>
);

// سهم مزدوج عمودي (للارتفاع)
const VArrow = ({ x }) => (
  <g stroke={INK} fill={INK} strokeWidth="3.5" strokeLinecap="round">
    <line x1={x} y1="33" x2={x} y2="67" />
    <polygon points={`${x - 6},38 ${x + 6},38 ${x},27`} stroke="none" />
    <polygon points={`${x - 6},62 ${x + 6},62 ${x},73`} stroke="none" />
  </g>
);

const Arrow = ({ color = '#fff' }) => (
  <polygon points="50,16 74,44 59,44 59,82 41,82 41,44 26,44" fill={color} />
);

const polar = (r, a) => [50 + r * Math.cos((a * Math.PI) / 180), 50 - r * Math.sin((a * Math.PI) / 180)];

// ثلاثة أسهم دائرية (عكس عقارب الساعة، حيث نسير على اليمين)
const RoundaboutArrows = ({ color = '#fff', r = 22, w = 6 }) => {
  const arcs = [0, 120, 240].map((base) => {
    const a0 = base + 15;
    const a1 = base + 95;
    const [x0, y0] = polar(r, a0);
    const [x1, y1] = polar(r, a1);
    const rad = (a1 * Math.PI) / 180;
    const t = [-Math.sin(rad), -Math.cos(rad)]; // اتجاه الحركة
    const n = [Math.cos(rad), -Math.sin(rad)]; // اتجاه نصف القطر
    const tip = [x1 + t[0] * 9, y1 + t[1] * 9];
    const b1 = [x1 + n[0] * 7, y1 + n[1] * 7];
    const b2 = [x1 - n[0] * 7, y1 - n[1] * 7];
    return (
      <g key={base}>
        <path d={`M${x0} ${y0} A${r} ${r} 0 0 0 ${x1} ${y1}`} fill="none" stroke={color} strokeWidth={w} />
        <polygon points={`${tip} ${b1} ${b2}`} fill={color} />
      </g>
    );
  });
  return <g>{arcs}</g>;
};

// ---------- الشواخص ----------
const SIGN_DEFS = {
  // ===== شواخص المنع والأوامر (دائرة حمراء) =====
  stop: {
    name: 'قف',
    draw: () => (
      <g>
        <polygon points="92.5,67.6 67.6,92.5 32.4,92.5 7.5,67.6 7.5,32.4 32.4,7.5 67.6,7.5 92.5,32.4" fill="#fff" />
        <polygon points="87,65.3 65.3,87 34.7,87 13,65.3 13,34.7 34.7,13 65.3,13 87,34.7" fill={RED} />
        <text x="50" y="62" textAnchor="middle" fontSize="30" fontWeight="800" fill="#fff" fontFamily="Cairo, sans-serif">
          قف
        </text>
      </g>
    ),
  },
  yield: {
    name: 'أعطِ الأفضلية',
    draw: () => (
      <polygon points="10,17 90,17 50,86" fill="#fff" stroke={RED} strokeWidth="10" strokeLinejoin="round" />
    ),
  },
  noEntry: {
    name: 'ممنوع الدخول',
    draw: () => (
      <g>
        <circle cx="50" cy="50" r="46" fill={RED} />
        <rect x="21" y="42" width="58" height="16" rx="2" fill="#fff" />
      </g>
    ),
  },
  noParking: {
    name: 'ممنوع الوقوف',
    draw: () => (
      <g>
        <circle cx="50" cy="50" r="42" fill={BLUE} stroke={RED} strokeWidth="9" />
        <line x1="24" y1="76" x2="76" y2="24" stroke={RED} strokeWidth="9" strokeLinecap="round" />
      </g>
    ),
  },
  noStopping: {
    name: 'ممنوع الوقوف والتوقف',
    draw: () => (
      <g>
        <circle cx="50" cy="50" r="42" fill={BLUE} stroke={RED} strokeWidth="9" />
        <line x1="26" y1="26" x2="74" y2="74" stroke={RED} strokeWidth="9" strokeLinecap="round" />
        <line x1="74" y1="26" x2="26" y2="74" stroke={RED} strokeWidth="9" strokeLinecap="round" />
      </g>
    ),
  },
  noOvertaking: {
    name: 'ممنوع التجاوز',
    draw: () => (
      <ProhibitDisc>
        <Car x={20} y={34} s={0.5} color={RED} />
        <Car x={52} y={34} s={0.5} color={INK} />
      </ProhibitDisc>
    ),
  },
  noUTurn: {
    name: 'ممنوع الدوران للخلف',
    draw: () => (
      <ProhibitDisc>
        <path d="M38 74 V42 a12 12 0 0 1 24 0 V52" fill="none" stroke={INK} strokeWidth="8" />
        <polygon points="53,50 71,50 62,66" fill={INK} />
        <line x1="24" y1="24" x2="76" y2="76" stroke={RED} strokeWidth="8" strokeLinecap="round" />
      </ProhibitDisc>
    ),
  },
  noLeftTurn: {
    name: 'ممنوع الانعطاف يساراً',
    draw: () => (
      <ProhibitDisc>
        <path d="M62 76 V52 H44" fill="none" stroke={INK} strokeWidth="8" />
        <polygon points="46,40 46,64 28,52" fill={INK} />
        <line x1="24" y1="24" x2="76" y2="76" stroke={RED} strokeWidth="8" strokeLinecap="round" />
      </ProhibitDisc>
    ),
  },
  noHonking: {
    name: 'ممنوع استخدام آلة التنبيه',
    draw: () => (
      <ProhibitDisc>
        <path d="M30 42 H40 L54 31 V69 L40 58 H30 Z" fill={INK} />
        <path d="M60 40 Q68 50 60 60 M66 34 Q80 50 66 66" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        <line x1="24" y1="24" x2="76" y2="76" stroke={RED} strokeWidth="8" strokeLinecap="round" />
      </ProhibitDisc>
    ),
  },

  // ===== شواخص الإلزام (دائرة زرقاء) =====
  goStraight: {
    name: 'سر إلى الأمام فقط',
    draw: () => (
      <MandatoryDisc>
        <Arrow />
      </MandatoryDisc>
    ),
  },
  turnRight: {
    name: 'انعطف يميناً فقط',
    draw: () => (
      <MandatoryDisc>
        <g transform={rot(90)}>
          <Arrow />
        </g>
      </MandatoryDisc>
    ),
  },
  turnLeft: {
    name: 'انعطف يساراً فقط',
    draw: () => (
      <MandatoryDisc>
        <g transform={rot(-90)}>
          <Arrow />
        </g>
      </MandatoryDisc>
    ),
  },
  keepRight: {
    name: 'الزم اليمين',
    draw: () => (
      <MandatoryDisc>
        <g transform={rot(135)}>
          <Arrow />
        </g>
      </MandatoryDisc>
    ),
  },
  roundabout: {
    name: 'دوّار (سر باتجاه السهم)',
    draw: () => (
      <MandatoryDisc>
        <RoundaboutArrows />
      </MandatoryDisc>
    ),
  },

  // ===== شواخص التحذير (مثلث) =====
  warnPedestrian: {
    name: 'تحذير: ممر مشاة',
    draw: () => (
      <WarnTriangle>
        <Person x={0} y={6} s={0.82} />
        <path d="M24 82 H76" stroke={INK} strokeWidth="0" />
      </WarnTriangle>
    ),
  },
  warnSchool: {
    name: 'تحذير: مدرسة / أطفال',
    draw: () => (
      <WarnTriangle>
        <Person x={-9} y={6} s={0.8} />
        <Person x={13} y={14} s={0.6} />
      </WarnTriangle>
    ),
  },
  warnCurveRight: {
    name: 'تحذير: منعطف إلى اليمين',
    draw: () => (
      <WarnTriangle>
        <path d="M38 78 V58 Q38 44 54 42" fill="none" stroke={INK} strokeWidth="7" />
        <polygon points="52,31 69,42 52,53" fill={INK} />
      </WarnTriangle>
    ),
  },
  warnCurveLeft: {
    name: 'تحذير: منعطف إلى اليسار',
    draw: () => (
      <g transform={mirror}>
        <WarnTriangle>
          <path d="M38 78 V58 Q38 44 54 42" fill="none" stroke={INK} strokeWidth="7" />
          <polygon points="52,31 69,42 52,53" fill={INK} />
        </WarnTriangle>
      </g>
    ),
  },
  warnSlippery: {
    name: 'تحذير: طريق زلق',
    draw: () => (
      <WarnTriangle>
        <Car x={32} y={36} s={0.55} />
        <path d="M30 76 q5 -5 10 0 t10 0 t10 0 t10 0" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      </WarnTriangle>
    ),
  },
  warnRoundabout: {
    name: 'تحذير: دوّار أمامك',
    draw: () => (
      <WarnTriangle>
        <g transform="translate(15 22) scale(0.7)">
          <RoundaboutArrows color={INK} r={20} w={7} />
        </g>
      </WarnTriangle>
    ),
  },
  warnSignals: {
    name: 'تحذير: إشارة ضوئية أمامك',
    draw: () => (
      <WarnTriangle>
        <rect x="40" y="32" width="20" height="46" rx="4" fill={INK} />
        <circle cx="50" cy="42" r="5" fill="#ef4444" />
        <circle cx="50" cy="55" r="5" fill={YELLOW} />
        <circle cx="50" cy="68" r="5" fill="#22c55e" />
      </WarnTriangle>
    ),
  },
  warnIntersection: {
    name: 'تحذير: تقاطع أمامك',
    draw: () => (
      <WarnTriangle>
        <path d="M50 36 V78 M32 58 H68" stroke={INK} strokeWidth="8" />
      </WarnTriangle>
    ),
  },
  warnTwoWay: {
    name: 'تحذير: مرور باتجاهين',
    draw: () => (
      <WarnTriangle>
        <g transform="translate(-13 6) scale(0.62)">
          <Arrow color={INK} />
        </g>
        <g transform="translate(51 6) scale(0.62)">
          <g transform={rot(180)}>
            <Arrow color={INK} />
          </g>
        </g>
      </WarnTriangle>
    ),
  },
  warnDanger: {
    name: 'تحذير: خطر عام',
    draw: () => (
      <WarnTriangle>
        <rect x="46" y="32" width="8" height="28" rx="3" fill={INK} />
        <circle cx="50" cy="71" r="5" fill={INK} />
      </WarnTriangle>
    ),
  },

  // ===== الأولوية =====
  priorityRoad: {
    name: 'طريق ذو أولوية',
    draw: () => (
      <g>
        <polygon points="50,2 98,50 50,98 2,50" fill="#fff" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <polygon points="50,16 84,50 50,84 16,50" fill={YELLOW} />
      </g>
    ),
  },
  endPriority: {
    name: 'نهاية الطريق ذي الأولوية',
    draw: () => (
      <g>
        <polygon points="50,2 98,50 50,98 2,50" fill="#fff" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <polygon points="50,16 84,50 50,84 16,50" fill="#e5e7eb" />
        <path d="M30 70 L70 30 M24 62 L62 24 M38 76 L76 38" stroke={INK} strokeWidth="3" />
      </g>
    ),
  },

  // ===== شواخص إرشادية (مربع/مستطيل أزرق) =====
  parking: {
    name: 'موقف مركبات',
    draw: () => (
      <InfoSquare>
        <text x="50" y="72" textAnchor="middle" fontSize="64" fontWeight="800" fill="#fff" fontFamily="Cairo, sans-serif">
          P
        </text>
      </InfoSquare>
    ),
  },
  hospital: {
    name: 'مستشفى',
    draw: () => (
      <InfoSquare>
        <text x="50" y="72" textAnchor="middle" fontSize="62" fontWeight="800" fill="#fff" fontFamily="Cairo, sans-serif">
          H
        </text>
      </InfoSquare>
    ),
  },
  oneWay: {
    name: 'طريق باتجاه واحد',
    draw: () => (
      <g>
        <rect x="3" y="22" width="94" height="56" rx="8" fill={BLUE} stroke="#fff" strokeWidth="3" />
        <polygon points="14,42 60,42 60,30 88,50 60,70 60,58 14,58" fill="#fff" />
      </g>
    ),
  },
  // ===== شواخص خاصة بالمركبات الثقيلة والدراجات =====
  noTrucks: {
    name: 'ممنوع مرور الشاحنات',
    draw: () => (
      <ProhibitDisc>
        <Truck x={17} y={15} s={0.7} />
      </ProhibitDisc>
    ),
  },
  noMotorcycles: {
    name: 'ممنوع مرور الدراجات النارية',
    draw: () => (
      <ProhibitDisc>
        <Motorcycle x={19} y={16} s={0.62} />
      </ProhibitDisc>
    ),
  },
  heightLimit: {
    name: 'تحديد الارتفاع الأقصى للمركبة',
    draw: () => (
      <ProhibitDisc>
        <VArrow x={25} />
        <VArrow x={75} />
        <text x="50" y="57" textAnchor="middle" fontSize="19" fontWeight="800" fill={INK} fontFamily="Cairo, sans-serif">
          3.5m
        </text>
      </ProhibitDisc>
    ),
  },
  weightLimit: {
    name: 'تحديد الوزن الأقصى للمركبة',
    draw: () => (
      <ProhibitDisc>
        <text x="50" y="59" textAnchor="middle" fontSize="27" fontWeight="800" fill={INK} fontFamily="Cairo, sans-serif">
          5.5t
        </text>
      </ProhibitDisc>
    ),
  },
  warnSteepDown: {
    name: 'تحذير: منحدر شديد',
    draw: () => (
      <WarnTriangle>
        <polygon points="26,40 72,62 26,62" fill={INK} />
        <text x="50" y="79" textAnchor="middle" fontSize="15" fontWeight="800" fill={INK} fontFamily="Cairo, sans-serif">
          10%
        </text>
      </WarnTriangle>
    ),
  },
  crossing: {
    name: 'ممر مشاة (إرشادي)',
    draw: () => (
      <InfoSquare>
        <polygon points="50,16 84,78 16,78" fill="#fff" />
        <Person x={0} y={8} s={0.78} color={BLUE} />
      </InfoSquare>
    ),
  },
};

// سرعات: speed30، speed50 ... إلخ
const speedSign = (n) => ({
  name: `الحد الأقصى للسرعة ${n} كم/س`,
  draw: () => (
    <ProhibitDisc>
      <text x="50" y="63" textAnchor="middle" fontSize="38" fontWeight="800" fill={INK} fontFamily="Cairo, sans-serif">
        {n}
      </text>
    </ProhibitDisc>
  ),
});

export function getSign(id) {
  if (SIGN_DEFS[id]) return SIGN_DEFS[id];
  const m = /^speed(\d+)$/.exec(id);
  if (m) return speedSign(m[1]);
  return null;
}

export function SignView({ id, size = 92, title }) {
  const def = getSign(id);
  if (!def) return null;
  return (
    <svg
      className="sign-svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={title || def.name}
    >
      {def.draw()}
    </svg>
  );
}

export function signName(id) {
  return getSign(id)?.name ?? id;
}

// نسخة تُرسم داخل SVG آخر (للمخططات)
export function SignGlyph({ id }) {
  const def = getSign(id);
  return def ? def.draw() : null;
}

// ---------- الإشارة الضوئية ----------
export function TrafficLight({ on = ['red'], size = 110, arrow = false }) {
  const lamp = (cy, color, key) => (
    <circle
      cx="40"
      cy={cy}
      r="14"
      fill={on.includes(key) ? color : '#374151'}
      stroke="#0b0f19"
      strokeWidth="2"
      opacity={on.includes(key) ? 1 : 0.55}
    />
  );
  return (
    <svg viewBox="0 0 80 150" width={size * 0.55} height={size} role="img" aria-label="إشارة ضوئية">
      <rect x="10" y="4" width="60" height="142" rx="14" fill="#111827" />
      {lamp(34, '#ef4444', 'red')}
      {lamp(75, '#facc15', 'yellow')}
      {lamp(116, '#22c55e', 'green')}
      {arrow && (
        <g transform="translate(40 116)" fill="#fff">
          <polygon points="0,-9 9,1 4,1 4,9 -4,9 -4,1 -9,1" />
        </g>
      )}
    </svg>
  );
}

// ---------- العلامات الأرضية (منظر علوي) ----------
export function RoadMarking({ kind = 'dashed', size = 130, withCar = false }) {
  const road = <rect x="0" y="0" width="120" height="110" fill="#374151" />;
  const dash = (x, color = '#fff') => (
    <line x1={x} y1="-4" x2={x} y2="114" stroke={color} strokeWidth="3.2" strokeDasharray="13 10" />
  );
  const solid = (x, color = '#fff') => <line x1={x} y1="0" x2={x} y2="110" stroke={color} strokeWidth="3.2" />;
  const edges = (
    <g>
      {solid(8)}
      {solid(112)}
    </g>
  );
  let body = null;
  switch (kind) {
    case 'dashed':
      body = (
        <>
          {edges}
          {dash(60)}
        </>
      );
      break;
    case 'solid':
      body = (
        <>
          {edges}
          {solid(60)}
        </>
      );
      break;
    case 'doubleSolid':
      body = (
        <>
          {edges}
          {solid(56.5)}
          {solid(63.5)}
        </>
      );
      break;
    case 'solidDashed':
      body = (
        <>
          {edges}
          {solid(56.5)}
          {dash(63.5)}
        </>
      );
      break;
    case 'stopLine':
      body = (
        <>
          {edges}
          {dash(60)}
          <rect x="62" y="40" width="48" height="8" fill="#fff" />
        </>
      );
      break;
    case 'zebra':
      body = (
        <>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <rect key={i} x={8 + i * 16} y="36" width="9" height="38" fill="#fff" />
          ))}
          {edges}
        </>
      );
      break;
    case 'arrowStraight':
      body = (
        <>
          {edges}
          {dash(60)}
          <g transform="translate(84 62) scale(0.36)" fill="#fff">
            <polygon points="0,-40 28,-8 12,-8 12,40 -12,40 -12,-8 -28,-8" />
          </g>
        </>
      );
      break;
    case 'arrowRight':
      body = (
        <>
          {edges}
          {dash(60)}
          <g transform="translate(84 62) rotate(90) scale(0.36)" fill="#fff">
            <polygon points="0,-40 28,-8 12,-8 12,40 -12,40 -12,-8 -28,-8" />
          </g>
        </>
      );
      break;
    case 'arrowLeft':
      body = (
        <>
          {edges}
          {dash(60)}
          <g transform="translate(84 62) rotate(-90) scale(0.36)" fill="#fff">
            <polygon points="0,-40 28,-8 12,-8 12,40 -12,40 -12,-8 -28,-8" />
          </g>
        </>
      );
      break;
    case 'yellowCurb':
      body = (
        <>
          <rect x="0" y="0" width="120" height="110" fill="#374151" />
          <rect x="0" y="0" width="22" height="110" fill="#e5e7eb" />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x="0" y={i * 22 + 2} width="22" height="11" fill={YELLOW} />
          ))}
          {solid(60)}
        </>
      );
      break;
    default:
      break;
  }
  return (
    <svg viewBox="0 0 120 110" width={size} height={(size * 110) / 120} role="img" aria-label="علامة أرضية" className="marking-svg">
      <clipPath id={`clip-${kind}`}>
        <rect x="0" y="0" width="120" height="110" rx="10" />
      </clipPath>
      <g clipPath={`url(#clip-${kind})`}>
        {kind !== 'yellowCurb' && road}
        {body}
        {withCar && (
          <g>
            <rect x="74" y="66" width="22" height="38" rx="6" fill="#2563eb" stroke="#fff" strokeWidth="2" />
            <rect x="77" y="71" width="16" height="9" rx="3" fill="rgba(255,255,255,.55)" />
            <path d="M85 60 V46" stroke="#93c5fd" strokeWidth="3" strokeDasharray="2 6" strokeLinecap="round" />
          </g>
        )}
      </g>
    </svg>
  );
}
