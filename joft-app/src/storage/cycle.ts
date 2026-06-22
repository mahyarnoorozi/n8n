import AsyncStorage from '@react-native-async-storage/async-storage';
import { uid } from './local';

/**
 * ذخیره‌سازی محلیِ بخش «مراقبت / چرخهٔ قاعدگی».
 *
 * این بخش بخشی از روحِ «جفت» است: نه‌فقط یک ردیابِ تک‌نفره، بلکه ابزاری که به
 * هر دو نفرِ رابطه کمک می‌کند نسبت به این روزها آگاه و مهربان باشند. به همین
 * دلیل «حالت همراه» (perspective) داریم تا همان داده، یک‌بار برای خودِ فرد و
 * یک‌بار برای نیمهٔ دیگرش با لحنِ حمایتگرانه نمایش داده شود.
 */

export type PeriodLog = {
  id: string;
  startISO: string;
  endISO?: string | null;
};

export type Perspective = 'self' | 'partner';

export type CycleData = {
  periods: PeriodLog[]; // مرتب از جدید به قدیم
  cycleLength: number; // میانگین طول چرخه (روز)
  periodLength: number; // میانگین طول پریود (روز)
  reminders: boolean;
  reminderId?: string | null;
  perspective: Perspective;
};

const CYCLE_KEY = '@joft/cycle';

export const DEFAULT_CYCLE: CycleData = {
  periods: [],
  cycleLength: 28,
  periodLength: 5,
  reminders: false,
  reminderId: null,
  perspective: 'self',
};

export async function getCycle(): Promise<CycleData> {
  const raw = await AsyncStorage.getItem(CYCLE_KEY);
  if (!raw) return { ...DEFAULT_CYCLE };
  try {
    return { ...DEFAULT_CYCLE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_CYCLE };
  }
}

export async function saveCycle(data: CycleData) {
  await AsyncStorage.setItem(CYCLE_KEY, JSON.stringify(data));
}

/** افزودنِ یک شروعِ پریود (و مرتب‌سازی نزولی). تاریخِ تکراری را نادیده می‌گیرد. */
export function addPeriodStart(data: CycleData, startISO: string): CycleData {
  const day = startISO.slice(0, 10);
  if (data.periods.some((p) => p.startISO.slice(0, 10) === day)) return data;
  const periods = [{ id: uid(), startISO }, ...data.periods].sort(
    (a, b) => new Date(b.startISO).getTime() - new Date(a.startISO).getTime(),
  );
  return { ...data, periods };
}

export function removePeriod(data: CycleData, id: string): CycleData {
  return { ...data, periods: data.periods.filter((p) => p.id !== id) };
}

/** اگر کاربر دست‌کم دو پریود ثبت کرده باشد، طولِ چرخه را از میانگینِ فاصله‌ها به‌روز می‌کند. */
export function withLearnedCycleLength(data: CycleData): CycleData {
  if (data.periods.length < 2) return data;
  const sorted = [...data.periods].sort(
    (a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime(),
  );
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const diff = Math.round(
      (new Date(sorted[i].startISO).getTime() - new Date(sorted[i - 1].startISO).getTime()) /
        86400000,
    );
    if (diff >= 18 && diff <= 45) gaps.push(diff); // فقط فاصله‌های منطقی
  }
  if (gaps.length === 0) return data;
  const avg = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
  return { ...data, cycleLength: avg };
}
