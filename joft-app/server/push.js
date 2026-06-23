/**
 * ارسال اعلان (Push) از طریق سرویس رایگان Expo.
 * توکن‌های دستگاه‌ها در اپ با expo-notifications گرفته و در سرور ذخیره می‌شوند.
 * مستندات: https://docs.expo.dev/push-notifications/sending-notifications/
 */
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

export async function sendPush(token, title, body, data = {}, channelId) {
  if (!token || !String(token).startsWith('ExponentPushToken')) return { ok: false, skipped: true };
  try {
    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: token,
        title,
        body,
        sound: 'default',
        data,
        ...(channelId ? { channelId, priority: 'high' } : {}),
      }),
    });
    const json = await res.json().catch(() => null);
    return { ok: res.ok, response: json };
  } catch {
    return { ok: false, error: 'network' };
  }
}
