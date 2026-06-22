import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, TextInput, View } from 'react-native';
import { Avatar, Button, Card, JalaliDatePicker, Screen, Txt } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { getSettings, saveSettings } from '@/storage/local';
import { randomNudge } from '@/data/loveMessages';
import { colors, fonts, radius, spacing } from '@/theme';
import { cancelNotification, scheduleDailyLoveNudge } from '@/utils/notifications';

export default function Settings() {
  const router = useRouter();
  const { user, completeProfile } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [partner, setPartner] = useState(user?.partnerName ?? '');
  const [anniversary, setAnniversary] = useState<Date | null>(
    user?.anniversary ? new Date(user.anniversary) : null,
  );
  const [photo, setPhoto] = useState<string | null>(user?.photo ?? null);
  const [avatarKind, setAvatarKind] = useState<'man' | 'woman' | null>(user?.avatarKind ?? null);
  const [saved, setSaved] = useState(false);
  const [nudgeOn, setNudgeOn] = useState(false);

  useEffect(() => {
    getSettings().then((s) => setNudgeOn(s.loveNudgeEnabled));
  }, []);

  async function pickPhoto() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (!res.canceled && res.assets[0]) {
      setPhoto(res.assets[0].uri);
      setAvatarKind(null);
    }
  }

  function chooseFaceless(kind: 'man' | 'woman') {
    setAvatarKind(kind);
    setPhoto(null);
  }

  async function save() {
    await completeProfile({
      name: name.trim() || 'من',
      partnerName: partner.trim() || undefined,
      anniversary: (anniversary ?? new Date()).toISOString(),
      photo,
      avatarKind,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function toggleNudge() {
    const next = !nudgeOn;
    setNudgeOn(next);
    const s = await getSettings();
    await cancelNotification(s.loveNudgeId);
    let id: string | null = null;
    if (next) id = await scheduleDailyLoveNudge(randomNudge(partner || 'نیمهٔ دیگرت'));
    await saveSettings({ loveNudgeEnabled: next, loveNudgeId: id });
  }

  const infoItems: { icon: keyof typeof Ionicons.glyphMap; label: string; topic: string }[] = [
    { icon: 'language-outline', label: 'زبان', topic: 'language' },
    { icon: 'lock-closed-outline', label: 'حریم خصوصی و امنیت', topic: 'privacy' },
    { icon: 'help-circle-outline', label: 'پشتیبانی و تماس با ما', topic: 'support' },
    { icon: 'information-circle-outline', label: 'دربارهٔ جفتیما', topic: 'about' },
  ];

  return (
    <Screen>
      <View style={styles.topbar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-forward" size={26} color={colors.text} />
        </Pressable>
        <Txt variant="heading">تنظیمات</Txt>
        <View style={{ width: 26 }} />
      </View>

      {/* پروفایل */}
      <Card style={{ marginTop: spacing.lg, alignItems: 'center' }}>
        <Avatar name={name} size={88} photoUri={photo} faceless={avatarKind} color={colors.accent} />

        <View style={styles.avatarActions}>
          <Pressable style={styles.avatarBtn} onPress={pickPhoto}>
            <Ionicons name="camera-outline" size={18} color={colors.accent} />
            <Txt variant="tiny" color={colors.accent}>
              عکس
            </Txt>
          </Pressable>
          <Pressable
            style={[styles.avatarBtn, avatarKind === 'man' && styles.avatarBtnActive]}
            onPress={() => chooseFaceless('man')}
          >
            <Ionicons name="man" size={18} color={colors.textMuted} />
            <Txt variant="tiny" color={colors.textMuted}>
              آقا
            </Txt>
          </Pressable>
          <Pressable
            style={[styles.avatarBtn, avatarKind === 'woman' && styles.avatarBtnActive]}
            onPress={() => chooseFaceless('woman')}
          >
            <Ionicons name="woman" size={18} color={colors.textMuted} />
            <Txt variant="tiny" color={colors.textMuted}>
              خانم
            </Txt>
          </Pressable>
        </View>

        <Field label="نام تو" value={name} onChange={setName} placeholder="نامت" />
        <Field label="نام نیمهٔ دیگر" value={partner} onChange={setPartner} placeholder="نام او" />

        <View style={{ alignSelf: 'stretch', marginTop: spacing.lg }}>
          <Txt variant="caption" style={{ marginBottom: spacing.sm }}>
            سالگرد آشنایی
          </Txt>
          <JalaliDatePicker value={anniversary} onChange={setAnniversary} />
        </View>

        <Button
          label={saved ? 'ذخیره شد ✅' : 'ذخیرهٔ پروفایل'}
          onPress={save}
          style={{ marginTop: spacing.lg, alignSelf: 'stretch' }}
        />
      </Card>

      {/* اعلان‌ها */}
      <Txt variant="caption" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
        اعلان‌ها و یادآوری‌ها
      </Txt>
      <Card padded={false}>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Txt variant="subtitle">یادآوری عاشقانهٔ روزانه</Txt>
            <Txt variant="tiny" color={colors.textMuted} style={{ marginTop: 2 }}>
              هر روز در ساعتی مناسب یادت می‌اندازیم یه پیام بدی.
            </Txt>
          </View>
          <Switch
            value={nudgeOn}
            onValueChange={toggleNudge}
            trackColor={{ true: colors.accent, false: colors.border }}
            thumbColor={colors.surface}
          />
        </View>
        <Pressable style={[styles.linkRow, styles.rowBorder]} onPress={() => router.push('/occasions')}>
          <Ionicons name="calendar-outline" size={20} color={colors.accent} />
          <Txt variant="subtitle" style={{ flex: 1 }}>
            یادآور مناسبت‌ها
          </Txt>
          <Ionicons name="chevron-back" size={18} color={colors.textFaint} />
        </Pressable>
      </Card>

      {/* بخش‌های عمومی */}
      <Txt variant="caption" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
        بیشتر
      </Txt>
      <Card padded={false}>
        {infoItems.map((it, i) => (
          <Pressable
            key={it.topic}
            style={[styles.linkRow, i > 0 && styles.rowBorder]}
            onPress={() => router.push(`/info?topic=${it.topic}`)}
          >
            <Ionicons name={it.icon} size={20} color={colors.accent} />
            <Txt variant="subtitle" style={{ flex: 1 }}>
              {it.label}
            </Txt>
            <Ionicons name="chevron-back" size={18} color={colors.textFaint} />
          </Pressable>
        ))}
      </Card>
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
    <View style={{ alignSelf: 'stretch', marginTop: spacing.lg }}>
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
  topbar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarActions: { flexDirection: 'row-reverse', gap: spacing.sm, marginTop: spacing.md },
  avatarBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  avatarBtnActive: { borderColor: colors.accent, backgroundColor: colors.accentTint },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    height: 54,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.text,
  },
  switchRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  linkRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
});
