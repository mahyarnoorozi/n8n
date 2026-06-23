import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Screen, Txt } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { colors, radius, shadow, spacing } from '@/theme';

/**
 * صفحهٔ «خوش‌اومدی به جفتیما» — یک‌بار بعد از تکمیل پروفایل نمایش داده می‌شود.
 * هدف: راهنمایی به مهم‌ترین قدمِ بعدی، یعنی دعوتِ نیمهٔ دیگر. اگر کاربر فعلاً
 * نمی‌خواد، می‌تونه «الان نه» کنه و بعداً از تب «بیشتر» اقدام کنه.
 */
export default function Welcome() {
  const router = useRouter();
  const { user } = useAuth();
  const partner = user?.partnerName?.trim() || 'نیمهٔ دیگرت';

  return (
    <Screen scroll={false}>
      <View style={styles.body}>
        <View style={styles.hero}>
          <View style={styles.heartBack} />
          <View style={styles.heartFront}>
            <Ionicons name="heart" size={42} color={colors.accent} />
          </View>
        </View>

        <Txt variant="title" center style={{ marginTop: spacing.xl }}>
          خوش اومدی، {user?.name ?? ''} 👋
        </Txt>
        <Txt variant="body" center color={colors.textMuted} style={{ marginTop: spacing.md }}>
          همه چیزِ جفتیما وقتی واقعاً «جفت» می‌شه که {partner} هم بهت وصل بشه.
          بدونِ او، خیلی از بخش‌ها فقط پیش‌نمایش‌ان.
        </Txt>

        <View style={styles.features}>
          <Feature icon="chatbubble-ellipses" text={`پاسخ‌های ${partner} به سؤال‌های روزانه`} />
          <Feature icon="sparkles" text="تطبیقِ خواسته‌های مشترک‌تون" />
          <Feature icon="flower-outline" text={`همراهیِ روزهای پریود (با اجازهٔ خودت)`} />
          <Feature icon="paper-plane" text="پیام‌های عاشقانه که واقعاً برسه" />
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          label="دعوت از نیمهٔ دیگرم"
          icon="link"
          onPress={() => router.replace('/connect?from=welcome')}
        />
        <Pressable onPress={() => router.replace('/(tabs)')} hitSlop={8} style={styles.skip}>
          <Txt variant="caption" center color={colors.textFaint}>
            الان نه، بعداً
          </Txt>
        </Pressable>
      </View>
    </Screen>
  );
}

function Feature({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={18} color={colors.accent} />
      </View>
      <Txt variant="body" style={{ flex: 1 }}>
        {text}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: spacing.xl },
  hero: { width: 140, height: 140, alignItems: 'center', justifyContent: 'center' },
  heartBack: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.accentTint,
  },
  heartFront: {
    width: 88,
    height: 88,
    borderRadius: 30,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  features: {
    width: '100%',
    marginTop: spacing.xxl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingVertical: spacing.sm,
  },
  featureRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { paddingHorizontal: spacing.lg },
  skip: { marginTop: spacing.md, padding: spacing.sm },
});
