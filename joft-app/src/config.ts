/**
 * پیکربندی اتصال اپ به بک‌اند.
 *
 * آدرس سرور از متغیر محیطی EXPO_PUBLIC_API_URL خوانده می‌شود. آن را در فایل
 * `.env` کنار app.json بگذار، مثلاً:
 *   EXPO_PUBLIC_API_URL=https://api.your-domain.com
 *
 * اگر خالی باشد، اپ در «حالت دمو» اجرا می‌شود: پیامکی ارسال نمی‌شود و کد ۱۲۳۴
 * پذیرفته می‌شود تا بشود بدون سرور هم اپ را دید و تست کرد.
 */
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

export const DEMO_MODE = API_BASE_URL.length === 0;

export const DEMO_CODE = '1234';

/**
 * کد دسترسیِ پنل مدیریتِ داخل اپ. برای امنیت بیشتر آن را در فایل `.env` تنظیم کن:
 *   EXPO_PUBLIC_ADMIN_CODE=یک‌کد‌دلخواه
 * اگر تنظیم نشده باشد، مقدار پیش‌فرض زیر استفاده می‌شود.
 */
export const ADMIN_CODE = process.env.EXPO_PUBLIC_ADMIN_CODE ?? '110110';
