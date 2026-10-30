// يحوّل كل صفحة من صفحات الموقع إلى ملف HTML ثابت يحوي المحتوى الكامل والوسوم (SEO)،
// ثم يكتب sitemap.xml وrobots.txt وصفحة 404. يعمل بعد: vite build ثم vite build --ssr
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve('.');
const dist = path.join(root, 'dist');
const mod = await import(pathToFileURL(path.join(root, 'dist-server', 'entry-server.js')).href);
const { render, metaFor, allRoutes, trackForRoute, fullTitle, SITE } = mod;

const SITE_URL = (process.env.SITE_URL || SITE.url).replace(/\/+$/, '');
const BASE = process.env.BASE_PATH ? `/${process.env.BASE_PATH.replace(/^\/+|\/+$/g, '')}/` : '/';
// العنوان الكامل للروابط المطلقة (يشمل مسار الأساس عند النشر في مجلد فرعي)
const ORIGIN = SITE_URL + (BASE === '/' ? '' : BASE.replace(/\/$/, ''));
if (!process.env.SITE_URL && SITE.url.includes('jo-driving-theory.pages.dev')) {
  console.warn(
    '⚠️  لم تضبط عنوان موقعك بعد. اكتب عنوانك الحقيقي في src/site.config.js (url) أو شغّل: SITE_URL=https://موقعك npm run build',
  );
}

const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const json = (o) => JSON.stringify(o).replace(/</g, '\\u003c');

// خطوط عربية مهمة للعرض الأول: نحمّلها مبكراً
const assets = fs.existsSync(path.join(dist, 'assets')) ? fs.readdirSync(path.join(dist, 'assets')) : [];
const fontPreloads = ['cairo-arabic-400-normal', 'cairo-arabic-700-normal']
  .map((n) => assets.find((a) => a.startsWith(n) && a.endsWith('.woff2')))
  .filter(Boolean)
  .map((f) => `<link rel="preload" href="${BASE}assets/${f}" as="font" type="font/woff2" crossorigin />`);

function headTags(m) {
  const canonical = `${ORIGIN}${m.canonicalPath}`;
  const title = fullTitle(m);
  const img = `${ORIGIN}/og-image.jpg`;
  const tags = [
    `<meta name="description" content="${esc(m.description)}" />`,
    `<meta name="robots" content="${m.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:site_name" content="${esc(SITE.name)}" />`,
    `<meta property="og:locale" content="${SITE.locale}" />`,
    `<meta property="og:type" content="${m.ogType}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(m.description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${img}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(SITE.name)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(m.description)}" />`,
    `<meta name="twitter:image" content="${img}" />`,
    ...fontPreloads,
  ];
  if (SITE.googleSiteVerification) tags.push(`<meta name="google-site-verification" content="${esc(SITE.googleSiteVerification)}" />`);
  if (SITE.bingSiteVerification) tags.push(`<meta name="msvalidate.01" content="${esc(SITE.bingSiteVerification)}" />`);
  if (SITE.cloudflareAnalyticsToken) {
    tags.push(
      `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${esc(SITE.cloudflareAnalyticsToken)}"}'></script>`,
    );
  }
  tags.push(`<script type="application/ld+json" id="ld-json">${m.jsonLd.length ? json(m.jsonLd.length === 1 ? m.jsonLd[0] : m.jsonLd) : ''}</script>`);
  return { title, tags: tags.join('\n    ') };
}

function page(parts, { body }) {
  const m = metaFor(parts, ORIGIN);
  const { title, tags } = headTags(m);
  const html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace('<!--seo-->', tags)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
  return { html, m };
}

function write(parts, html) {
  const dir = path.join(dist, ...parts);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}

const { ssr, shell } = allRoutes();
const sitemap = [];
const today = new Date().toISOString().slice(0, 10);

for (const parts of ssr) {
  const url = `/${parts.join('/')}${parts.length ? '/' : ''}`;
  const { html, m } = page(parts, { body: render(url, trackForRoute(parts)) });
  write(parts, html);
  if (!m.noindex && m.canonicalPath === m.path) {
    const [a] = parts;
    const priority = !a ? '1.0' : a === 'track' ? '0.9' : a === 'topic' ? '0.8' : a === 'questions' ? '0.7' : '0.5';
    const changefreq = !a || a === 'track' ? 'weekly' : 'monthly';
    sitemap.push(`  <url><loc>${ORIGIN}${m.path}</loc><lastmod>${today}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`);
  }
}

for (const parts of shell) write(parts, page(parts, { body: '' }).html);

// صفحة 404: تعرض رسالة الصفحة غير الموجودة وفيها التطبيق كاملاً
fs.writeFileSync(path.join(dist, '404.html'), page(['404'], { body: render('/404/', 'car') }).html);

fs.writeFileSync(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap.join('\n')}\n</urlset>\n`,
);
fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`);

console.log(`✓ تم توليد ${ssr.length + shell.length + 1} صفحة ثابتة، و${sitemap.length} رابطاً في sitemap.xml`);
console.log(`  العنوان المعتمد: ${ORIGIN}`);
