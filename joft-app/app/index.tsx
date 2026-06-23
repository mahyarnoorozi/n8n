import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/theme';

/**
 * صفحهٔ ورودی: بسته به وضعیت کاربر، او را به مسیر درست هدایت می‌کند.
 * - کاربر کامل (با نام) → خانه
 * - کاربر تأییدشده ولی بدون نام → تکمیل پروفایل
 * - مهمان → آنبوردینگ
 */
export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  if (user?.name) return <Redirect href="/(tabs)" />;
  if (user) return <Redirect href="/(auth)/profile" />;
  return <Redirect href="/onboarding" />;
}
