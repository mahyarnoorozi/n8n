import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { api } from '@/api/client';
import { DEMO_MODE } from '@/config';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * ثبت دستگاه برای دریافت اعلان (Push) و ارسال توکن به سرور.
 * فقط وقتی اجرا می‌شود که کاربر وارد شده و سرور تنظیم شده باشد.
 */
export function usePushNotifications(enabled: boolean) {
  useEffect(() => {
    if (!enabled || DEMO_MODE) return;
    (async () => {
      try {
        if (!Device.isDevice) return; // روی شبیه‌ساز کار نمی‌کند

        const { status: existing } = await Notifications.getPermissionsAsync();
        let status = existing;
        if (existing !== 'granted') {
          status = (await Notifications.requestPermissionsAsync()).status;
        }
        if (status !== 'granted') return;

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'پیش‌فرض',
            importance: Notifications.AndroidImportance.DEFAULT,
          });
        }

        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        const token = (await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined))
          .data;
        if (token) await api.registerPush(token);
      } catch {
        // اگر ثبت اعلان ممکن نبود، اپ بدون آن ادامه می‌دهد
      }
    })();
  }, [enabled]);
}
