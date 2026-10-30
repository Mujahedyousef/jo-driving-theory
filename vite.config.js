import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { SITE } from './src/site.config.js';

// BASE_PATH: عند النشر في مجلد فرعي (مثل GitHub Pages لمشروع) اكتبه هكذا: BASE_PATH=/اسم-المستودع/
const base = process.env.BASE_PATH ? `/${process.env.BASE_PATH.replace(/^\/+|\/+$/g, '')}/` : '/';

export default defineConfig({
  base,
  plugins: [react()],
  define: { __SITE_URL__: JSON.stringify(process.env.SITE_URL || SITE.url) },
  server: { port: 5180, host: true },
  preview: { port: 4173, host: true },
  build: { chunkSizeWarningLimit: 1200 },
});
