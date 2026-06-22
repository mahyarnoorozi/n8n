import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, DEMO_MODE } from '@/config';

/**
 * کلاینت واحدِ ارتباط با بک‌اند.
 * در «حالت دمو» (وقتی EXPO_PUBLIC_API_URL تنظیم نشده) همان قابلیت‌ها به‌صورت
 * محلی با AsyncStorage شبیه‌سازی می‌شوند تا اپ بدون سرور هم کامل کار کند.
 */

const TOKEN_KEY = '@joft/token';
let authToken: string | null = null;

export async function loadToken() {
  authToken = await AsyncStorage.getItem(TOKEN_KEY);
}
export async function setToken(token: string | null) {
  authToken = token;
  if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
  else await AsyncStorage.removeItem(TOKEN_KEY);
}

async function req(method: string, path: string, body?: unknown) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.ok === false) {
    throw new Error(json.message || 'خطا در ارتباط با سرور.');
  }
  return json;
}

// ---------- انواع ----------
export type PublicUser = { id: string; name: string; partnerName: string; anniversary: string };
export type Me = {
  user: PublicUser & { phone: string };
  partner: PublicUser | null;
  couple: { id: string; inviteCode: string; linked: boolean } | null;
};
export type Memory = {
  id: string;
  text: string;
  createdAt: string;
  author: 'me' | 'partner';
  photoUri?: string | null; // مسیر محلیِ عکس روی همین گوشی (همگام‌سازی نمی‌شود)
};
export type AnswerView = {
  mine: { text: string } | null;
  partner: { text: string } | null;
  partnerAnswered: boolean;
};

// ---------- حالت دمو (محلی) ----------
const demo = {
  async get<T>(key: string, fallback: T): Promise<T> {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  },
  async set(key: string, value: unknown) {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
};
const DEMO_PARTNER_ANSWER = 'حس می‌کردم دیده می‌شم؛ این برام مهم‌ترین بود 💛';

// ---------- متدها ----------
export const api = {
  async saveProfile(data: { name?: string; partnerName?: string; anniversary?: string }) {
    if (DEMO_MODE) {
      await demo.set('@joft/profile', data);
      return;
    }
    await req('POST', '/api/profile', data);
  },

  async createInvite(): Promise<{ inviteCode: string; linked: boolean }> {
    if (DEMO_MODE) return { inviteCode: 'DEMO12', linked: false };
    const j = await req('POST', '/api/couple/invite', {});
    return { inviteCode: j.inviteCode, linked: j.linked };
  },

  async joinCouple(code: string): Promise<{ ok: boolean; partnerName?: string }> {
    if (DEMO_MODE) return { ok: true };
    const j = await req('POST', '/api/couple/join', { code });
    return { ok: true, partnerName: j.partner?.name };
  },

  async getAnswers(questionId: string): Promise<AnswerView> {
    if (DEMO_MODE) {
      const map = await demo.get<Record<string, string>>('@joft/answers', {});
      const mineText = map[questionId];
      return {
        mine: mineText ? { text: mineText } : null,
        partner: mineText ? { text: DEMO_PARTNER_ANSWER } : null,
        partnerAnswered: true,
      };
    }
    return req('GET', `/api/questions/${questionId}/answers`);
  },

  async saveAnswer(questionId: string, text: string) {
    if (DEMO_MODE) {
      const map = await demo.get<Record<string, string>>('@joft/answers', {});
      map[questionId] = text;
      await demo.set('@joft/answers', map);
      return;
    }
    await req('POST', `/api/questions/${questionId}/answer`, { text });
  },

  async getMemories(): Promise<Memory[]> {
    if (DEMO_MODE) return demo.get<Memory[]>('@joft/memories', []);
    const j = await req('GET', '/api/memories');
    return j.memories;
  },

  async addMemory(text: string, photoUri?: string | null): Promise<Memory> {
    if (DEMO_MODE) {
      const list = await demo.get<Memory[]>('@joft/memories', []);
      const m: Memory = {
        id: String(Date.now()),
        text,
        createdAt: new Date().toISOString(),
        author: 'me',
        photoUri: photoUri ?? null,
      };
      await demo.set('@joft/memories', [m, ...list]);
      return m;
    }
    const j = await req('POST', '/api/memories', { text });
    // عکس فقط روی همین گوشی نگهداری می‌شود؛ مسیر محلی را به Memory بازگشتی ضمیمه می‌کنیم
    const photos = await demo.get<Record<string, string>>('@joft/memoryPhotos', {});
    if (photoUri) {
      photos[j.memory.id] = photoUri;
      await demo.set('@joft/memoryPhotos', photos);
    }
    return { ...j.memory, photoUri: photoUri ?? null };
  },

  /** مسیرهای عکسِ خاطره‌ها روی همین گوشی (همگام نمی‌شوند). */
  async getMemoryPhotoMap(): Promise<Record<string, string>> {
    return demo.get<Record<string, string>>('@joft/memoryPhotos', {});
  },

  async sendLove(text: string) {
    if (DEMO_MODE) return;
    await req('POST', '/api/love', { text });
  },

  /** تلنگر (دلتنگی/بوسه/بغل) — گوشیِ نیمهٔ دیگر را با اعلانِ پرلرزش خبر می‌کند. */
  async sendNudge(
    type: 'miss' | 'kiss' | 'hug',
  ): Promise<{ ok: boolean; reason?: 'demo' | 'error'; message?: string }> {
    if (DEMO_MODE) return { ok: false, reason: 'demo' };
    try {
      await req('POST', '/api/nudge', { type });
      return { ok: true };
    } catch (e: any) {
      return { ok: false, reason: 'error', message: e?.message };
    }
  },

  /** ثبتِ پاسخِ یک کارتِ «تطبیق خواسته‌ها». در حالت دمو فقط محلی. */
  async saveDesireSwipe(cardId: string, swipe: 'yes' | 'maybe' | 'no') {
    if (DEMO_MODE) return;
    try {
      await req('POST', '/api/desires/swipe', { cardId, swipe });
    } catch {
      // اگر سرور نبود، حالتِ محلی همچنان کار می‌کند
    }
  },

  /** گرفتنِ تطابق‌ها (کارت‌هایی که هر دو نفر بله یا شاید گفته‌اند). */
  async getDesireMatches(): Promise<{ matches: string[]; partnerSwipedCount: number } | null> {
    if (DEMO_MODE) return null;
    try {
      const j = await req('GET', '/api/desires/matches');
      return { matches: j.matches || [], partnerSwipedCount: j.partnerSwipedCount || 0 };
    } catch {
      return null;
    }
  },

  /** اشتراک‌گذاریِ پارامترهای چرخه با نیمهٔ دیگر (یا قطعِ اشتراک با share=false). */
  async shareCycle(input: {
    share: boolean;
    lastPeriodStartISO?: string;
    cycleLength?: number;
    periodLength?: number;
  }) {
    if (DEMO_MODE) return;
    try {
      await req('POST', '/api/cycle/share', input);
    } catch {
      // اگر سرور نبود، اشتراک بی‌صدا رد می‌شود (حالت محلی همچنان کار می‌کند)
    }
  },

  /** گرفتنِ چرخهٔ به‌اشتراک‌گذاشتهٔ نیمهٔ دیگر (یا null اگر چیزی به اشتراک نگذاشته). */
  async getPartnerCycle(): Promise<{
    lastPeriodStartISO: string;
    cycleLength: number;
    periodLength: number;
  } | null> {
    if (DEMO_MODE) return null;
    try {
      const j = await req('GET', '/api/cycle/partner');
      return j.cycle ?? null;
    } catch {
      return null;
    }
  },

  async registerPush(token: string) {
    if (DEMO_MODE) return;
    await req('POST', '/api/push/token', { token });
  },

  async getMe(): Promise<Me | null> {
    if (DEMO_MODE) return null;
    try {
      return await req('GET', '/api/me');
    } catch {
      return null;
    }
  },
};
