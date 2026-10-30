import { SITE } from './site.config';
import { SITE_ORIGIN } from './siteOrigin';
import { fullTitle } from './seo';

function upsert(selector, create) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  return el;
}
const meta = (attr, key, content) => {
  const el = upsert(`meta[${attr}="${key}"]`, () => {
    const m = document.createElement('meta');
    m.setAttribute(attr, key);
    return m;
  });
  el.setAttribute('content', content);
};

/** يحدّث وسوم <head> عند التنقل داخل التطبيق (الصفحة الأولى تأتي جاهزة من البناء) */
export function applyMeta(m) {
  const origin = SITE_ORIGIN;
  const title = fullTitle(m);
  const canonical = `${origin}${m.canonicalPath}`;
  document.title = title;
  meta('name', 'description', m.description);
  meta('name', 'robots', m.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large');
  upsert('link[rel="canonical"]', () => {
    const l = document.createElement('link');
    l.rel = 'canonical';
    return l;
  }).href = canonical;
  meta('property', 'og:title', title);
  meta('property', 'og:description', m.description);
  meta('property', 'og:url', canonical);
  meta('property', 'og:type', m.ogType);
  meta('property', 'og:image', `${origin}/og-image.jpg`);
  meta('name', 'twitter:title', title);
  meta('name', 'twitter:description', m.description);
  const ld = upsert('script#ld-json', () => {
    const s = document.createElement('script');
    s.id = 'ld-json';
    s.type = 'application/ld+json';
    return s;
  });
  ld.textContent = m.jsonLd.length ? JSON.stringify(m.jsonLd.length === 1 ? m.jsonLd[0] : m.jsonLd) : '';
}

export { SITE };
