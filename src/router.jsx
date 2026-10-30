import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// توجيه بروابط حقيقية (History API) ليتمكن محرك البحث من فهرسة كل صفحة.
// مثال: /topic/signs/?s=shapes  →  parts = ['topic','signs'], query.s = 'shapes'
const base = () => (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

export function parseUrl(pathname, search = '') {
  let p = pathname;
  const b = base();
  if (b && p.startsWith(b)) p = p.slice(b.length);
  return {
    parts: p.split('/').filter(Boolean),
    query: Object.fromEntries(new URLSearchParams(search)),
  };
}

/** يحوّل 'topic/signs?s=x' إلى '/topic/signs/?s=x' (مع مسار الأساس إن وُجد) */
export function toHref(to = '') {
  const [path, qs] = String(to).split('?');
  const clean = path.replace(/^\/+|\/+$/g, '');
  return `${base()}/${clean}${clean ? '/' : ''}${qs ? `?${qs}` : ''}`;
}

const Ctx = createContext({ parts: [], query: {}, navigate: () => {} });

export function RouterProvider({ url, children }) {
  const [route, setRoute] = useState(() => {
    if (url) {
      const [path, qs] = url.split('?');
      return parseUrl(path, qs);
    }
    return parseUrl(window.location.pathname, window.location.search);
  });

  // دعم الروابط القديمة المبنية على #/
  useEffect(() => {
    const h = window.location.hash;
    if (h.startsWith('#/')) {
      window.history.replaceState(null, '', toHref(h.slice(2)));
      setRoute(parseUrl(window.location.pathname, window.location.search));
    }
  }, []);

  useEffect(() => {
    const onPop = () => setRoute(parseUrl(window.location.pathname, window.location.search));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((to) => {
    window.history.pushState(null, '', toHref(to));
    setRoute(parseUrl(window.location.pathname, window.location.search));
    window.scrollTo({ top: 0 });
  }, []);

  const value = useMemo(() => ({ ...route, navigate }), [route, navigate]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useRoute = () => useContext(Ctx);

export function Link({ to, children, onClick, ...rest }) {
  const { navigate } = useContext(Ctx);
  return (
    <a
      href={toHref(to)}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || rest.target === '_blank') return;
        e.preventDefault();
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
