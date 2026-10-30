import { useEffect, useState } from 'react';
import { SITE } from '../site.config';
import { Link, toHref } from '../router';

const currentUrl = (path) =>
  typeof window !== 'undefined'
    ? `${window.location.origin}${path ?? window.location.pathname}`
    : `${SITE.url}${path ?? '/'}`;

/** أزرار المشاركة: واتساب (الأكثر استعمالاً)، تلغرام، فيسبوك، نسخ الرابط، ومشاركة الهاتف */
export function ShareBar({ text, path, label = 'شارك الموقع مع من يحتاجه' }) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  useEffect(() => setCanShare(typeof navigator !== 'undefined' && !!navigator.share), []);

  const url = currentUrl(path);
  const msg = text ?? 'موقع مجاني للتحضير لفحص السواقة النظري في الأردن: دروس مبسّطة وأسئلة بالشرح واختبار تجريبي';
  const enc = encodeURIComponent;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('انسخ الرابط:', url);
    }
  };

  return (
    <div className="share-bar" role="group" aria-label={label}>
      <span className="share-label">{label}</span>
      <div className="share-btns">
        <a className="share-btn wa" href={`https://wa.me/?text=${enc(`${msg}\n${url}`)}`} target="_blank" rel="noopener noreferrer">
          واتساب
        </a>
        <a className="share-btn tg" href={`https://t.me/share/url?url=${enc(url)}&text=${enc(msg)}`} target="_blank" rel="noopener noreferrer">
          تلغرام
        </a>
        <a className="share-btn fb" href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`} target="_blank" rel="noopener noreferrer">
          فيسبوك
        </a>
        <button type="button" className="share-btn" onClick={copy}>
          {copied ? '✓ تم النسخ' : '🔗 نسخ الرابط'}
        </button>
        {canShare && (
          <button type="button" className="share-btn" onClick={() => navigator.share({ title: SITE.name, text: msg, url }).catch(() => {})}>
            📤 مشاركة
          </button>
        )}
      </div>
    </div>
  );
}

/** زر «ثبّت التطبيق» يظهر فقط عندما يسمح المتصفح بالتثبيت */
export function InstallButton() {
  const [ev, setEv] = useState(null);
  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setEv(e);
    };
    const onInstalled = () => setEv(null);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);
  if (!ev) return null;
  return (
    <button
      type="button"
      className="btn small"
      onClick={async () => {
        ev.prompt();
        await ev.userChoice;
        setEv(null);
      }}
    >
      📲 ثبّت التطبيق على جهازك
    </button>
  );
}

/** مسار الصفحة: يفيد الزائر ومحركات البحث. آخر عنصر بلا رابط */
export function Breadcrumbs({ items }) {
  return (
    <nav className="crumbs" aria-label="مسار الصفحة">
      <ol>
        {items.map(([label, to], i) => (
          <li key={label}>
            {to !== undefined && i < items.length - 1 ? <Link to={to}>{label}</Link> : <span aria-current="page">{label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export { toHref };
