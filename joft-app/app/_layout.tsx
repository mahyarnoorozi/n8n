import {
  Vazirmatn_400Regular,
  Vazirmatn_500Medium,
  Vazirmatn_700Bold,
  Vazirmatn_900Black,
  useFonts,
} from '@expo-google-fonts/vazirmatn';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { colors } from '@/theme';

/** ثبت اعلان‌ها فقط وقتی کاربر وارد شده باشد. */
function PushRegistrar() {
  const { user } = useAuth();
  usePushNotifications(Boolean(user?.name));
  return null;
}

// راست‌به‌چپ کردن کل برنامه برای کاربر ایرانی
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Vazirmatn_400Regular,
    Vazirmatn_500Medium,
    Vazirmatn_700Bold,
    Vazirmatn_900Black,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PushRegistrar />
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
            animation: 'slide_from_left',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="connect" options={{ presentation: 'modal' }} />
          <Stack.Screen name="question/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="game/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="article/[id]" />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
