import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describeProviderStatus, sendOtp } from './kavenegar.js';
import {
  addLog,
  checkOtp,
  generateCode,
  getLogs,
  isConfigured,
  maskKey,
  maskPhone,
  rateLimit,
  readSettings,
  saveOtp,
  writeSettings,
} from './store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 4000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin1234';
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const DEV_RETURN_CODE = process.env.DEV_RETURN_CODE === '1'; // فقط برای تست محلی

if (ADMIN_PASSWORD === 'admin1234') {
  console.warn('⚠️  رمز پیش‌فرض ادمین فعال است. حتماً ADMIN_PASSWORD را در .env تنظیم کن.');
}

const app = express();
app.use(cors());
app.use(express.json());

const isIranPhone = (p) => /^09\d{9}$/.test(p);

// ---------- سلامت سرویس ----------
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, configured: isConfigured() });
});

// ---------- درخواست کد یک‌بارمصرف ----------
app.post('/api/auth/request-otp', async (req, res) => {
  const phone = String(req.body?.phone || '').trim();
  if (!isIranPhone(phone)) {
    return res.status(400).json({ ok: false, error: 'invalid_phone', message: 'شمارهٔ موبایل نامعتبر است.' });
  }

  const rl = rateLimit(phone);
  if (!rl.allowed) {
    return res
      .status(429)
      .json({ ok: false, error: 'rate_limited', retryAfter: rl.retryAfter, message: 'کمی صبر کن و دوباره تلاش کن.' });
  }

  const settings = readSettings();
  const code = generateCode(settings.otpLength);
  saveOtp(phone, code, settings.otpTtlSeconds);

  // اگر کلید API تنظیم نشده باشد، حالت دمو: کد ارسال نمی‌شود ولی جریان کار می‌کند.
  if (!settings.kavenegarApiKey) {
    addLog({ phone: maskPhone(phone), status: 'demo', note: 'بدون کلید API' });
    return res.json({
      ok: true,
      demo: true,
      message: 'حالت دمو: کلید کاوه‌نگار تنظیم نشده. کد در سرور ساخته شد.',
      ...(DEV_RETURN_CODE ? { devCode: code } : {}),
    });
  }

  const result = await sendOtp(settings, phone, code);
  if (!result.ok) {
    addLog({ phone: maskPhone(phone), status: 'failed', note: result.error });
    return res.status(502).json({
      ok: false,
      error: result.error,
      message: result.message || describeProviderStatus(result.providerStatus),
    });
  }

  addLog({ phone: maskPhone(phone), status: 'sent', messageId: result.messageId });
  res.json({ ok: true, ...(DEV_RETURN_CODE ? { devCode: code } : {}) });
});

// ---------- تأیید کد و صدور توکن ----------
app.post('/api/auth/verify-otp', (req, res) => {
  const phone = String(req.body?.phone || '').trim();
  const code = String(req.body?.code || '').trim();
  if (!isIranPhone(phone) || !/^\d{4,6}$/.test(code)) {
    return res.status(400).json({ ok: false, error: 'invalid_input' });
  }

  const result = checkOtp(phone, code);
  const messages = {
    not_found: 'کدی برای این شماره ثبت نشده. دوباره درخواست بده.',
    expired: 'کد منقضی شده. کد تازه بگیر.',
    too_many: 'تعداد تلاش زیاد شد. کد تازه بگیر.',
    mismatch: 'کد واردشده درست نیست.',
  };
  if (result !== 'ok') {
    return res.status(400).json({ ok: false, error: result, message: messages[result] });
  }

  const token = jwt.sign({ phone }, JWT_SECRET, { expiresIn: '90d' });
  res.json({ ok: true, token });
});

// ---------- ادمین: احراز با رمز ----------
function requireAdmin(req, res, next) {
  const pass = req.headers['x-admin-password'];
  if (pass !== ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, error: 'unauthorized', message: 'رمز ادمین نادرست است.' });
  }
  next();
}

app.post('/api/admin/login', (req, res) => {
  if (req.body?.password !== ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, message: 'رمز نادرست است.' });
  }
  res.json({ ok: true });
});

app.get('/api/admin/settings', requireAdmin, (_req, res) => {
  const s = readSettings();
  res.json({
    ok: true,
    settings: {
      kavenegarApiKeyMasked: maskKey(s.kavenegarApiKey),
      hasApiKey: Boolean(s.kavenegarApiKey),
      template: s.template,
      sender: s.sender,
      otpType: s.otpType,
      method: s.method,
      otpLength: s.otpLength,
      otpTtlSeconds: s.otpTtlSeconds,
    },
  });
});

app.post('/api/admin/settings', requireAdmin, (req, res) => {
  const b = req.body || {};
  const patch = {};
  // کلید فقط وقتی به‌روزرسانی می‌شود که مقدار جدیدِ غیرماسک ارسال شده باشد
  if (typeof b.kavenegarApiKey === 'string' && b.kavenegarApiKey && !b.kavenegarApiKey.includes('•')) {
    patch.kavenegarApiKey = b.kavenegarApiKey.trim();
  }
  if (typeof b.template === 'string') patch.template = b.template.trim();
  if (typeof b.sender === 'string') patch.sender = b.sender.trim();
  if (b.otpType === 'sms' || b.otpType === 'call') patch.otpType = b.otpType;
  if (b.method === 'lookup' || b.method === 'send') patch.method = b.method;
  if (Number.isInteger(b.otpLength) && b.otpLength >= 4 && b.otpLength <= 6) patch.otpLength = b.otpLength;
  if (Number.isInteger(b.otpTtlSeconds) && b.otpTtlSeconds >= 60) patch.otpTtlSeconds = b.otpTtlSeconds;

  const next = writeSettings(patch);
  res.json({ ok: true, configured: Boolean(next.kavenegarApiKey) });
});

app.get('/api/admin/logs', requireAdmin, (_req, res) => {
  res.json({ ok: true, logs: getLogs() });
});

// ---------- پنل ادمین (صفحهٔ وب) ----------
app.use('/admin', express.static(path.join(__dirname, 'public')));
app.get('/', (_req, res) => res.redirect('/admin'));

app.listen(PORT, () => {
  console.log(`✅ سرور جفت روی پورت ${PORT} بالا آمد`);
  console.log(`   پنل ادمین:  http://localhost:${PORT}/admin`);
  console.log(`   وضعیت کاوه‌نگار: ${isConfigured() ? 'تنظیم‌شده' : 'تنظیم‌نشده (حالت دمو)'}`);
});
