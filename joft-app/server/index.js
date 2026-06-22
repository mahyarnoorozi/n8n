import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describeProviderStatus, sendOtp } from './kavenegar.js';
import { sendPush } from './push.js';
import * as db from './db.js';
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

  // ساخت/بازیابی کاربر و صدور توکن
  const user = db.upsertUserByPhone(phone);
  const token = jwt.sign({ uid: user.id, phone }, JWT_SECRET, { expiresIn: '90d' });
  res.json({ ok: true, token, isNewUser: !user.name });
});

// ---------- میدل‌ور احراز هویت کاربر ----------
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = db.getUserById(payload.uid);
    if (!user) throw new Error('no user');
    req.user = user;
    next();
  } catch {
    res.status(401).json({ ok: false, error: 'unauthorized' });
  }
}

function publicUser(u) {
  if (!u) return null;
  return { id: u.id, name: u.name, partnerName: u.partnerName, anniversary: u.anniversary };
}

// ---------- پروفایل و زوج ----------
app.get('/api/me', requireAuth, (req, res) => {
  const partner = db.getPartner(req.user.id);
  const couple = req.user.coupleId ? db.getCouple(req.user.coupleId) : null;
  res.json({
    ok: true,
    user: { ...publicUser(req.user), phone: req.user.phone },
    partner: publicUser(partner),
    couple: couple ? { id: couple.id, inviteCode: couple.inviteCode, linked: couple.memberIds.length >= 2 } : null,
  });
});

app.post('/api/profile', requireAuth, (req, res) => {
  const { name, partnerName, anniversary } = req.body || {};
  const patch = {};
  if (typeof name === 'string') patch.name = name.trim().slice(0, 40);
  if (typeof partnerName === 'string') patch.partnerName = partnerName.trim().slice(0, 40);
  if (typeof anniversary === 'string') patch.anniversary = anniversary;
  db.updateUser(req.user.id, patch);
  res.json({ ok: true, user: publicUser(db.getUserById(req.user.id)) });
});

/** ساخت/گرفتن کد دعوت برای پیوند دادن نیمهٔ دیگر. */
app.post('/api/couple/invite', requireAuth, (req, res) => {
  const couple = db.ensureCouple(req.user.id);
  res.json({ ok: true, inviteCode: couple.inviteCode, linked: couple.memberIds.length >= 2 });
});

/** پیوستن با کد دعوت. */
app.post('/api/couple/join', requireAuth, async (req, res) => {
  const code = String(req.body?.code || '').trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(code)) {
    return res.status(400).json({ ok: false, error: 'invalid_code', message: 'کد دعوت نامعتبر است.' });
  }
  const result = db.joinCouple(req.user.id, code);
  if (result.error === 'not_found')
    return res.status(404).json({ ok: false, message: 'کدی با این مشخصات پیدا نشد.' });
  if (result.error === 'full')
    return res.status(409).json({ ok: false, message: 'این زوج قبلاً تکمیل شده است.' });

  // به نیمهٔ دیگر خبر بده
  const partner = db.getPartner(req.user.id);
  if (partner?.pushToken) {
    await sendPush(partner.pushToken, 'جفت', `${req.user.name || 'نیمهٔ دیگرت'} به تو وصل شد 💞`);
  }
  res.json({ ok: true, partner: publicUser(partner) });
});

app.post('/api/push/token', requireAuth, (req, res) => {
  const token = String(req.body?.token || '').trim();
  db.updateUser(req.user.id, { pushToken: token });
  res.json({ ok: true });
});

// ---------- پاسخ سؤال‌ها ----------
app.get('/api/questions/:id/answers', requireAuth, (req, res) => {
  const couple = db.ensureCouple(req.user.id);
  const all = db.getAnswers(couple.id, req.params.id);
  const mine = all.find((a) => a.userId === req.user.id) || null;
  const partner = db.getPartner(req.user.id);
  const theirs = partner ? all.find((a) => a.userId === partner.id) || null : null;
  res.json({
    ok: true,
    mine: mine ? { text: mine.text } : null,
    // پاسخ نیمهٔ دیگر فقط وقتی نمایش داده می‌شود که خودت جواب داده باشی
    partner: mine && theirs ? { text: theirs.text } : null,
    partnerAnswered: Boolean(theirs),
  });
});

app.post('/api/questions/:id/answer', requireAuth, async (req, res) => {
  const text = String(req.body?.text || '').trim();
  if (!text) return res.status(400).json({ ok: false, error: 'empty' });
  const couple = db.ensureCouple(req.user.id);
  db.addAnswer(couple.id, req.user.id, req.params.id, text.slice(0, 1000));
  const partner = db.getPartner(req.user.id);
  if (partner?.pushToken) {
    await sendPush(partner.pushToken, 'سؤال روز', `${req.user.name || 'نیمهٔ دیگرت'} به سؤال امروز جواب داد ✍️`, {
      type: 'answer',
      questionId: req.params.id,
    });
  }
  res.json({ ok: true });
});

// ---------- خاطره‌ها ----------
app.get('/api/memories', requireAuth, (req, res) => {
  const couple = db.ensureCouple(req.user.id);
  const list = db.getMemories(couple.id).map((m) => ({
    id: m.id,
    text: m.text,
    createdAt: m.createdAt,
    author: m.userId === req.user.id ? 'me' : 'partner',
  }));
  res.json({ ok: true, memories: list });
});

app.post('/api/memories', requireAuth, async (req, res) => {
  const text = String(req.body?.text || '').trim();
  if (!text) return res.status(400).json({ ok: false, error: 'empty' });
  const couple = db.ensureCouple(req.user.id);
  const m = db.addMemory(couple.id, req.user.id, text.slice(0, 1000));
  const partner = db.getPartner(req.user.id);
  if (partner?.pushToken) {
    await sendPush(partner.pushToken, 'خاطرهٔ تازه', `${req.user.name || 'نیمهٔ دیگرت'} یک خاطره ثبت کرد 🖤`, {
      type: 'memory',
    });
  }
  res.json({ ok: true, memory: { id: m.id, text: m.text, createdAt: m.createdAt, author: 'me' } });
});

// ---------- پیام عاشقانه (به‌صورت اعلان به نیمهٔ دیگر) ----------
app.post('/api/love', requireAuth, async (req, res) => {
  const text = String(req.body?.text || '').trim();
  if (!text) return res.status(400).json({ ok: false, error: 'empty' });
  const partner = db.getPartner(req.user.id);
  if (partner?.pushToken) {
    await sendPush(partner.pushToken, `پیام عاشقانه از ${req.user.name || 'نیمهٔ دیگرت'} 💞`, text.slice(0, 200), {
      type: 'love',
    });
  }
  res.json({ ok: true });
});

// ---------- نتیجهٔ بازی ----------
app.post('/api/games/:id/result', requireAuth, (req, res) => {
  const couple = db.ensureCouple(req.user.id);
  db.addGameResult(couple.id, req.user.id, req.params.id, req.body?.answers ?? []);
  res.json({ ok: true });
});

// ---------- تطبیق خواسته‌ها ----------
const VALID_SWIPES = new Set(['yes', 'maybe', 'no']);

app.post('/api/desires/swipe', requireAuth, async (req, res) => {
  const cardId = String(req.body?.cardId || '').trim();
  const swipe = String(req.body?.swipe || '').trim();
  if (!cardId || !VALID_SWIPES.has(swipe)) {
    return res.status(400).json({ ok: false, error: 'invalid_input' });
  }
  const couple = db.ensureCouple(req.user.id);
  const partner = db.getPartner(req.user.id);
  db.addDesireSwipe(couple.id, req.user.id, cardId, swipe);

  // اگر این پاسخ یک «تطابق جدید» ساخت، به نیمهٔ دیگر خبر بده
  if (partner && (swipe === 'yes' || swipe === 'maybe')) {
    const { matches: prev } = db.getDesireMatches(couple.id, req.user.id, partner.id);
    if (prev.includes(cardId) && partner.pushToken) {
      await sendPush(
        partner.pushToken,
        'یه تطابقِ تازه! ✨',
        'یه ایدهٔ مشترک با نیمهٔ دیگرت داری — ببین چیه.',
        { type: 'desire-match' },
      );
    }
  }
  res.json({ ok: true });
});

app.get('/api/desires/matches', requireAuth, (req, res) => {
  const couple = db.ensureCouple(req.user.id);
  const partner = db.getPartner(req.user.id);
  const { matches, partnerSwipedCount } = db.getDesireMatches(
    couple.id,
    req.user.id,
    partner?.id ?? null,
  );
  res.json({ ok: true, matches, partnerSwipedCount });
});

// ---------- اشتراک چرخهٔ قاعدگی با نیمهٔ دیگر ----------
app.post('/api/cycle/share', requireAuth, async (req, res) => {
  const couple = db.ensureCouple(req.user.id);
  const b = req.body || {};

  // قطعِ اشتراک
  if (b.share === false) {
    db.removeCycleShare(couple.id, req.user.id);
    return res.json({ ok: true, shared: false });
  }

  const lastPeriodStartISO = String(b.lastPeriodStartISO || '');
  const cycleLength = Number(b.cycleLength);
  const periodLength = Number(b.periodLength);
  if (
    !lastPeriodStartISO ||
    !Number.isFinite(cycleLength) ||
    cycleLength < 18 ||
    cycleLength > 60 ||
    !Number.isFinite(periodLength) ||
    periodLength < 1 ||
    periodLength > 15
  ) {
    return res.status(400).json({ ok: false, error: 'invalid_input' });
  }

  const { isNewPeriod } = db.setCycleShare(couple.id, req.user.id, {
    lastPeriodStartISO,
    cycleLength,
    periodLength,
  });

  // اگر پریودِ تازه‌ای ثبت شده، به نیمهٔ دیگر یک تلنگرِ مهربان بفرست
  const partner = db.getPartner(req.user.id);
  if (isNewPeriod && partner?.pushToken) {
    await sendPush(
      partner.pushToken,
      'مراقبت 🌸',
      `${req.user.name || 'نیمهٔ دیگرت'} این روزها به محبتِ بیشترت نیاز داره.`,
      { type: 'cycle' },
    );
  }
  res.json({ ok: true, shared: true });
});

app.get('/api/cycle/partner', requireAuth, (req, res) => {
  const couple = db.ensureCouple(req.user.id);
  const partner = db.getPartner(req.user.id);
  if (!partner) return res.json({ ok: true, cycle: null });
  const share = db.getCycleShare(couple.id, partner.id);
  if (!share) return res.json({ ok: true, cycle: null });
  res.json({
    ok: true,
    cycle: {
      lastPeriodStartISO: share.lastPeriodStartISO,
      cycleLength: share.cycleLength,
      periodLength: share.periodLength,
    },
  });
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
