import { SITE } from './site.config';

/** العنوان المعتمد للموقع (الأصل + مسار الأساس). يأخذ قيمة SITE_URL وقت البناء إن وُجدت. */
export const SITE_ORIGIN =
  (typeof __SITE_URL__ === 'string' ? __SITE_URL__ : SITE.url).replace(/\/+$/, '') +
  (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
