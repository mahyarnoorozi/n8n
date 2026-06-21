import AsyncStorage from '@react-native-async-storage/async-storage';

/** ذخیره‌سازی محلیِ مناسبت‌ها و تنظیمات اپ روی همین گوشی. */

export type Occasion = {
  id: string;
  title: string;
  dateISO: string;
  icon: string; // نام آیکن Ionicons
  reminder: boolean;
  reminderId?: string | null; // شناسهٔ اعلانِ زمان‌بندی‌شده
};

export type AppSettings = {
  loveNudgeEnabled: boolean;
  loveNudgeId?: string | null;
};

const OCCASIONS_KEY = '@joft/occasions';
const SETTINGS_KEY = '@joft/settings';

export async function getOccasions(): Promise<Occasion[]> {
  const raw = await AsyncStorage.getItem(OCCASIONS_KEY);
  return raw ? JSON.parse(raw) : [];
}
export async function saveOccasions(list: Occasion[]) {
  await AsyncStorage.setItem(OCCASIONS_KEY, JSON.stringify(list));
}

export async function getSettings(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  return raw ? JSON.parse(raw) : { loveNudgeEnabled: false, loveNudgeId: null };
}
export async function saveSettings(s: AppSettings) {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
