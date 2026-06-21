import { API_BASE_URL, DEMO_CODE, DEMO_MODE } from '@/config';

export type RequestOtpResult = { ok: boolean; demo?: boolean; devCode?: string };
export type VerifyOtpResult = { ok: boolean; token?: string };

class ApiError extends Error {}

async function post(path: string, body: unknown) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) {
    throw new ApiError(json.message || 'خطایی رخ داد. دوباره تلاش کن.');
  }
  return json;
}

/** درخواست ارسال کد یک‌بارمصرف به شمارهٔ موبایل. */
export async function requestOtp(phone: string): Promise<RequestOtpResult> {
  if (DEMO_MODE) return { ok: true, demo: true };
  return post('/api/auth/request-otp', { phone });
}

/** تأیید کد و گرفتن توکن کاربر. */
export async function verifyOtp(phone: string, code: string): Promise<VerifyOtpResult> {
  if (DEMO_MODE) {
    return { ok: code === DEMO_CODE, token: code === DEMO_CODE ? 'demo-token' : undefined };
  }
  try {
    const json = await post('/api/auth/verify-otp', { phone, code });
    return { ok: true, token: json.token };
  } catch {
    return { ok: false };
  }
}
