import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

/**
 * دیتابیس سبکِ فایل‌محور (JSON) برای شروع سریع و بدون وابستگیِ نیتیو.
 * ساختار به‌گونه‌ای است که بعداً به‌راحتی می‌توان آن را با PostgreSQL/SQLite
 * جایگزین کرد (همهٔ دسترسی‌ها از همین ماژول می‌گذرد).
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const empty = { users: [], couples: [], answers: [], memories: [], gameResults: [] };

function load() {
  try {
    return { ...empty, ...JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) };
  } catch {
    return structuredClone(empty);
  }
}

let db = load();
let saveTimer = null;
function save() {
  // نوشتنِ کم‌هزینه و گروهی برای جلوگیری از I/O زیاد
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  }, 50);
}

const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();

/** کد دعوتِ ۶ نویسه‌ای و خوانا (بدون حروف گیج‌کننده). */
function inviteCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 6; i++) c += alphabet[crypto.randomInt(alphabet.length)];
  return c;
}

// ---------- کاربر ----------
export function getUserById(uid) {
  return db.users.find((u) => u.id === uid) || null;
}
export function getUserByPhone(phone) {
  return db.users.find((u) => u.phone === phone) || null;
}
export function upsertUserByPhone(phone) {
  let u = getUserByPhone(phone);
  if (!u) {
    u = { id: id(), phone, name: '', partnerName: '', anniversary: '', coupleId: '', pushToken: '', createdAt: now() };
    db.users.push(u);
    save();
  }
  return u;
}
export function updateUser(uid, patch) {
  const u = getUserById(uid);
  if (!u) return null;
  Object.assign(u, patch);
  save();
  return u;
}

// ---------- زوج ----------
export function getCouple(coupleId) {
  return db.couples.find((c) => c.id === coupleId) || null;
}
export function ensureCouple(uid) {
  const u = getUserById(uid);
  if (u.coupleId) return getCouple(u.coupleId);
  const couple = { id: id(), inviteCode: inviteCode(), memberIds: [uid], createdAt: now() };
  db.couples.push(couple);
  updateUser(uid, { coupleId: couple.id });
  save();
  return couple;
}
/** پیوستن کاربر به زوج با کد دعوت. نتیجه: {ok} یا {error}. */
export function joinCouple(uid, code) {
  const couple = db.couples.find((c) => c.inviteCode === code.toUpperCase());
  if (!couple) return { error: 'not_found' };
  if (couple.memberIds.includes(uid)) return { ok: true, couple };
  if (couple.memberIds.length >= 2) return { error: 'full' };
  couple.memberIds.push(uid);
  updateUser(uid, { coupleId: couple.id });
  // نام‌ها را بین دو طرف هم‌گام کن
  const [a, b] = couple.memberIds.map(getUserById);
  if (a && b) {
    updateUser(a.id, { partnerName: b.name || a.partnerName });
    updateUser(b.id, { partnerName: a.name || b.partnerName });
  }
  save();
  return { ok: true, couple };
}
export function getPartner(uid) {
  const u = getUserById(uid);
  if (!u?.coupleId) return null;
  const couple = getCouple(u.coupleId);
  const partnerId = couple?.memberIds.find((m) => m !== uid);
  return partnerId ? getUserById(partnerId) : null;
}

// ---------- پاسخ سؤال‌ها ----------
export function addAnswer(coupleId, userId, questionId, text) {
  // اگر قبلاً پاسخ داده، به‌روزرسانی کن
  const existing = db.answers.find(
    (a) => a.coupleId === coupleId && a.userId === userId && a.questionId === questionId,
  );
  if (existing) {
    existing.text = text;
    existing.createdAt = now();
    save();
    return existing;
  }
  const a = { id: id(), coupleId, userId, questionId, text, createdAt: now() };
  db.answers.push(a);
  save();
  return a;
}
export function getAnswers(coupleId, questionId) {
  return db.answers.filter((a) => a.coupleId === coupleId && a.questionId === questionId);
}

// ---------- خاطره‌ها ----------
export function addMemory(coupleId, userId, text) {
  const m = { id: id(), coupleId, userId, text, createdAt: now() };
  db.memories.unshift(m);
  save();
  return m;
}
export function getMemories(coupleId) {
  return db.memories.filter((m) => m.coupleId === coupleId);
}

// ---------- نتیجهٔ بازی ----------
export function addGameResult(coupleId, userId, gameId, answers) {
  const r = { id: id(), coupleId, userId, gameId, answers, createdAt: now() };
  db.gameResults.push(r);
  save();
  return r;
}

/** فقط برای تست‌ها: ریست دیتابیس در حافظه. */
export function _resetForTests() {
  db = structuredClone(empty);
  save();
}
