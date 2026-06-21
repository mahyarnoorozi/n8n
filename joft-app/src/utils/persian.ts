/** تبدیل ارقام انگلیسی به فارسی برای نمایش بهتر به کاربر ایرانی */
const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toFa(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

/** تبدیل ارقام فارسی/عربی به انگلیسی (برای ورودی شمارهٔ تلفن) */
export function toEn(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

/** قالب‌بندی شمارهٔ موبایل ایران مثل ۰۹۱۲ ۳۴۵ ۶۷۸۹ */
export function formatIranPhone(raw: string): string {
  const digits = toEn(raw).replace(/\D/g, '').slice(0, 11);
  const parts = [digits.slice(0, 4), digits.slice(4, 7), digits.slice(7, 11)].filter(Boolean);
  return toFa(parts.join(' '));
}

/** بررسی معتبر بودن شمارهٔ موبایل ایران (۰۹xxxxxxxxx) */
export function isValidIranPhone(raw: string): boolean {
  const digits = toEn(raw).replace(/\D/g, '');
  return /^09\d{9}$/.test(digits);
}
