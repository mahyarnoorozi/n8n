/**
 * پالت رنگی اپلیکیشن «جفت»
 *
 * رنگِ قالب (template) رنگی آرام و لاکچری از خانوادهٔ نیلی/بنفش تیره است تا
 * کل برنامه قرمز و زننده نشود. رنگ کسب‌وکار (قرمز #EE1844) فقط به‌عنوان
 * «اکسنت» در دکمه‌های اصلی، قلب‌ها، نشانه‌ها و جاهای خاص استفاده می‌شود
 * تا برنامه خوش‌رنگ و چشم‌نواز شود.
 */
export const colors = {
  // رنگ برند کسب‌وکار (اکسنت قرمز) — کم و هدفمند استفاده می‌شود
  accent: '#EE1844',
  accentDark: '#C70F35',
  accentSoft: '#FCE3E8',
  accentTint: '#FEF1F3',

  // رنگ قالب اصلی (نیلی/بنفش تیره) — حسِ آرام و حرفه‌ای
  primary: '#2B2A4C',
  primarySoft: '#4A4869',
  primaryTint: '#EFEEF6',
  lavender: '#F4F0FA',

  // پس‌زمینه و سطح‌ها (کرمِ گرم برای حسِ صمیمی)
  bg: '#FBF8F6',
  surface: '#FFFFFF',
  surfaceAlt: '#F6F3FB',

  // متن
  text: '#1E1B2E',
  textMuted: '#736F86',
  textFaint: '#A6A2B5',
  textInverse: '#FFFFFF',

  // وضعیت‌ها
  border: '#ECE8F1',
  success: '#2BB673',
  warning: '#F5A623',
  star: '#F5B301',

  // پس‌زمینهٔ کارت‌های دسته‌بندی (پاستل و ملایم)
  catPink: '#FCE7EC',
  catPeach: '#FCEFE3',
  catMint: '#E4F5EC',
  catSky: '#E5EEFB',
  catLilac: '#EEEAFA',
  catSand: '#F7F0E2',
} as const;

export type ColorKey = keyof typeof colors;
