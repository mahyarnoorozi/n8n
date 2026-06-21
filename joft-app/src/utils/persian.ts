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

/**
 * بخش محلی شمارهٔ موبایل ایران را برمی‌گرداند: ۱۰ رقم بدون صفر/کد کشور.
 * چون در رابط کاربری «+۹۸» جدا نمایش داده می‌شود، شماره بدون صفر ابتدایی است
 * (مثل ۹۱۲۳۴۵۶۷۸۹). ورودی با ۰ ابتدایی یا ۹۸/۰۰۹۸ هم پذیرفته و نرمال می‌شود.
 */
function localPart(raw: string): string {
  let d = toEn(raw).replace(/\D/g, '');
  if (d.startsWith('0098')) d = d.slice(4);
  if (d.startsWith('98') && d.length >= 12) d = d.slice(2);
  if (d.startsWith('0')) d = d.slice(1);
  return d.slice(0, 10);
}

/** قالب‌بندی بین‌المللی استاندارد: «۹۱۲ ۳۴۵ ۶۷۸۹» (۳-۳-۴) برای نمایش کنار +۹۸ */
export function formatIranPhone(raw: string): string {
  const d = localPart(raw);
  const parts = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 10)].filter(Boolean);
  return toFa(parts.join(' '));
}

/** معتبر است اگر بخش محلی ۱۰ رقم و با ۹ شروع شود. */
export function isValidIranPhone(raw: string): boolean {
  return /^9\d{9}$/.test(localPart(raw));
}

/** نسخهٔ یکدست برای ذخیره/ارسال به سرور: «۰۹xxxxxxxxx». اگر نامعتبر بود خالی. */
export function normalizeIranPhone(raw: string): string {
  const d = localPart(raw);
  return /^9\d{9}$/.test(d) ? '0' + d : '';
}
