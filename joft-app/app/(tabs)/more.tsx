import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Avatar, Card, Screen, Txt } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { fa } from '@/i18n/fa';
import { colors, radius, spacing } from '@/theme';
import { formatIranPhone } from '@/utils/persian';

export default function More() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const items: { icon: keyof typeof Ionicons.glyphMap; label: string; route: string }[] = [
    { icon: 'heart-circle-outline', label: 'صمیمت و پیام عاشقانه', route: '/love' },
    { icon: 'calendar-outline', label: 'مناسبت‌ها و یادآورها', route: '/occasions' },
    { icon: 'link-outline', label: fa.connectFromMore, route: '/connect' },
    { icon: 'person-circle-outline', label: 'حساب کاربری و تنظیمات', route: '/settings' },
    { icon: 'notifications-outline', label: 'اعلان‌ها و یادآوری‌ها', route: '/settings' },
    { icon: 'lock-closed-outline', label: 'حریم خصوصی و امنیت', route: '/info?topic=privacy' },
    { icon: 'help-circle-outline', label: 'پشتیبانی و تماس با ما', route: '/info?topic=support' },
    { icon: 'information-circle-outline', label: 'دربارهٔ جفت', route: '/info?topic=about' },
    { icon: 'shield-checkmark-outline', label: 'پنل مدیریت', route: '/admin' },
  ];

  async function handleLogout() {
    await logout();
    router.replace('/onboarding');
  }

  return (
    <Screen>
      <Txt variant="title">{fa.tabMore}</Txt>

      {/* کارت کاربر */}
      <Card style={{ marginTop: spacing.lg }}>
        <View style={styles.userRow}>
          <Avatar
            name={user?.name}
            size={56}
            photoUri={user?.photo}
            faceless={user?.avatarKind}
            color={colors.accent}
          />
          <View style={{ flex: 1 }}>
            <Txt variant="heading">{user?.name ?? ''}</Txt>
            <Txt
              variant="caption"
              color={colors.textMuted}
              style={{ writingDirection: 'ltr', textAlign: 'right' }}
            >
              {user?.phone ? `+۹۸ ${formatIranPhone(user.phone)}` : ''}
            </Txt>
          </View>
        </View>
      </Card>

      {/* بنر نسخهٔ ویژه — تنها جای پررنگِ قرمز */}
      <Pressable style={styles.premium}>
        <View style={{ flex: 1 }}>
          <Txt variant="heading" color={colors.textInverse}>
            ✨ {fa.premium}
          </Txt>
          <Txt variant="caption" color={colors.accentTint} style={{ marginTop: spacing.xs }}>
            {fa.premiumDesc}
          </Txt>
        </View>
        <View style={styles.upgradeBtn}>
          <Txt variant="tiny" color={colors.accent}>
            {fa.upgrade}
          </Txt>
        </View>
      </Pressable>

      {/* فهرست تنظیمات */}
      <Card style={{ marginTop: spacing.lg }} padded={false}>
        {items.map((item, i) => (
          <Pressable
            key={item.label}
            style={[styles.item, i > 0 && styles.itemBorder]}
            onPress={() => router.push(item.route as any)}
          >
            <Ionicons name={item.icon} size={22} color={colors.accent} />
            <Txt variant="subtitle" style={{ flex: 1 }}>
              {item.label}
            </Txt>
            <Ionicons name="chevron-back" size={18} color={colors.textFaint} />
          </Pressable>
        ))}
      </Card>

      <Pressable onPress={handleLogout} style={styles.logout}>
        <Ionicons name="log-out-outline" size={20} color={colors.accent} />
        <Txt variant="bodyBold" color={colors.accent}>
          {fa.logout}
        </Txt>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  userRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md },
  premium: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  upgradeBtn: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  item: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  itemBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  logout: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    padding: spacing.lg,
  },
});
