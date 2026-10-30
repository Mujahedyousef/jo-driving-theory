import { useState } from 'react';
import { SignView, RoadMarking, TrafficLight, signName } from './Signs';
import { Link } from '../router';

const GROUPS = [
  { title: 'شواخص المنع (دائرة حمراء)', ids: ['noEntry', 'noParking', 'noStopping', 'noOvertaking', 'noUTurn', 'noLeftTurn', 'noHonking', 'noTrucks', 'noMotorcycles', 'heightLimit', 'weightLimit', 'speed30', 'speed50', 'speed80'] },
  { title: 'شواخص الإلزام (دائرة زرقاء)', ids: ['goStraight', 'turnRight', 'turnLeft', 'keepRight', 'roundabout'] },
  { title: 'شواخص التحذير (مثلث)', ids: ['warnPedestrian', 'warnSchool', 'warnCurveRight', 'warnCurveLeft', 'warnSlippery', 'warnRoundabout', 'warnSignals', 'warnIntersection', 'warnTwoWay', 'warnSteepDown', 'warnDanger'] },
  { title: 'الأفضلية', ids: ['stop', 'yield', 'priorityRoad', 'endPriority'] },
  { title: 'شواخص إرشادية', ids: ['parking', 'hospital', 'oneWay', 'crossing'] },
];

const MARKINGS = [
  ['dashed', 'خط متقطع: يجوز العبور بحذر'],
  ['solid', 'خط متصل: ممنوع العبور'],
  ['doubleSolid', 'خطان متصلان: ممنوع العبور من الاتجاهين'],
  ['solidDashed', 'متصل + متقطع: العبور لمن بجانبه المتقطع'],
  ['stopLine', 'خط التوقف'],
  ['zebra', 'ممر المشاة'],
];

const LIGHTS = [
  [['red'], 'أحمر: قف'],
  [['yellow'], 'أصفر: استعد للتوقف'],
  [['green'], 'أخضر: تحرّك بحذر'],
];

function Card({ label, quiz, children }) {
  const [shown, setShown] = useState(false);
  const hide = quiz && !shown;
  return (
    <button className={`sign-card flash ${quiz ? 'quiz' : ''}`} onClick={() => quiz && setShown((s) => !s)} aria-pressed={shown}>
      {children}
      <figcaption>
        <b className={hide ? 'blur' : ''}>{label}</b>
        {quiz && <small>{shown ? 'اضغط للإخفاء' : 'اضغط لإظهار الاسم'}</small>}
      </figcaption>
    </button>
  );
}

export default function SignsLibrary() {
  const [quiz, setQuiz] = useState(false);

  return (
    <div className="library">
      <div className="lib-head">
        <Link className="back" to="">
          ← الرئيسية
        </Link>
        <h1>🗂️ قاموس الشواخص والعلامات</h1>
        <p>راجع كل الشواخص في مكان واحد. فعّل «اختبر نفسك» لإخفاء الأسماء ثم خمّن المعنى قبل أن تضغط وتظهره.</p>
        <label className="switch">
          <input type="checkbox" checked={quiz} onChange={(e) => setQuiz(e.target.checked)} />
          <span className="track" />
          <span>وضع «اختبر نفسك»</span>
        </label>
      </div>

      {GROUPS.map((g) => (
        <section key={g.title} className="card">
          <h2>{g.title}</h2>
          <div className="sign-grid">
            {g.ids.map((id) => (
              <Card key={id + quiz} label={signName(id)} quiz={quiz}>
                <SignView id={id} size={86} title="شاخصة" />
              </Card>
            ))}
          </div>
        </section>
      ))}

      <section className="card">
        <h2>الإشارات الضوئية</h2>
        <div className="sign-grid">
          {LIGHTS.map(([on, label]) => (
            <Card key={label + quiz} label={label} quiz={quiz}>
              <TrafficLight on={on} size={104} />
            </Card>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>العلامات الأرضية</h2>
        <div className="sign-grid wide">
          {MARKINGS.map(([kind, label]) => (
            <Card key={kind + quiz} label={label} quiz={quiz}>
              <RoadMarking kind={kind} size={128} withCar={kind === 'solidDashed'} />
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
