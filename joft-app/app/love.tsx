import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Button, Card, Screen, Txt } from '@/components';
import { api } from '@/api/client';
import { DEMO_MODE } from '@/config';
import { useAuth } from '@/context/AuthContext';
import { loveSuggestions, randomNudge } from '@/data/loveMessages';
import { getSettings, saveSettings } from '@/storage/local';
import { colors, fonts, radius, spacing } from '@/theme';
import { cancelNotification, fireDemoLoveMessage, scheduleDailyLoveNudge } from '@/utils/notifications';

export default function Love() {
  const router = useRouter();
  const { user } = useAuth();
  const partner = user?.partnerName?.trim() || 'نیمهٔ دیگرت';

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [nudgeOn, setNudgeOn] = useState(false);
  const [linked, setLinked] = useState<boolean | null>(null);

  useEffect(() => {
    getSettings().then((s) => setNudgeOn(s.loveNudgeEnabled));
    api.getMe().then((me) => setLinked(Boolean(me?.couple?.linked)));
  }, []);

  async function send(message: string) {
    const t = message.trim();
    if (!t) return;
    setSending(true);
    try {
      if (DEMO_MODE || !linked) {
        // وقتی هنوز به نیمهٔ دیگر وصل نیستی، فقط «پیش‌نمایش» نشان داده می‌شود
        await fireDemoLoveMessage(t, 4);
      } else {
        await api.sendLove(t);
      }
      setText('');
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } finally {
      setSending(false);
    }
  }

  async function toggleNudge() {
    const next = !nudgeOn;
    setNudgeOn(next);
    const s = await getSettings();
    await cancelNotification(s.loveNudgeId);
    let id: string | null = null;
    if (next) id = await scheduleDailyLoveNudge(randomNudge(partner));
    await saveSettings({ loveNudgeEnabled: next, loveNudgeId: id });
  }

  return (
    <Screen>
      <View style={styles.topbar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-forward" size={26} color={colors.text} />
        </Pressable>
        <Txt variant="heading">صمیمت</Txt>
        <View style={{ width: 26 }} />
      </View>

      {/* کارت حسی */}
      <Card style={styles.hero}>
        <View style={styles.heartWrap}>
          <Ionicons name="heart" size={30} color={colors.accent} />
        </View>
        <Txt variant="subtitle" center style={{ marginTop: spacing.md }}>
          الان وقت خوبیه به {partner} یه پیام عاشقانه بدی
        </Txt>
        <Txt variant="caption" center color={colors.textMuted} style={{ marginTop: spacing.xs }}>
          همین لحظه‌های کوچک‌اند که رابطه را گرم نگه می‌دارند.
        </Txt>
      </Card>

      {/* هشدار اتصال — وقتی هنوز جفت نشده */}
      {linked === false ? (
        <Pressable style={styles.connectBanner} onPress={() => router.push('/connect')}>
          <Ionicons name="link-outline" size={20} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Txt variant="bodyBold" color={colors.accent}>
              هنوز به نیمهٔ دیگرت وصل نیستی
            </Txt>
            <Txt variant="tiny" color={colors.textMuted} style={{ marginTop: 2 }}>
              برای ارسال واقعی پیام، اول با کد دعوت وصل شو. اینجا فقط پیش‌نمایش می‌بینی.
            </Txt>
          </View>
          <Txt variant="caption" color={colors.accent}>
            وصل شدن ←
          </Txt>
        </Pressable>
      ) : null}

      {/* پیشنهادها */}
      <Txt variant="caption" style={{ marginTop: spacing.xl, marginBottom: spacing.xs }}>
        یکی را انتخاب کن یا خودت بنویس
      </Txt>
      <Txt variant="tiny" color={colors.textFaint} style={{ marginBottom: spacing.md }}>
        با زدن روی هر پیام آماده، همان لحظه فرستاده می‌شود؛ یا در باکس پایین خودت بنویس و بفرست.
      </Txt>
      <View style={styles.chips}>
        {loveSuggestions.map((s) => (
          <Pressable key={s} style={styles.chip} onPress={() => send(s)} disabled={sending}>
            <Txt variant="caption" color={colors.text}>
              {s}
            </Txt>
          </Pressable>
        ))}
      </View>

      {/* نوشتن دلخواه */}
      <Card style={{ marginTop: spacing.lg }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="پیام دلخواهت را بنویس…"
          placeholderTextColor={colors.textFaint}
          multiline
          style={styles.input}
        />
        <Button
          label={sent ? 'ارسال شد ✅' : 'فرستادن پیام'}
          icon="paper-plane"
          onPress={() => send(text)}
          loading={sending}
          disabled={!text.trim()}
          style={{ marginTop: spacing.md }}
        />
      </Card>

      {sent ? (
        <Txt variant="caption" center color={colors.success} style={{ marginTop: spacing.md }}>
          {linked ? 'پیامت برای نیمهٔ دیگرت فرستاده شد 💞' : 'پیش‌نمایش ارسال شد؛ چند لحظه دیگر اعلانش را می‌بینی 💌'}
        </Txt>
      ) : null}

      {/* یادآوری روزانه */}
      <Pressable onPress={toggleNudge} style={[styles.nudgeCard, nudgeOn && styles.nudgeOn]}>
        <Ionicons
          name={nudgeOn ? 'notifications' : 'notifications-outline'}
          size={22}
          color={nudgeOn ? colors.accent : colors.textMuted}
        />
        <View style={{ flex: 1 }}>
          <Txt variant="bodyBold">یادآوری‌های عاشقانهٔ روزانه</Txt>
          <Txt variant="tiny" color={colors.textMuted} style={{ marginTop: 2 }}>
            هر روز در ساعتی مناسب (۱۱ صبح تا ۹ شب) یادت می‌اندازیم که یه پیام بدی.
          </Txt>
        </View>
        <View style={[styles.dot, nudgeOn && { backgroundColor: colors.accent }]} />
      </Pressable>

      {DEMO_MODE ? (
        <Txt variant="tiny" center color={colors.textFaint} style={{ marginTop: spacing.md }}>
          در حالت دمو، پیام به‌صورت یک اعلان نمونه روی همین گوشی نشان داده می‌شود. با اتصال به
          نیمهٔ دیگر و تنظیم سرور، پیام واقعاً برای او ارسال می‌شود.
        </Txt>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  hero: { alignItems: 'center', backgroundColor: colors.accentTint, borderColor: colors.accentSoft },
  connectBanner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accentTint,
    borderWidth: 1,
    borderColor: colors.accentSoft,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  heartWrap: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  input: {
    minHeight: 80,
    textAlign: 'right',
    writingDirection: 'rtl',
    textAlignVertical: 'top',
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  nudgeCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  nudgeOn: { borderColor: colors.accent, backgroundColor: colors.accentTint },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.border,
  },
});
