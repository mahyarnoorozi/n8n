import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
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
    if (!valid) {
      setError(fa.phoneInvalid);
      return;
    }
    setError('');
    setLoading(true);
    await sendCode(phone);
    setLoading(false);
    router.push('/(auth)/verify');
  }

  return (
    <Screen scroll={false}>
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
          <Txt variant="bodyBold" color={colors.textMuted}>
            ‎+۹۸
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
        />
      </View>
      {error ? (
        <Txt variant="caption" color={colors.accent} style={{ marginTop: spacing.sm }}>
          {error}
        </Txt>
      ) : null}

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
    flexDirection: 'row-reverse',
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
    paddingLeft: spacing.md,
    marginLeft: spacing.md,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  input: {
    flex: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: fonts.medium,
    fontSize: 18,
    color: colors.text,
    letterSpacing: 2,
  },
  footer: { position: 'absolute', bottom: spacing.lg, left: spacing.lg, right: spacing.lg },
});
