import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Avatar, Card, EmptyState, Screen, SkeletonList, Txt, useToast } from '@/components';
import { api, type Memory } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import { fa } from '@/i18n/fa';
import { colors, fonts, radius, spacing } from '@/theme';
import { JALALI_MONTHS, formatJalali, toJalaliParts } from '@/utils/jalali';
import { toFa } from '@/utils/persian';

/**
 * تب «خاطره‌ها» — دفترخاطراتِ دونفره.
 *
 * - خاطره‌ها به‌صورتِ تایم‌لاینِ ماه‌به‌ماهِ شمسی گروه‌بندی می‌شوند.
 * - هر خاطره می‌تواند یک عکس همراه داشته باشد (روی همین گوشی).
 * - حالتِ خالی، پیشنهادهای آماده برای شروع نشان می‌دهد.
 */

const SEED_PROMPTS = [
  'اولین لحظهٔ امروز که بهت فکر کردم...',
  'بهترین حرفی که این هفته بهم زدی...',
  'یه چیزی که امروز ازت یاد گرفتم...',
  'یه لحظهٔ خنده‌دار از این هفته...',
];

type Group = { key: string; label: string; items: Memory[] };

function groupByMonth(items: Memory[]): Group[] {
  const map = new Map<string, Group>();
  for (const m of items) {
    const d = new Date(m.createdAt);
    const { jy, jm } = toJalaliParts(d);
    const key = `${jy}-${jm}`;
    const label = `${JALALI_MONTHS[jm - 1]} ${toFa(jy)}`;
    if (!map.has(key)) map.set(key, { key, label, items: [] });
    map.get(key)!.items.push(m);
  }
  return Array.from(map.values());
}

export default function Memories() {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    (async () => {
      const [list, photoMap] = await Promise.all([
        api.getMemories(),
        api.getMemoryPhotoMap(),
      ]);
      // به هر خاطره‌ای که قبلاً عکسش روی همین گوشی ذخیره شده، آن را الصاق کن
      const merged = list.map((m) =>
        m.photoUri ? m : { ...m, photoUri: photoMap[m.id] ?? null },
      );
      setMemories(merged);
      setLoading(false);
    })();
  }, []);

  async function pickPhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    });
    if (!res.canceled && res.assets?.[0]?.uri) setPhotoUri(res.assets[0].uri);
  }

  async function addMemory(seedText?: string) {
    const finalText = (seedText ?? text).trim();
    if (!finalText && !photoUri) return;
    setSaving(true);
    try {
      const m = await api.addMemory(finalText || ' ', photoUri);
      setMemories((prev) => [{ ...m, photoUri }, ...prev]);
      setText('');
      setPhotoUri(null);
      setComposerOpen(false);
      toast.show('خاطره ثبت شد 🖤', 'success');
    } finally {
      setSaving(false);
    }
  }

  const groups = useMemo(() => groupByMonth(memories), [memories]);
  const authorName = (m: Memory) =>
    m.author === 'me' ? user?.name ?? 'من' : user?.partnerName ?? 'نیمهٔ دیگر';

  return (
    <Screen>
      <Txt variant="title">{fa.memoriesTitle}</Txt>
      <Txt variant="body" color={colors.textMuted} style={{ marginTop: spacing.xs }}>
        دفترِ مشترکِ شما دو نفر — لحظه‌های قشنگ، عکس‌ها و کوچک‌ترین خاطره‌ها.
      </Txt>

      {/* کامپوزر */}
      {composerOpen ? (
        <Card style={{ marginTop: spacing.lg }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={fa.memoryPlaceholder}
            placeholderTextColor={colors.textFaint}
            multiline
            style={styles.input}
            autoFocus
          />
          {photoUri ? (
            <View style={styles.preview}>
              <Image source={{ uri: photoUri }} style={styles.previewImg} />
              <Pressable onPress={() => setPhotoUri(null)} style={styles.removePhoto} hitSlop={8}>
                <Ionicons name="close" size={16} color={colors.surface} />
              </Pressable>
            </View>
          ) : null}
          <View style={styles.composerActions}>
            <Pressable onPress={pickPhoto} style={styles.photoBtn} hitSlop={8}>
              <Ionicons name="image-outline" size={18} color={colors.accent} />
              <Txt variant="caption" color={colors.accent}>
                {photoUri ? 'تعویض عکس' : 'افزودن عکس'}
              </Txt>
            </Pressable>
            <View style={{ flexDirection: 'row-reverse', gap: spacing.sm }}>
              <Pressable
                onPress={() => {
                  setComposerOpen(false);
                  setText('');
                  setPhotoUri(null);
                }}
                hitSlop={8}
                style={styles.cancelBtn}
              >
                <Txt variant="caption" color={colors.textMuted}>
                  انصراف
                </Txt>
              </Pressable>
              <Pressable
                onPress={() => addMemory()}
                disabled={(!text.trim() && !photoUri) || saving}
                style={[
                  styles.saveBtn,
                  (!text.trim() && !photoUri) || saving ? { opacity: 0.5 } : null,
                ]}
              >
                {saving ? (
                  <ActivityIndicator color={colors.textInverse} size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={16} color={colors.textInverse} />
                    <Txt variant="caption" color={colors.textInverse}>
                      ثبت
                    </Txt>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </Card>
      ) : (
        <Pressable style={styles.composerHint} onPress={() => setComposerOpen(true)}>
          <View style={styles.composerIcon}>
            <Ionicons name="create-outline" size={20} color={colors.accent} />
          </View>
          <Txt variant="body" color={colors.textMuted} style={{ flex: 1 }}>
            یه خاطره ثبت کن…
          </Txt>
          <Ionicons name="add" size={22} color={colors.accent} />
        </Pressable>
      )}

      {/* محتوا */}
      {loading ? (
        <SkeletonList count={3} />
      ) : memories.length === 0 ? (
        <MemoriesEmpty onPickSeed={(s) => { setText(s); setComposerOpen(true); }} />
      ) : (
        <View style={{ marginTop: spacing.xl, gap: spacing.xl }}>
          {groups.map((g) => (
            <View key={g.key}>
              <View style={styles.monthHead}>
                <View style={styles.monthDot} />
                <Txt variant="bodyBold">{g.label}</Txt>
                <View style={styles.monthLine} />
                <Txt variant="tiny" color={colors.textFaint}>
                  {toFa(g.items.length)} خاطره
                </Txt>
              </View>
              <View style={{ gap: spacing.md }}>
                {g.items.map((m) => (
                  <Card key={m.id}>
                    <View style={styles.memHeader}>
                      <Avatar
                        name={authorName(m)}
                        size={36}
                        color={m.author === 'me' ? colors.ink : colors.accent}
                      />
                      <View style={{ flex: 1 }}>
                        <Txt variant="bodyBold">{authorName(m)}</Txt>
                        <Txt variant="tiny" color={colors.textFaint}>
                          {formatJalali(new Date(m.createdAt))}
                        </Txt>
                      </View>
                      <Ionicons
                        name="heart"
                        size={18}
                        color={m.author === 'me' ? colors.accentSoft : colors.accent}
                      />
                    </View>
                    {m.photoUri ? (
                      <Image source={{ uri: m.photoUri }} style={styles.memImage} />
                    ) : null}
                    {m.text?.trim() ? (
                      <Txt variant="body" style={{ marginTop: spacing.sm }}>
                        {m.text}
                      </Txt>
                    ) : null}
                  </Card>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

function MemoriesEmpty({ onPickSeed }: { onPickSeed: (seed: string) => void }) {
  return (
    <View style={{ marginTop: spacing.xxl }}>
      <EmptyState
        icon="images-outline"
        tone="lilac"
        title="دفترِ خاطره‌هاتون خالیه"
        body="با یه جمله، یه عکس یا فقط یه فکر شروع کن. این‌جا فقط متعلق به شما دو نفره."
      />
      <Txt variant="caption" color={colors.textMuted} style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
        یه پیشنهاد برای شروع:
      </Txt>
      <View style={{ gap: spacing.sm }}>
        {SEED_PROMPTS.map((s) => (
          <Pressable key={s} style={styles.seed} onPress={() => onPickSeed(s)}>
            <Ionicons name="bulb-outline" size={16} color={colors.accent} />
            <Txt variant="body" style={{ flex: 1 }}>
              {s}
            </Txt>
            <Ionicons name="chevron-back" size={16} color={colors.textFaint} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  composerHint: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  composerIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
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
  preview: { marginTop: spacing.md, position: 'relative' },
  previewImg: { width: '100%', height: 200, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  removePhoto: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(27,26,41,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerActions: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  photoBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.accentTint,
  },
  cancelBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  saveBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },

  monthHead: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  monthDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  monthLine: { flex: 1, height: 1, backgroundColor: colors.border },

  memHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm },
  memImage: {
    width: '100%',
    height: 220,
    borderRadius: radius.md,
    marginTop: spacing.md,
    backgroundColor: colors.surfaceAlt,
  },

  seed: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
