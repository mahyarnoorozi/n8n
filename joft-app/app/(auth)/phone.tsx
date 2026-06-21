import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Button, Screen, Txt } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { fa } from '@/i18n/fa';
import { colors, fonts, radius, spacing } from '@/theme';
import { formatIranPhone, isValidIranPhone } from '@/utils/persian';

export default function PhoneScreen() {
  const router = useRouter();
  const { sendCode } = useAuth();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const valid = isValidIranPhone(phone);

  async function handleSubmit() {
    Keyboard.dismiss();
    if (!valid) {
      setError(fa.phoneInvalid);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await sendCode(phone);
      router.push('/(auth)/verify');
    } catch (e: any) {
      setError(e?.message || 'ارسال کد ناموفق بود. دوباره تلاش کن.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll={false}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* لمس هر جای خالی، کیبورد را می‌بندد */}
        <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
          <Pressable onPress={() => router.back()} style={styles.back} hitSlop={12}>
            <Ionicons name="chevron-forward" size={26} color={colors.text} />
          </Pressable>

          <View style={styles.heart}>
            <Ionicons name="heart" size={36} color={colors.accent} />
          </View>

          <Txt variant="title" style={{ marginTop: spacing.xl }}>
            {fa.phoneTitle}
          </Txt>
          <Txt variant="body" color={colors.textMuted} style={{ marginTop: spacing.sm }}>
            {fa.phoneSubtitle}
          </Txt>

          <Txt variant="caption" style={{ marginTop: spacing.xxl, marginBottom: spacing.sm }}>
            {fa.phoneLabel}
          </Txt>
          <View style={[styles.inputWrap, error ? styles.inputError : null]}>
            <View style={styles.prefix}>
              <Txt
                variant="bodyBold"
                color={colors.textMuted}
                style={{ writingDirection: 'ltr', textAlign: 'left' }}
              >
                +۹۸
              </Txt>
            </View>
            <TextInput
              value={phone}
              onChangeText={(t) => {
                setPhone(formatIranPhone(t));
                if (error) setError('');
              }}
              keyboardType="number-pad"
              placeholder={fa.phonePlaceholder}
              placeholderTextColor={colors.textFaint}
              style={styles.input}
              maxLength={14}
              autoFocus
            />
          </View>
          {error ? (
            <Txt variant="caption" color={colors.accent} style={{ marginTop: spacing.sm }}>
              {error}
            </Txt>
          ) : null}

          {/* فاصلهٔ منعطف، دکمه را به پایین می‌برد ولی با باز شدن کیبورد بالا می‌آید */}
          <View style={{ flex: 1 }} />

          <View style={styles.footer}>
            <Txt variant="tiny" center color={colors.textFaint} style={{ marginBottom: spacing.md }}>
              {fa.terms}
            </Txt>
            <Button
              label={fa.sendCode}
              icon="arrow-back"
              onPress={handleSubmit}
              loading={loading}
              disabled={!valid}
            />
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start' },
  heart: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  inputWrap: {
    // جهت LTR تا شمارهٔ تلفن مثل «+۹۸ ۰۹۱۲ …» درست و خوانا نمایش داده شود
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    height: 58,
  },
  inputError: { borderColor: colors.accent },
  prefix: {
    paddingRight: spacing.md,
    marginRight: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  input: {
    flex: 1,
    textAlign: 'left',
    writingDirection: 'ltr',
    fontFamily: fonts.medium,
    fontSize: 18,
    color: colors.text,
    letterSpacing: 2,
  },
  footer: { paddingBottom: spacing.lg },
});
