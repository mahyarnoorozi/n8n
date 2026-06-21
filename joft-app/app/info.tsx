import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card, Screen, Txt } from '@/components';
import { colors, spacing } from '@/theme';

const CONTENT: Record<string, { title: string; body: string }> = {
  language: {
    title: 'زبان',
    body: 'زبان فعلی برنامه «فارسی» است و رابط کاربری کاملاً راست‌به‌چپ طراحی شده. زبان‌های بیشتر در نسخه‌های بعدی اضافه می‌شوند.',
  },
  privacy: {
    title: 'حریم خصوصی و امنیت',
    body: 'حریم خصوصی شما برای ما مهم است. پاسخ سؤال‌ها، خاطره‌ها و پیام‌های عاشقانه فقط بین شما و نیمهٔ دیگرتان دیده می‌شود. شمارهٔ موبایل تنها برای ورود امن استفاده می‌شود و در اختیار کسی قرار نمی‌گیرد. می‌توانید هر زمان داده‌های محلی را از بخش مدیریت پاک کنید.',
  },
  support: {
    title: 'پشتیبانی و تماس با ما',
    body: 'اگر سؤال، پیشنهاد یا مشکلی داشتید خوشحال می‌شویم بشنویم. از طریق ایمیل support@joft.app با ما در ارتباط باشید. تیم «جفت» در سریع‌ترین زمان ممکن پاسخ‌گوست.',
  },
  about: {
    title: 'دربارهٔ جفت',
    body: '«جفت» اپلیکیشنی است برای نزدیک‌تر کردن زوج‌ها؛ با سؤال‌های روزانه، بازی‌های دونفره، ثبت خاطره‌ها و یادآوری لحظه‌های عاشقانه. ساخته‌شده با ❤️ برای فارسی‌زبانان.\n\nنسخهٔ ۱.۰.۰',
  },
};

export default function Info() {
  const router = useRouter();
  const { topic } = useLocalSearchParams<{ topic: string }>();
  const data = CONTENT[topic ?? 'about'] ?? CONTENT.about;

  return (
    <Screen>
      <View style={styles.topbar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-forward" size={26} color={colors.text} />
        </Pressable>
        <Txt variant="heading">{data.title}</Txt>
        <View style={{ width: 26 }} />
      </View>

      <Card style={{ marginTop: spacing.lg }}>
        <Txt variant="body" style={{ lineHeight: 30 }}>
          {data.body}
        </Txt>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
