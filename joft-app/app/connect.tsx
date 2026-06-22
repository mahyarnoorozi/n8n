import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Button, Card, Screen, Skeleton, Txt } from '@/components';
import { api } from '@/api/client';
import { DEMO_MODE } from '@/config';
import { useAuth } from '@/context/AuthContext';
import { fa } from '@/i18n/fa';
import { colors, fonts, radius, spacing } from '@/theme';

export default function Connect() {
  const router = useRouter();
  const { user, completeProfile } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [linked, setLinked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const r = await api.createInvite();
        setInviteCode(r.inviteCode);
        setLinked(r.linked);
      } catch {
        setError('برای اتصال واقعی باید سرور تنظیم شود (حالت دمو فعال است).');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function copy() {
    await Clipboard.setStringAsync(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function join() {
    const c = code.trim().toUpperCase();
    if (c.length !== 6) {
      setError('کد باید ۶ حرف باشد.');
      return;
    }
    setJoining(true);
    setError('');
    try {
      const r = await api.joinCouple(c);
      if (r.ok) {
        setLinked(true);
        if (r.partnerName) await completeProfile({ partnerName: r.partnerName });
      }
    } catch (e: any) {
      setError(e?.message || 'اتصال ناموفق بود.');
    } finally {
      setJoining(false);
    }
  }

  return (
    <Screen>
      <View style={styles.topbar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-forward" size={26} color={colors.text} />
        </Pressable>
        <Txt variant="heading">{fa.connectTitle}</Txt>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.hero}>
        <View style={styles.heartWrap}>
          <Ionicons name="people" size={34} color={colors.accent} />
        </View>
        <Txt variant="body" center color={colors.textMuted} style={{ marginTop: spacing.md }}>
          {fa.connectSubtitle}
        </Txt>
      </View>

      {linked ? (
        <Card style={styles.linkedCard}>
          <Ionicons name="checkmark-circle" size={40} color={colors.success} />
          <Txt variant="heading" center style={{ marginTop: spacing.sm }}>
            {fa.connectedTitle}
          </Txt>
          <Txt variant="caption" center color={colors.textMuted} style={{ marginTop: spacing.xs }}>
            {fa.connectedDesc}
          </Txt>
          <Button
            label="بازگشت به خانه"
            onPress={() => router.replace('/(tabs)')}
            style={{ marginTop: spacing.lg, alignSelf: 'stretch' }}
          />
        </Card>
      ) : loading ? (
        <View style={{ marginTop: spacing.xl, gap: spacing.lg }}>
          <Skeleton width="35%" height={13} />
          <Card style={{ alignItems: 'center', gap: spacing.md }}>
            <Skeleton width="60%" height={40} radius={12} />
            <Skeleton width="80%" height={11} />
            <Skeleton width={120} height={32} radius={999} />
          </Card>
        </View>
      ) : (
        <>
          {/* کد دعوت من */}
          <Txt variant="caption" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
            {fa.yourInviteCode}
          </Txt>
          <Card style={{ alignItems: 'center' }}>
            <Txt center style={styles.codeBig} numberOfLines={1} adjustsFontSizeToFit>
              {inviteCode}
            </Txt>
            <Txt variant="tiny" center color={colors.textFaint} style={{ marginTop: spacing.xs }}>
              {fa.shareHint}
            </Txt>
            <Pressable onPress={copy} style={styles.copyBtn}>
              <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={16} color={colors.accent} />
              <Txt variant="caption" color={colors.accent}>
                {copied ? fa.copied : fa.copyCode}
              </Txt>
            </Pressable>
          </Card>

          {/* جداکننده */}
          <View style={styles.divider}>
            <View style={styles.line} />
            <Txt variant="caption" color={colors.textFaint}>
              {fa.orDivider}
            </Txt>
            <View style={styles.line} />
          </View>

          {/* وارد کردن کد طرف مقابل */}
          <Txt variant="caption" style={{ marginBottom: spacing.sm }}>
            {fa.enterPartnerCode}
          </Txt>
          <TextInput
            value={code}
            onChangeText={(t) => {
              setCode(t.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6));
              if (error) setError('');
            }}
            placeholder={fa.codePlaceholder}
            placeholderTextColor={colors.textFaint}
            autoCapitalize="characters"
            style={styles.codeInput}
          />
          {error ? (
            <Txt variant="caption" color={colors.accent} style={{ marginTop: spacing.sm }}>
              {error}
            </Txt>
          ) : null}
          <Button
            label={fa.connectButton}
            onPress={join}
            loading={joining}
            disabled={code.length !== 6}
            style={{ marginTop: spacing.lg }}
          />

          {DEMO_MODE ? (
            <Txt variant="tiny" center color={colors.textFaint} style={{ marginTop: spacing.md }}>
              در حالت دمو اتصال واقعی انجام نمی‌شود؛ برای اتصال دو گوشی، سرور را تنظیم کن.
            </Txt>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  hero: { alignItems: 'center', marginTop: spacing.sm },
  heartWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkedCard: { alignItems: 'center', marginTop: spacing.xl },
  codeBig: {
    fontFamily: fonts.black,
    fontSize: 36,
    lineHeight: 48,
    letterSpacing: 6,
    color: colors.accent,
    writingDirection: 'ltr',
    paddingHorizontal: spacing.sm,
  },
  copyBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    backgroundColor: colors.accentTint,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: spacing.xl },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  codeInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    height: 58,
    textAlign: 'center',
    writingDirection: 'ltr',
    fontFamily: fonts.bold,
    fontSize: 22,
    letterSpacing: 6,
    color: colors.text,
  },
});
