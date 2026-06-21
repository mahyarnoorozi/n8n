import { toFa } from './persian';

/**
 * تبدیل تاریخ میلادی به شمسی (جلالی) بدون نیاز به کتابخانهٔ خارجی.
 * الگوریتم استاندارد تبدیل گرگوری به جلالی.
 */
function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return [jy, jm, jd];
}

/** تبدیل تاریخ شمسی (جلالی) به میلادی — برای ذخیرهٔ تاریخِ انتخاب‌شده. */
export function jalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  let gy = jy <= 979 ? 621 : 1600;
  jy -= jy <= 979 ? 0 : 979;
  let days =
    365 * jy +
    Math.floor(jy / 33) * 8 +
    Math.floor(((jy % 33) + 3) / 4) +
    78 +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  gy += 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const leap = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
  const monthDays = [0, 31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  for (gm = 1; gm <= 12; gm++) {
    if (gd <= monthDays[gm]) break;
    gd -= monthDays[gm];
  }
  return [gy, gm, gd];
}

/** ساخت شیء Date از تاریخ شمسی. */
export function jalaliToDate(jy: number, jm: number, jd: number): Date {
  const [gy, gm, gd] = jalaliToGregorian(jy, jm, jd);
  return new Date(gy, gm - 1, gd);
}

/** اجزای تاریخ شمسیِ یک Date به‌صورت عددی. */
export function toJalaliParts(date: Date): { jy: number; jm: number; jd: number } {
  const [jy, jm, jd] = gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return { jy, jm, jd };
}

export const JALALI_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

export const JALALI_WEEKDAYS = ['شنبه', 'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];

/** تاریخ شمسی کامل مثل «۲۱ خرداد ۱۴۰۵» از یک شیء Date */
export function formatJalali(date: Date): string {
  const [jy, jm, jd] = gregorianToJalali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
  return `${toFa(jd)} ${JALALI_MONTHS[jm - 1]} ${toFa(jy)}`;
}

/** روز و ماهِ شمسی به‌صورت کوتاه برای کارت تاریخ‌ها */
export function jalaliDayMonth(date: Date): { day: string; month: string } {
  const [, jm, jd] = gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return { day: toFa(jd), month: JALALI_MONTHS[jm - 1] };
}

/** نام روز هفته به فارسی */
export function jalaliWeekday(date: Date): string {
  // getDay(): 0=یک‌شنبه میلادی؛ هفتهٔ ایرانی از شنبه شروع می‌شود
  const map = [1, 2, 3, 4, 5, 6, 0]; // یک‌شنبه..شنبه → اندیس آرایهٔ بالا
  return JALALI_WEEKDAYS[map[date.getDay()]];
}

/** شمارش تعداد روزهای سپری‌شده از یک تاریخ تا امروز */
export function daysSince(date: Date): number {
  const ms = Date.now() - date.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}
