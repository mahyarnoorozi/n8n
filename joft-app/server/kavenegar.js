/**
 * فراخوانی سرویس کاوه‌نگار برای ارسال کد یک‌بارمصرف.
 *
 * روش توصیه‌شده: «اعتبارسنجی / Verify Lookup»
 *   GET https://api.kavenegar.com/v1/{APIKEY}/verify/lookup.json?receptor={phone}&token={code}&template={template}&type={sms|call}
 * در پنل کاوه‌نگار باید یک «الگو» بسازی که در متنش %token قرار دارد، مثلاً:
 *   «کد تأیید شما در جفت: %token»
 *
 * روش جایگزین: ارسال پیامک ساده
 *   GET https://api.kavenegar.com/v1/{APIKEY}/sms/send.json?receptor={phone}&sender={sender}&message={message}
 *
 * مستندات: https://kavenegar.github.io/kavenegar_en/
 */

const BASE = 'https://api.kavenegar.com/v1';

export async function sendOtp(settings, phone, code) {
  const { kavenegarApiKey, template, sender, otpType, method } = settings;
  if (!kavenegarApiKey) {
    return { ok: false, error: 'no_api_key', message: 'کلید API کاوه‌نگار تنظیم نشده است.' };
  }

  let url;
  if (method === 'send') {
    const message = encodeURIComponent(`کد تأیید شما در جفت: ${code}`);
    url = `${BASE}/${kavenegarApiKey}/sms/send.json?receptor=${phone}&sender=${encodeURIComponent(
      sender || '',
    )}&message=${message}`;
  } else {
    url =
      `${BASE}/${kavenegarApiKey}/verify/lookup.json` +
      `?receptor=${phone}&token=${code}` +
      `&template=${encodeURIComponent(template)}&type=${otpType || 'sms'}`;
  }

  try {
    const res = await fetch(url, { method: 'GET' });
    const json = await res.json().catch(() => null);
    const status = json?.return?.status;
    if (status === 200) {
      return { ok: true, providerStatus: status, messageId: json?.entries?.[0]?.messageid };
    }
    return {
      ok: false,
      error: 'provider_error',
      providerStatus: status,
      message: json?.return?.message || 'خطا در ارسال پیامک از سمت کاوه‌نگار.',
    };
  } catch (e) {
    return { ok: false, error: 'network', message: 'ارتباط با کاوه‌نگار برقرار نشد.' };
  }
}

/** پیامِ فارسیِ متناظر با کدهای خطای رایج کاوه‌نگار برای نمایش در پنل. */
export function describeProviderStatus(status) {
  const map = {
    400: 'پارامترها ناقص است.',
    401: 'کلید API نامعتبر است.',
    402: 'عملیات ناموفق بود.',
    403: 'کد شناسایی (API Key) غیرفعال است.',
    404: 'متد یا الگو یافت نشد.',
    406: 'پارامترهای اجباری خالی‌اند.',
    411: 'گیرنده نامعتبر است.',
    412: 'فرستنده نامعتبر است.',
    418: 'اعتبار حساب کافی نیست.',
    422: 'داده‌ها به‌درستی کدگذاری نشده‌اند.',
    424: 'الگوی موردنظر یافت نشد.',
    426: 'برای این سرویس باید حساب را ارتقا دهید.',
  };
  return map[status] || `کد وضعیت: ${status}`;
}
