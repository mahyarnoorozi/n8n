import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * ذخیره‌سازی محلیِ «بازی تطبیق خواسته‌ها».
 *
 * - پاسخ‌های خودِ کاربر (بله/شاید/نه) — کلیدش id کارت است.
 * - تنظیماتِ سطحِ محتوا و تأییدِ سن.
 * - cache آخرین تطابق‌های دریافت‌شده از سرور (برای نمایشِ آفلاین).
 *
 * نکته: «نه» در کنارِ «بله/شاید» ذخیره می‌شود تا کارت دوباره به کاربر نشان داده نشود.
 * در محاسبهٔ تطبیق فقط «بله یا شاید» از هر دو طرف شمرده می‌شود.
 */

export type Swipe = 'yes' | 'maybe' | 'no';

export type DesireSettings = {
  /** 'soft' = فقط محترمانه، 'all' = شامل صریح‌تر (۱۸+). */
  contentLevel: 'soft' | 'all';
  /** آیا کاربر سن ۱۸+ را تأیید کرده تا محتوای صریح‌تر فعال شود. */
  adultConfirmed: boolean;
};

export type DesireState = {
  swipes: Record<string, Swipe>;
  settings: DesireSettings;
  cachedMatches: string[]; // id کارت‌های تطابق‌شده با نیمهٔ دیگر
  lastMatchesAt?: string;
};

const KEY = '@joft/desires';

const DEFAULT_STATE: DesireState = {
  swipes: {},
  settings: { contentLevel: 'soft', adultConfirmed: false },
  cachedMatches: [],
};

export async function getDesireState(): Promise<DesireState> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return { ...DEFAULT_STATE };
  try {
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATE,
      ...parsed,
      settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) },
      swipes: parsed.swipes || {},
      cachedMatches: parsed.cachedMatches || [],
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export async function saveDesireState(state: DesireState) {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}

export function setSwipe(state: DesireState, cardId: string, swipe: Swipe): DesireState {
  return { ...state, swipes: { ...state.swipes, [cardId]: swipe } };
}

export function clearSwipes(state: DesireState): DesireState {
  return { ...state, swipes: {} };
}

export function setSettings(state: DesireState, patch: Partial<DesireSettings>): DesireState {
  return { ...state, settings: { ...state.settings, ...patch } };
}

export function setCachedMatches(state: DesireState, matches: string[]): DesireState {
  return { ...state, cachedMatches: matches, lastMatchesAt: new Date().toISOString() };
}

/** کارت‌هایی که کاربر «بله یا شاید» داده — استفاده در حالتِ بدون اتصال به سرور. */
export function userYesSwipes(state: DesireState): string[] {
  return Object.entries(state.swipes)
    .filter(([, s]) => s === 'yes' || s === 'maybe')
    .map(([id]) => id);
}

export function swipeCount(state: DesireState): number {
  return Object.keys(state.swipes).length;
}
