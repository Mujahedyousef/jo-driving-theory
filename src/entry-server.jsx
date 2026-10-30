import { renderToString } from 'react-dom/server';
import { RouterProvider } from './router';
import { ProgressProvider } from './store';
import App from './App';

export { metaFor, allRoutes, trackForRoute, fullTitle } from './seo';
export { SITE } from './site.config';

/** يرسم صفحة إلى HTML ثابت (يُستخدم عند البناء فقط) */
export function render(url, trackId) {
  return renderToString(
    <RouterProvider url={url}>
      <ProgressProvider initialTrack={trackId}>
        <App />
      </ProgressProvider>
    </RouterProvider>,
  );
}
