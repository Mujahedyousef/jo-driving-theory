// يولّد أيقونات PNG للتطبيق (192 / 512 / 180) بدون أي حزم خارجية.
// التشغيل: node scripts/make-icons.mjs
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const TEAL = [15, 118, 110];
const YELLOW = [244, 180, 0];
const WHITE = [255, 255, 255];

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};

function inTriangle(px, py, [ax, ay], [bx, by], [cx, cy]) {
  const d = (x1, y1, x2, y2, x3, y3) => (x1 - x3) * (y2 - y3) - (x2 - x3) * (y1 - y3);
  const d1 = d(px, py, ax, ay, bx, by);
  const d2 = d(px, py, bx, by, cx, cy);
  const d3 = d(px, py, cx, cy, ax, ay);
  const neg = d1 < 0 || d2 < 0 || d3 < 0;
  const pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
}

// نقطة (x,y) ضمن مربع 0..1: خلفية خضراء وشاخصة مثلثة بإطار أصفر
function sample(x, y, scale, rounded) {
  if (rounded) {
    const r = 0.2;
    const dx = Math.max(Math.abs(x - 0.5) - (0.5 - r), 0);
    const dy = Math.max(Math.abs(y - 0.5) - (0.5 - r), 0);
    if (dx * dx + dy * dy > r * r) return [0, 0, 0, 0];
  }
  const tx = (px) => 0.5 + (px - 0.5) * scale;
  const ty = (py) => 0.5 + (py - 0.5) * scale;
  const outer = [[tx(0.5), ty(0.16)], [tx(0.86), ty(0.8)], [tx(0.14), ty(0.8)]];
  const cx = (outer[0][0] + outer[1][0] + outer[2][0]) / 3;
  const cy = (outer[0][1] + outer[1][1] + outer[2][1]) / 3;
  const inner = outer.map(([px, py]) => [cx + (px - cx) * 0.72, cy + (py - cy) * 0.72]);
  if (inTriangle(x, y, ...inner)) return [...WHITE, 255];
  if (inTriangle(x, y, ...outer)) return [...YELLOW, 255];
  return [...TEAL, 255];
}

function png(size, scale, rounded) {
  const SS = 3; // تنعيم الحواف
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const [pr, pg, pb, pa] = sample((x + (sx + 0.5) / SS) / size, (y + (sy + 0.5) / SS) / size, scale, rounded);
          r += pr * pa; g += pg * pa; b += pb * pa; a += pa;
        }
      }
      const o = y * (size * 4 + 1) + 1 + x * 4;
      const n = SS * SS;
      raw[o] = a ? Math.round(r / a) : 0;
      raw[o + 1] = a ? Math.round(g / a) : 0;
      raw[o + 2] = a ? Math.round(b / a) : 0;
      raw[o + 3] = Math.round(a / n);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const out = path.resolve('public');
fs.mkdirSync(out, { recursive: true });
// أيقونات «maskable» بخلفية كاملة، والمثلث أصغر ليبقى ضمن المنطقة الآمنة
fs.writeFileSync(path.join(out, 'icon-192.png'), png(192, 0.78, false));
fs.writeFileSync(path.join(out, 'icon-512.png'), png(512, 0.78, false));
fs.writeFileSync(path.join(out, 'apple-touch-icon.png'), png(180, 0.9, false));
console.log('أُنشئت الأيقونات في', out);
