import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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
import { formatIranPhone, toEn, toFa } from '@/utils/persian';
import { DEMO_MODE } from '@/config';

const CODE_LENGTH = 4;
const RESEND_SECONDS = 60;

export default function VerifyScreen() {
  const router = useRouter();
  const { pendingPhone, verifyCode, sendCode } = useAuth();
  const inputRef = useRef<TextInput>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(RESEND_SECONDS);

  useEffect(() => {
    const id = setInterval(() => setTimer((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, []);

  async function handleVerify(value?: string) {
    const c = toEn(value ?? code).replace(/\D/g, '');
    if (c.length !== CODE_LENGTH) return;
    setLoading(true);
    const ok = await verifyCode(c);
    setLoading(false);
    if (ok) router.replace('/(auth)/profile');
    else {
      setError(fa.wrongCode);
      setCode('');
    }
  }

  async function handleResend() {
    if (timer > 0 || !pendingPhone) return;
    await sendCode(pendingPhone);
    setTimer(RESEND_SECONDS);
    setCode('');
    setError('');
  }

  const digits = toEn(code).split('');

  return (
    <Screen scroll={false}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <Pressable onPress={() => router.back()} style={styles.back} hitSlop={12}>
        <Ionicons name="chevron-forward" size={26} color={colors.text} />
      </Pressable>

      <Txt variant="title" style={{ marginTop: spacing.xl }}>
        {fa.verifyTitle}
      </Txt>
      <Txt variant="body" color={colors.textMuted} style={{ marginTop: spacing.sm }}>
        {fa.verifySubtitle}
      </Txt>
      <Txt
        variant="bodyBold"
        color={colors.primary}
        style={{ marginTop: spacing.xs, writingDirection: 'ltr', textAlign: 'right' }}
      >
        +۹۸ {pendingPhone ? formatIranPhone(pendingPhone) : ''}
      </Txt>

      {/* خانه‌های نمایشی کد؛ ورودی واقعی پشت آن‌ها مخفی است */}
      <Pressable style={styles.boxes} onPress={() => inputRef.current?.focus()}>
        {Array.from({ length: CODE_LENGTH }).map((_, i) => (
          <View
            key={i}
            style={[styles.box, digits[i] ? styles.boxFilled : null, error ? styles.boxError : null]}
          >
            <Txt variant="title" center>
              {digits[i] ? toFa(digits[i]) : ''}
            </Txt>
          </View>
        ))}
      </Pressable>

      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={(t) => {
          const c = toEn(t).replace(/\D/g, '').slice(0, CODE_LENGTH);
          setCode(c);
          if (error) setError('');
          if (c.length === CODE_LENGTH) handleVerify(c);
        }}
        keyboardType="number-pad"
        maxLength={CODE_LENGTH}
        style={styles.hiddenInput}
      />

      {error ? (
        <Txt variant="caption" center color={colors.accent} style={{ marginTop: spacing.md }}>
          {error}
        </Txt>
      ) : DEMO_MODE ? (
        <Txt variant="tiny" center color={colors.textFaint} style={{ marginTop: spacing.md }}>
          {fa.demoHint}
        </Txt>
      ) : null}

      <View style={styles.resendRow}>
        {timer > 0 ? (
          <Txt variant="caption" color={colors.textMuted}>
            {fa.resendIn} {toFa(timer)} {fa.seconds}
          </Txt>
        ) : (
          <Pressable onPress={handleResend}>
            <Txt variant="caption" color={colors.accent}>
              {fa.resend}
            </Txt>
          </Pressable>
        )}
      </View>

        <View style={{ flex: 1 }} />

        <View style={styles.footer}>
          <Button
            label={fa.verifyButton}
            onPress={() => handleVerify()}
            loading={loading}
            disabled={code.length !== CODE_LENGTH}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start' },
  boxes: {
    // کد تأیید عددی است و باید چپ‌به‌راست خوانده شود (رقم اول سمت چپ)
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.xxl,
  },
  box: {
    flex: 1,
    height: 64,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: { borderColor: colors.primary },
  boxError: { borderColor: colors.accent },
  hiddenInput: { position: 'absolute', opacity: 0, height: 1, width: 1 },
  resendRow: { alignItems: 'center', marginTop: spacing.xl },
  footer: { paddingBottom: spacing.lg },
});
