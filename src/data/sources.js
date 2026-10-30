// المصادر الرسمية التي بُنيت عليها الأسئلة الموثّقة (حقل source)
export const REG = (n) => `نظام قواعد السير والمرور على الطرق (2004) — م${n}`;
export const LAW = (n) => `قانون السير رقم 49 لسنة 2008 (المعدّل حتى 2023) — م${n}`;
export const LIC = (n) => `نظام ترخيص السواقين (2008) — م${n}`;

export const SOURCES = [
  {
    id: 'law',
    title: 'قانون السير رقم 49 لسنة 2008 وتعديلاته (حتى قانون معدّل رقم 18 لسنة 2023)',
    note: 'التعريفات، الرخص، المخالفات والعقوبات، الوقوف والحمولة وغيرها.',
    links: [
      { label: 'النص الكامل (jordan-lawyer.com)', url: 'https://jordan-lawyer.com/2021/10/06/jordanian-traffic-law/' },
      {
        label: 'نسخة وزارة الداخلية PDF (للمطابقة)',
        url: 'https://moi.gov.jo/ebv4.0/root_storage/ar/eb_list_page/%D9%82%D8%A7%D9%86%D9%88%D9%86_%D8%A7%D9%84%D8%B3%D9%8A%D8%B1-0.pdf',
      },
    ],
  },
  {
    id: 'reg',
    title: 'نظام قواعد السير والمرور على الطرق لسنة 2004',
    note: 'المسارب والتجاوز والأولويات والإشارات والوقوف والحوادث والمشاة. تعتبره المادة 53/ب من قانون 2008 ساري المفعول إلى أن يُعدَّل أو يُلغى.',
    links: [{ label: 'النص الكامل (jordanianlaw.com)', url: 'https://jordanianlaw.com/?p=5370' }],
  },
  {
    id: 'lic',
    title: 'نظام ترخيص السواقين لسنة 2008',
    note: 'فئات الرخص وشروطها وتصاريح القيادة.',
    links: [{ label: 'النص الكامل (jordanianlaw.com)', url: 'https://jordanianlaw.com/?p=4382' }],
  },
];

// تاريخ آخر مطابقة للنصوص أعلاه
export const SOURCES_CHECKED = '2026-10-27';
