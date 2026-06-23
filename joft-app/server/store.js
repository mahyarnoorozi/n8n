import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

/** تنظیماتِ ذخیره‌شده روی سرور (کلید API کاوه‌نگار اینجا امن می‌ماند). */
const defaultSettings = {
  kavenegarApiKey: '', // از پنل ادمین وارد می‌شود
  template: 'joft-verify', // نام الگوی اعتبارسنجی در پنل کاوه‌نگار
  sender: '', // در صورت استفاده از ارسال ساده (sms/send)
  otpType: 'sms', // 'sms' یا 'call'
  method: 'lookup', // 'lookup' (توصیه‌شده) یا 'send'
  otpLength: 4,
  otpTtlSeconds: 120,
};

export function readSettings() {
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf8');
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return { ...defaultSettings };
  }
}

export function writeSettings(patch) {
  const next = { ...readSettings(), ...patch };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(next, null, 2), 'utf8');
  return next;
}

export function isConfigured() {
  return Boolean(readSettings().kavenegarApiKey);
}

/** کلید API را برای نمایش در پنل ماسک می‌کند (فقط چند رقم آخر). */
export function maskKey(key) {
  if (!key) return '';
  if (key.length <= 8) return '••••';
  return '••••••••' + key.slice(-6);
}

// ---- ذخیرهٔ موقتِ کدهای یک‌بارمصرف (در حافظه) ----
const otpStore = new Map(); // phone -> { hash, expires, attempts }
const rateStore = new Map(); // phone -> { lastSentAt, countHour, windowStart }

function hashCode(phone, code) {
  return crypto.createHash('sha256').update(`${phone}:${code}`).digest('hex');
}

export function generateCode(length = 4) {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return String(crypto.randomInt(min, max + 1));
}

export function saveOtp(phone, code, ttlSeconds) {
  otpStore.set(phone, {
    hash: hashCode(phone, code),
    expires: Date.now() + ttlSeconds * 1000,
    attempts: 0,
  });
}

/** نتیجه: 'ok' | 'expired' | 'mismatch' | 'too_many' | 'not_found' */
export function checkOtp(phone, code) {
  const rec = otpStore.get(phone);
  if (!rec) return 'not_found';
  if (Date.now() > rec.expires) {
    otpStore.delete(phone);
    return 'expired';
  }
  if (rec.attempts >= 5) {
    otpStore.delete(phone);
    return 'too_many';
  }
  rec.attempts += 1;
  if (rec.hash !== hashCode(phone, code)) return 'mismatch';
  otpStore.delete(phone);
  return 'ok';
}

/** محدودسازی نرخ: حداکثر یک ارسال هر ۶۰ ثانیه و ۵ ارسال در ساعت. */
export function rateLimit(phone) {
  const now = Date.now();
  const rec = rateStore.get(phone) ?? { lastSentAt: 0, countHour: 0, windowStart: now };
  if (now - rec.windowStart > 3600_000) {
    rec.countHour = 0;
    rec.windowStart = now;
  }
  if (now - rec.lastSentAt < 60_000) {
    return { allowed: false, retryAfter: Math.ceil((60_000 - (now - rec.lastSentAt)) / 1000) };
  }
  if (rec.countHour >= 5) {
    return { allowed: false, retryAfter: Math.ceil((3600_000 - (now - rec.windowStart)) / 1000) };
  }
  rec.lastSentAt = now;
  rec.countHour += 1;
  rateStore.set(phone, rec);
  return { allowed: true };
}

// ---- لاگِ سادهٔ درخواست‌ها برای نمایش در پنل ادمین (بدون افشای کد) ----
const logs = [];
export function addLog(entry) {
  logs.unshift({ ...entry, at: new Date().toISOString() });
  if (logs.length > 100) logs.pop();
}
export function getLogs() {
  return logs;
}
export function maskPhone(phone) {
  return phone.replace(/(\d{4})(\d{3})(\d{4})/, '$1•••$3');
}
