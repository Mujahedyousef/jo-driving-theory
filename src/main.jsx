import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/cairo/arabic-400.css';
import '@fontsource/cairo/arabic-600.css';
import '@fontsource/cairo/arabic-700.css';
import '@fontsource/cairo/arabic-800.css';
import '@fontsource/cairo/latin-400.css';
import '@fontsource/cairo/latin-600.css';
import '@fontsource/cairo/latin-700.css';
import '@fontsource/cairo/latin-800.css';
import './styles.css';
import './styles-explain.css';
import './styles-site.css';
import App from './App';
import { RouterProvider, parseUrl } from './router';
import { ProgressProvider } from './store';

// صفحة /track/heavy/ تفرض الفئة عند أول عرض
const first = parseUrl(window.location.pathname, window.location.search).parts;
const initialTrack = first[0] === 'track' ? first[1] : undefined;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider>
      <ProgressProvider initialTrack={initialTrack}>
        <App />
      </ProgressProvider>
    </RouterProvider>
  </StrictMode>,
);

// تسجيل خدمة العمل دون اتصال في النسخة المبنية فقط (حتى لا تتداخل مع التطوير)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      /* غير مدعومة: الموقع يعمل بدونها */
    });
  });
}
