import { useEffect, useRef } from 'react';
import { SignView, RoadMarking, TrafficLight, signName } from './Signs';
import Intersection from './Intersection';
import { StoppingDistance, EngineStrokes, BlindSpots } from './widgets';
import { AirGauge, CarParts, DashboardLights, TermMatch, TruckParts } from './mechanicsWidgets';

const WIDGETS = {
  stopping: StoppingDistance,
  stoppingHeavy: () => <StoppingDistance heavy />,
  strokes: EngineStrokes,
  blindspots: BlindSpots,
  carparts: CarParts,
  truckparts: TruckParts,
  airgauge: AirGauge,
  dashboard: DashboardLights,
};

function Callout({ kind, icon, title, children }) {
  return (
    <aside className={`callout ${kind}`}>
      <div className="callout-icon" aria-hidden="true">
        {icon}
      </div>
      <div>
        <b>{title}</b>
        <p>{children}</p>
      </div>
    </aside>
  );
}

function Block({ b }) {
  switch (b.t) {
    case 'p':
      return <p className="lead">{b.text}</p>;

    case 'list':
      return (
        <div className="block">
          {b.title && <h4>{b.title}</h4>}
          <ul className="bullets">
            {b.items.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
        </div>
      );

    case 'steps':
      return (
        <div className="block">
          {b.title && <h4>{b.title}</h4>}
          <ol className="steps">
            {b.items.map((it) => (
              <li key={it}>
                <span>{it}</span>
              </li>
            ))}
          </ol>
        </div>
      );

    case 'table':
      return (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {b.head.map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r) => (
                <tr key={r[0]}>
                  {r.map((c, i) => (
                    <td key={i} data-label={b.head[i]}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'signs':
      return (
        <div className="block">
          {b.title && <h4>{b.title}</h4>}
          <div className="sign-grid">
            {b.items.map((s) => (
              <figure key={s.id} className="sign-card">
                <SignView id={s.id} size={86} />
                <figcaption>
                  <b>{signName(s.id)}</b>
                  {s.note && <small>{s.note}</small>}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      );

    case 'markings':
      return (
        <div className="sign-grid wide">
          {b.items.map((m) => (
            <figure key={m.kind} className="sign-card">
              <RoadMarking kind={m.kind} size={128} withCar={m.withCar} />
              <figcaption>
                <b>{m.label}</b>
                <small>{m.note}</small>
              </figcaption>
            </figure>
          ))}
        </div>
      );

    case 'lights':
      return (
        <div className="block">
          {b.title && <h4>{b.title}</h4>}
          <div className="lights-row">
            {b.items.map((l) => (
              <div key={l.label} className="light-card">
                <TrafficLight on={l.on} arrow={l.arrow} size={104} />
                <div>
                  <b>{l.label}</b>
                  <p>{l.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'compare':
      return (
        <div className="block">
          {b.title && <h4>{b.title}</h4>}
          <div className="compare">
            {[b.left, b.right].map((c) => (
              <div key={c.title} className="compare-col">
                {c.sign && <SignView id={c.sign} size={70} title="" />}
                <b>{c.title}</b>
                <ul className="bullets">
                  {c.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      );

    case 'diagram':
      return <Intersection {...b.props} label={b.label} />;

    case 'widget': {
      const W = WIDGETS[b.name];
      return W ? <W /> : null;
    }

    case 'simple':
      return (
        <Callout kind="simple" icon="💬" title="بكلام بسيط">
          {b.text}
        </Callout>
      );

    case 'analogy':
      return (
        <div className="block">
          <Callout kind="analogy" icon="🧠" title={b.title ?? 'تخيّل أن...'}>
            {b.text}
          </Callout>
          {b.map && <Block b={{ t: 'table', head: b.head, rows: b.map }} />}
        </div>
      );

    case 'glossary':
      return (
        <div className="block">
          {b.title && <h4>{b.title}</h4>}
          <div className="gloss-grid">
            {b.items.map((g) => (
              <div key={g.term} className="gloss-card">
                <div className="gloss-top">
                  <span className="gloss-emoji" aria-hidden="true">
                    {g.emoji}
                  </span>
                  <b>{g.term}</b>
                </div>
                {g.also && <small className="gloss-also">ويسمّى أيضاً: {g.also}</small>}
                <p>{g.plain}</p>
                {g.like && <p className="gloss-like">🔎 يشبه: {g.like}</p>}
              </div>
            ))}
          </div>
        </div>
      );

    case 'flow':
      return (
        <div className="block">
          {b.title && <h4>{b.title}</h4>}
          <div className="flow" role="list">
            {b.items.map((st, i) => (
              <div key={st.title} role="listitem" className="flow-wrap">
                <div className="flow-step">
                  <span className="flow-ico" aria-hidden="true">
                    {st.emoji}
                  </span>
                  <div>
                    <b>{st.title}</b>
                    {st.text && <p>{st.text}</p>}
                  </div>
                </div>
                {i < b.items.length - 1 && (
                  <div className="flow-arrow" aria-hidden="true">
                    ⬇
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case 'recap':
      return (
        <aside className="callout recap">
          <div className="callout-icon" aria-hidden="true">
            ✨
          </div>
          <div>
            <b>{b.title ?? 'الخلاصة بجملة واحدة'}</b>
            <ul className="bullets">
              {b.items.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </div>
        </aside>
      );

    case 'match':
      return <TermMatch title={b.title} pairs={b.pairs} />;

    case 'tip':
      return (
        <Callout kind="tip" icon="📌" title="تذكّر">
          {b.text}
        </Callout>
      );
    case 'warn':
      return (
        <Callout kind="warn" icon="⚠️" title="انتبه">
          {b.text}
        </Callout>
      );
    case 'why':
      return (
        <Callout kind="why" icon="💡" title="لماذا؟">
          {b.text}
        </Callout>
      );
    default:
      return null;
  }
}

// active: رقم العنصر الذي تجري قراءته الآن (يُظلَّل ويُمرَّر إليه)
export default function Blocks({ blocks, active = null }) {
  const refs = useRef([]);
  useEffect(() => {
    if (typeof active === 'number') refs.current[active]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [active]);
  return (
    <div className="blocks">
      {blocks.map((b, i) => (
        <div
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={`bw ${active === i ? 'speaking' : ''}`}
        >
          <Block b={b} />
        </div>
      ))}
    </div>
  );
}
