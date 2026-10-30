// يفحص المحتوى: صحة الأسئلة، وجود الشواخص، روابط الدروس، وحجم بنك كل مسار.
// التشغيل: npm run check
import { createServer } from 'vite';

const MARKINGS = new Set(['dashed', 'solid', 'doubleSolid', 'solidDashed', 'stopLine', 'zebra', 'arrowStraight', 'arrowRight', 'arrowLeft', 'yellowCurb']);
const BLOCKS = new Set(['p', 'list', 'steps', 'table', 'signs', 'markings', 'lights', 'compare', 'diagram', 'widget', 'tip', 'warn', 'why', 'simple', 'analogy', 'glossary', 'flow', 'recap', 'match']);
const WIDGETS = new Set(['stopping', 'stoppingHeavy', 'strokes', 'blindspots', 'carparts', 'truckparts', 'airgauge', 'dashboard']);

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const errors = [];
const warns = [];
const err = (m) => errors.push(m);

try {
  const data = await server.ssrLoadModule('/src/data/index.js');
  const { getSign } = await server.ssrLoadModule('/src/components/Signs.jsx');
  const { TOPICS, TRACKS, EXAM, TOPIC_BY_ID, trackQuestions } = data;

  const seen = new Set();
  let sourced = 0;
  for (const t of TOPICS) {
    const sectionIds = new Set(t.sections.map((s) => s.id));
    if (sectionIds.size !== t.sections.length) err(`${t.id}: أرقام دروس مكررة`);

    for (const s of t.sections) {
      if (s.checks.length < 2) warns.push(`${t.id}.${s.id}: أقل من سؤالين للفهم`);
      for (const b of s.blocks) {
        if (!BLOCKS.has(b.t)) err(`${t.id}.${s.id}: نوع عنصر غير معروف "${b.t}"`);
        if (b.t === 'signs') for (const it of b.items) if (!getSign(it.id)) err(`${t.id}.${s.id}: شاخصة غير موجودة "${it.id}"`);
        if (b.t === 'compare') for (const c of [b.left, b.right]) if (c.sign && !getSign(c.sign)) err(`${t.id}.${s.id}: شاخصة غير موجودة "${c.sign}"`);
        if (b.t === 'markings') for (const m of b.items) if (!MARKINGS.has(m.kind)) err(`${t.id}.${s.id}: علامة أرضية غير معروفة "${m.kind}"`);
        if (b.t === 'widget' && !WIDGETS.has(b.name)) err(`${t.id}.${s.id}: أداة غير معروفة "${b.name}"`);
        if (b.t === 'match' && (!Array.isArray(b.pairs) || b.pairs.length < 3 || b.pairs.some((p) => p.length !== 2))) err(`${t.id}.${s.id}: لعبة التوصيل تحتاج 3 أزواج على الأقل [كلمة، معنى]`);
        if (b.t === 'glossary' && new Set(b.items.map((g) => g.term)).size !== b.items.length) err(`${t.id}.${s.id}: مصطلحات مكررة في القاموس`);
        if (b.t === 'flow' && new Set(b.items.map((g) => g.title)).size !== b.items.length) err(`${t.id}.${s.id}: خطوات مكررة في المخطط`);
        if (b.t === 'analogy' && b.map && b.map.some((r) => r.length !== b.head.length)) err(`${t.id}.${s.id}: صف تشبيه بعدد خانات مختلف`);
        if (b.t === 'table') for (const r of b.rows) if (r.length !== b.head.length) err(`${t.id}.${s.id}: صف جدول بعدد خانات مختلف عن العناوين (${r[0]})`);
        if (b.t === 'table' && new Set(b.rows.map((r) => r[0])).size !== b.rows.length) err(`${t.id}.${s.id}: صفوف جدول بعنوان أول مكرر`);
      }
    }

    for (const q of t.all) {
      const where = q.id;
      if (seen.has(q.id)) err(`${where}: معرّف مكرر`);
      seen.add(q.id);
      if (!q.q?.trim()) err(`${where}: نص السؤال فارغ`);
      if (!Array.isArray(q.options) || q.options.length < 2) err(`${where}: خيارات غير كافية`);
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) err(`${where}: فهرس الجواب خارج المدى`);
      if (!q.why?.trim()) err(`${where}: لا يوجد شرح`);
      if (new Set(q.options).size !== q.options.length) err(`${where}: خيارات مكررة`);
      if (q.sign && !getSign(q.sign)) err(`${where}: شاخصة غير موجودة "${q.sign}"`);
      if (q.marking && !MARKINGS.has(q.marking)) err(`${where}: علامة أرضية غير معروفة "${q.marking}"`);
      if (q.ref && !sectionIds.has(q.ref)) err(`${where}: ref يشير إلى درس غير موجود "${q.ref}"`);
      if (t.requireSource && !q.source) err(`${where}: الجزء يشترط مصدراً (source) ولا يوجد`);
      if (q.source) sourced += 1;
    }
  }

  console.log('\nالمسارات:');
  for (const tr of TRACKS) {
    for (const id of [...tr.topics, ...tr.core]) if (!TOPIC_BY_ID[id]) err(`المسار ${tr.id}: جزء غير موجود "${id}"`);
    const pool = trackQuestions(tr).length;
    const own = tr.topics.reduce((n, id) => n + TOPIC_BY_ID[id].all.length, 0);
    console.log(`  ${tr.id.padEnd(6)} أجزاء=${tr.topics.length} مشترك=${tr.core.length} أسئلة المسار=${own} بنك الاختبار=${pool}`);
    if (pool < EXAM.count) err(`المسار ${tr.id}: بنك الأسئلة (${pool}) أقل من عدد أسئلة الاختبار (${EXAM.count})`);
  }

  console.log(`\nالأسئلة الموثّقة بمصدر: ${sourced} من ${seen.size}`);
  console.log('\nالأجزاء:');
  for (const t of TOPICS) console.log(`  ${t.id.padEnd(16)} دروس=${t.sections.length} أسئلة=${t.all.length}`);
} finally {
  await server.close();
}

if (warns.length) console.log('\nتنبيهات:\n  ' + warns.join('\n  '));
if (errors.length) {
  console.error('\nأخطاء:\n  ' + errors.join('\n  '));
  process.exit(1);
}
console.log('\n✓ المحتوى سليم');
