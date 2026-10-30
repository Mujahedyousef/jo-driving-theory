export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ترتيب خيارات السؤال: صح/خطأ يبقى بترتيبه، والباقي يُخلط.
// نُرجع مصفوفة فهارس الخيارات الأصلية بالترتيب الذي سيُعرض.
export function optionOrder(q) {
  const idx = q.options.map((_, i) => i);
  return q.type === 'tf' ? idx : shuffle(idx);
}

export function formatTime(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

export const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

// أرقام عربية-هندية للعرض الجميل (اختياري)
export const nf = (n) => new Intl.NumberFormat('ar-EG-u-nu-latn').format(n);

export const DAY = 24 * 60 * 60 * 1000;
