import { SignGlyph } from './Signs';

// مخطط علوي لتقاطع أو دوّار. السير على اليمين.
// المركبة تُعرَّف من الجهة التي تقترب منها (S جنوب/أسفل، N شمال، E شرق، W غرب)
// وتُرسم محلياً كأنها قادمة من الأسفل ثم يُدوَّر المشهد.

const ANGLE = { S: 0, W: 90, N: 180, E: 270 };
const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#9333ea'];
const ROAD = '#4b5563';

const PATHS = {
  straight: 'M170 FROM L170 70',
  right: 'M170 FROM L170 196 Q170 170 196 170 L244 170',
  left: 'M170 FROM L170 178 Q170 130 130 130 L56 130',
};

function Arm({ dir, roundabout, stopLine }) {
  const a = ANGLE[dir];
  const top = roundabout ? 205 : 190;
  return (
    <g transform={`rotate(${a} 150 150)`}>
      <rect x="110" y={top} width="80" height={300 - top} fill={ROAD} />
      <line x1="150" y1={roundabout ? 232 : 205} x2="150" y2="300" stroke="#fff" strokeWidth="2.5" strokeDasharray="10 8" />
      {stopLine && <rect x="150" y={roundabout ? 226 : 192} width="40" height="5" fill="#fff" />}
    </g>
  );
}

function ApproachCar({ car, index, roundabout }) {
  const a = ANGLE[car.from];
  const color = COLORS[index % COLORS.length];
  const y = roundabout ? 246 : 222;
  const from = y - 6;
  const d = roundabout ? `M170 ${from} L170 214` : PATHS[car.move ?? 'straight'].replace('FROM', String(from));
  const cx = 170;
  const cy = y + 20;
  return (
    <g transform={`rotate(${a} 150 150)`}>
      <path d={d} fill="none" stroke={color} strokeWidth="4" strokeDasharray="2 7" strokeLinecap="round" markerEnd={`url(#ah-${index})`} />
      <rect x="158" y={y} width="24" height="40" rx="6" fill={car.emergency ? '#fff' : color} stroke={car.emergency ? '#dc2626' : '#fff'} strokeWidth="2" />
      <rect x="161" y={y + 6} width="18" height="9" rx="3" fill="rgba(255,255,255,.55)" />
      {car.emergency && <rect x="164" y={y + 20} width="12" height="4" rx="2" fill="#dc2626" />}
      <g transform={`translate(${cx} ${cy + 4}) rotate(${-a})`}>
        <text textAnchor="middle" dominantBaseline="middle" fontSize="15" fontWeight="800" fill={car.emergency ? '#dc2626' : '#fff'} fontFamily="Cairo, sans-serif">
          {car.id}
        </text>
      </g>
      {car.sign && (
        <g transform={`translate(208 ${y + 8}) rotate(${-a}) scale(0.5) translate(-50 -50)`}>
          <SignGlyph id={car.sign} />
        </g>
      )}
    </g>
  );
}

function RingCar({ car, index }) {
  const R = 62;
  const rad = (car.angle * Math.PI) / 180;
  const px = 150 + R * Math.sin(rad);
  const py = 150 - R * Math.cos(rad);
  const heading = car.angle - 90;
  const color = COLORS[index % COLORS.length];
  return (
    <g transform={`translate(${px} ${py}) rotate(${heading})`}>
      <path d="M0 -22 L0 -44" stroke={color} strokeWidth="4" strokeDasharray="2 7" strokeLinecap="round" markerEnd={`url(#ah-${index})`} />
      <rect x="-11" y="-18" width="22" height="36" rx="6" fill={color} stroke="#fff" strokeWidth="2" />
      <rect x="-8" y="-13" width="16" height="8" rx="3" fill="rgba(255,255,255,.55)" />
      <g transform={`translate(0 5) rotate(${-heading})`}>
        <text textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="800" fill="#fff" fontFamily="Cairo, sans-serif">
          {car.id}
        </text>
      </g>
    </g>
  );
}

export default function Intersection({
  arms = ['N', 'E', 'S', 'W'],
  cars = [],
  ringCars = [],
  roundabout = false,
  stopLines = false,
  label,
}) {
  const all = [...cars, ...ringCars];
  return (
    <figure className="diagram">
      <svg viewBox="0 0 300 300" role="img" aria-label={label || 'مخطط تقاطع'}>
        <defs>
          {COLORS.map((c, i) => (
            <marker key={c} id={`ah-${i}`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 Z" fill={c} />
            </marker>
          ))}
        </defs>
        <rect width="300" height="300" rx="16" fill="#d9e4d2" />
        {arms.map((d) => (
          <Arm key={d} dir={d} roundabout={roundabout} stopLine={stopLines} />
        ))}
        {roundabout ? (
          <g>
            <circle cx="150" cy="150" r="62" fill="none" stroke={ROAD} strokeWidth="42" />
            <circle cx="150" cy="150" r="41" fill="#86b97d" />
            <circle cx="150" cy="150" r="62" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="10 8" opacity=".55" />
          </g>
        ) : (
          <rect x="110" y="110" width="80" height="80" fill={ROAD} />
        )}
        {cars.map((c, i) => (
          <ApproachCar key={c.id} car={c} index={all.indexOf(c)} roundabout={roundabout} />
        ))}
        {ringCars.map((c) => (
          <RingCar key={c.id} car={c} index={all.indexOf(c)} />
        ))}
      </svg>
      {label && <figcaption>{label}</figcaption>}
    </figure>
  );
}
