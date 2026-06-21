import * as Notifications from 'expo-notifications';

/**
 * اعلان‌های محلیِ روی همین گوشی (بدون نیاز به سرور) — برای یادآور مناسبت‌ها
 * و «تلنگرهای عاشقانه». این‌ها در Expo Go هم کار می‌کنند.
 *
 * نکتهٔ زمان: تریگرها بر اساس «ساعت محلیِ گوشی» تنظیم می‌شوند، پس اگر ساعت گوشی
 * روی ایران باشد، یادآوری‌ها هم با وقت ایران هماهنگ‌اند و هیچ‌وقت نیمه‌شب نمی‌آیند.
 */

// بازهٔ مجاز برای تلنگرهای عاشقانه: بین ۱۱ صبح تا ۹ شب
const NUDGE_START_HOUR = 11;
const NUDGE_END_HOUR = 21;

export async function ensureNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.status === 'granted';
}

/** یک ساعتِ تصادفی در بازهٔ مجاز (با احترام به ساعت روز). */
function randomNudgeTime() {
  const hour = NUDGE_START_HOUR + Math.floor(Math.random() * (NUDGE_END_HOUR - NUDGE_START_HOUR));
  const minute = Math.floor(Math.random() * 60);
  return { hour, minute };
}

/**
 * یادآوری روزانهٔ عاشقانه را زمان‌بندی می‌کند (هر روز در ساعتی تصادفی از بازهٔ مجاز).
 * شناسهٔ اعلان را برمی‌گرداند تا بعداً بشود لغوش کرد.
 */
export async function scheduleDailyLoveNudge(message: string): Promise<string | null> {
  if (!(await ensureNotificationPermission())) return null;
  const { hour, minute } = randomNudgeTime();
  try {
    return await Notifications.scheduleNotificationAsync({
      content: { title: 'لحظهٔ عاشقانه 💌', body: message, sound: 'default' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
    });
  } catch {
    return null;
  }
}

/** یادآور یک مناسبت در نزدیک‌ترین تاریخِ پیش‌رو، ساعت ۹ صبح. */
export async function scheduleOccasionReminder(
  title: string,
  date: Date,
): Promise<string | null> {
  if (!(await ensureNotificationPermission())) return null;
  // نزدیک‌ترین تکرار سالانهٔ این تاریخ را پیدا کن
  const now = new Date();
  const next = new Date(now.getFullYear(), date.getMonth(), date.getDate(), 9, 0, 0);
  if (next.getTime() < now.getTime()) next.setFullYear(now.getFullYear() + 1);
  try {
    return await Notifications.scheduleNotificationAsync({
      content: { title: 'یادآوری مناسبت 🎉', body: title, sound: 'default' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: next },
    });
  } catch {
    return null;
  }
}

/** اعلانِ «پیش‌نمایش» — نشان می‌دهد پیام عاشقانه چطور برای نیمهٔ دیگر می‌رسد (حالت دمو). */
export async function fireDemoLoveMessage(text: string, afterSeconds = 4) {
  if (!(await ensureNotificationPermission())) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'پیش‌نمایش 💌 (این‌طوری برای نیمهٔ دیگرت می‌رسد)',
        body: text,
        sound: 'default',
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: afterSeconds },
    });
  } catch {
    // اگر اجازه نبود، بی‌صدا رد می‌شویم
  }
}

export async function cancelNotification(id: string | null | undefined) {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // ممکن است قبلاً لغو شده باشد
  }
}
