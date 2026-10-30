// أدوات صغيرة لكتابة الأسئلة بسرعة.
// extra يقبل: sign, marking, withCar, light, diagram, ref (رقم قسم الدرس للمراجعة)

export const mcq = (q, options, answer, why, extra = {}) => ({
  type: 'mcq',
  q,
  options,
  answer,
  why,
  ...extra,
});

export const tf = (q, isTrue, why, extra = {}) => ({
  type: 'tf',
  q,
  options: ['صح', 'خطأ'],
  answer: isTrue ? 0 : 1,
  why,
  ...extra,
});
