import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Avatar, Button, JalaliDatePicker, Screen, Txt } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { fa } from '@/i18n/fa';
import { colors, fonts, radius, spacing } from '@/theme';

export default function ProfileSetup() {
  const router = useRouter();
  const { completeProfile } = useAuth();
  const [name, setName] = useState('');
  const [partner, setPartner] = useState('');
  const [anniversary, setAnniversary] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFinish() {
    setLoading(true);
    await completeProfile({
      name: name.trim() || 'من',
      partnerName: partner.trim() || undefined,
      anniversary: (anniversary ?? new Date()).toISOString(),
    });
    setLoading(false);
    router.replace('/welcome');
  }

  return (
    <Screen>
      <View style={styles.avatars}>
        <Avatar name={name || 'م'} size={64} color={colors.primary} />
        <View style={styles.linkDot}>
          <Txt color={colors.accent} style={{ fontSize: 22 }}>
            ♥
          </Txt>
        </View>
        <Avatar name={partner || '؟'} size={64} color={colors.accent} />
      </View>

      <Txt variant="title" center style={{ marginTop: spacing.lg }}>
        {fa.profileTitle}
      </Txt>
      <Txt variant="body" center color={colors.textMuted} style={{ marginTop: spacing.xs }}>
        {fa.profileSubtitle}
      </Txt>

      <Field label={fa.nameLabel} value={name} onChange={setName} placeholder={fa.namePlaceholder} />
      <Field
        label={fa.partnerLabel}
        value={partner}
        onChange={setPartner}
        placeholder={fa.partnerPlaceholder}
      />

      <View style={{ marginTop: spacing.xl }}>
        <Txt variant="caption" style={{ marginBottom: spacing.sm }}>
          {fa.anniversaryLabel}
        </Txt>
        <JalaliDatePicker
          value={anniversary}
          onChange={setAnniversary}
          placeholder="مثلاً ۱ فروردین ۱۴۰۳"
        />
      </View>

      <Button
        label={fa.finish}
        onPress={handleFinish}
        loading={loading}
        disabled={!name.trim()}
        style={{ marginTop: spacing.xxl }}
      />
    </Screen>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (t: string) => void;
  placeholder: string;
}) {
  return (
    <View style={{ marginTop: spacing.xl }}>
      <Txt variant="caption" style={{ marginBottom: spacing.sm }}>
        {label}
      </Txt>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  avatars: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  linkDot: { paddingHorizontal: spacing.xs },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    height: 56,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.text,
  },
});
