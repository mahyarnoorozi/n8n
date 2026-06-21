import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Button, Card, Screen, Txt } from '@/components';
import { ADMIN_CODE, API_BASE_URL, DEMO_MODE } from '@/config';
import { colors, fonts, radius, spacing } from '@/theme';
import { toEn } from '@/utils/persian';

export default function Admin() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState('');
  const [perm, setPerm] = useState('—');
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    if (unlocked) Notifications.getPermissionsAsync().then((p) => setPerm(p.status));
  }, [unlocked]);

  function tryUnlock() {
    if (toEn(code) === ADMIN_CODE) {
      setUnlocked(true);
      setError('');
    } else {
      setError('کد دسترسی نادرست است.');
    }
  }

  async function clearLocal() {
    await AsyncStorage.multiRemove([
      '@joft/occasions',
      '@joft/settings',
      '@joft/answers',
      '@joft/memories',
      '@joft/profile',
    ]);
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  }

  return (
    <Screen>
      <View style={styles.topbar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-forward" size={26} color={colors.text} />
        </Pressable>
        <Txt variant="heading">پنل مدیریت</Txt>
        <View style={{ width: 26 }} />
      </View>

      {!unlocked ? (
        <Card style={{ marginTop: spacing.xxl, alignItems: 'center' }}>
          <View style={styles.lockWrap}>
            <Ionicons name="shield-checkmark" size={30} color={colors.accent} />
          </View>
          <Txt variant="subtitle" center style={{ marginTop: spacing.md }}>
            دسترسی ویژهٔ مدیر
          </Txt>
          <Txt variant="caption" center color={colors.textMuted} style={{ marginTop: spacing.xs }}>
            برای ورود، کد دسترسی را وارد کن.
          </Txt>
          <TextInput
            value={code}
            onChangeText={(t) => {
              setCode(t);
              if (error) setError('');
            }}
            keyboardType="number-pad"
            secureTextEntry
            placeholder="کد دسترسی"
            placeholderTextColor={colors.textFaint}
            style={styles.codeInput}
          />
          {error ? (
            <Txt variant="caption" color={colors.accent} style={{ marginTop: spacing.sm }}>
              {error}
            </Txt>
          ) : null}
          <Button label="ورود" onPress={tryUnlock} disabled={!code} style={{ marginTop: spacing.lg, alignSelf: 'stretch' }} />
        </Card>
      ) : (
        <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
          <Card>
            <Txt variant="bodyBold" style={{ marginBottom: spacing.md }}>
              وضعیت سامانه
            </Txt>
            <Row label="حالت اجرا" value={DEMO_MODE ? 'دمو (بدون سرور)' : 'متصل به سرور'} />
            <Row label="آدرس سرور" value={API_BASE_URL || '—'} ltr />
            <Row label="دسترسی اعلان‌ها" value={perm === 'granted' ? 'فعال' : perm} />
          </Card>

          <Card>
            <Txt variant="bodyBold" style={{ marginBottom: spacing.sm }}>
              مدیریت داده
            </Txt>
            <Txt variant="caption" color={colors.textMuted} style={{ marginBottom: spacing.md }}>
              پاک‌کردن داده‌های محلیِ این گوشی (مناسبت‌ها، خاطره‌ها، پاسخ‌ها و تنظیمات).
            </Txt>
            <Button
              label={cleared ? 'پاک شد ✅' : 'پاک‌کردن دادهٔ محلی'}
              variant="outline"
              onPress={clearLocal}
            />
          </Card>

          <Card>
            <Txt variant="bodyBold" style={{ marginBottom: spacing.xs }}>
              پنل وب سرور
            </Txt>
            <Txt variant="caption" color={colors.textMuted}>
              تنظیم کلید پیامک کاوه‌نگار و آمار از مسیر <Txt variant="caption" color={colors.accent}>/admin</Txt> روی همان دامنهٔ سرور انجام می‌شود.
            </Txt>
          </Card>
        </View>
      )}
    </Screen>
  );
}

function Row({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <View style={styles.row}>
      <Txt variant="caption" color={colors.textMuted}>
        {label}
      </Txt>
      <Txt
        variant="caption"
        style={ltr ? { writingDirection: 'ltr', textAlign: 'left', flex: 1, marginLeft: spacing.md } : { flex: 1, marginLeft: spacing.md, textAlign: 'left' }}
        numberOfLines={1}
      >
        {value}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lockWrap: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeInput: {
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    height: 56,
    marginTop: spacing.lg,
    textAlign: 'center',
    fontFamily: fonts.bold,
    fontSize: 20,
    letterSpacing: 6,
    color: colors.text,
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
});
