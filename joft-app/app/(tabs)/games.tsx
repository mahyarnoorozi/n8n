import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card, IconChip, Screen, SectionHeader, Tag, Txt } from '@/components';
import { articles } from '@/data/content';
import { visibleCards } from '@/data/desires';
import { getDesireState, swipeCount } from '@/storage/desires';
import { colors, radius, shadow, spacing } from '@/theme';
import { toFa } from '@/utils/persian';

/**
 * تب «بازی‌ها» — هابِ بخش‌های صمیمت و سرگرمیِ زوجی.
 *
 * قهرمانِ صفحه: «تطبیق خواسته‌ها» (بازیِ اصلیِ اپ) با نوارِ پیشرفتِ زنده.
 * بقیه: بازی‌های سبک‌ترِ شناخت و کتابخانهٔ مقاله‌های کارشناسی.
 */
export default function Games() {
  const router = useRouter();
  const [desireCount, setDesireCount] = useState(0);
  const [desireTotal, setDesireTotal] = useState(0);

  useFocusEffect(
    useCallback(() => {
      getDesireState().then((s) => {
        setDesireCount(swipeCount(s));
        setDesireTotal(visibleCards(s.settings.contentLevel).length);
      });
    }, []),
  );

  return (
    <Screen>
      <Txt variant="title">بازی‌ها</Txt>
      <Txt variant="body" color={colors.textMuted} style={{ marginTop: spacing.xs }}>
        ایده‌هایی برای نزدیک‌تر شدن، گفت‌وگو و کشفِ سلیقه‌های هم.
      </Txt>

      {/* قهرمان — تطبیق خواسته‌ها */}
      <Pressable onPress={() => router.push('/desire-match')} style={styles.hero}>
        <View style={styles.heroGlow} />
        <View style={styles.heroHead}>
          <View style={styles.heroBadge}>
            <Txt variant="tiny" color={colors.accent}>
              ✨ بازیِ اصلی
            </Txt>
          </View>
          <Ionicons name="chevron-back" size={20} color={colors.textInverse} />
        </View>
        <Txt variant="title" color={colors.textInverse} style={{ marginTop: spacing.md }}>
          تطبیق خواسته‌ها
        </Txt>
        <Txt variant="body" color={colors.accentTint} style={{ marginTop: spacing.xs }}>
          هر دو نفر جداگانه به ایده‌ها پاسخ بدید؛ فقط چیزی که هر دو خواستید، تطابق می‌شه.
        </Txt>

        {desireTotal > 0 ? (
          <View style={styles.heroStats}>
            <View style={styles.heroProgressTrack}>
              <View
                style={[
                  styles.heroProgressFill,
                  { width: `${Math.min(100, (desireCount / desireTotal) * 100)}%` },
                ]}
              />
            </View>
            <Txt variant="tiny" color={colors.accentTint} style={{ marginTop: spacing.sm }}>
              {desireCount > 0
                ? `${toFa(desireCount)} از ${toFa(desireTotal)} کارت پاسخ داده شده`
                : 'هنوز شروع نکردی — یه دقیقه وقت ببره'}
            </Txt>
          </View>
        ) : null}
      </Pressable>

      {/* میان‌بُرها: تطابق‌ها و چالش */}
      <View style={styles.shortcuts}>
        <Pressable style={styles.shortcut} onPress={() => router.push('/desire-matches')}>
          <View style={[styles.shortcutIcon, { backgroundColor: colors.accentTint }]}>
            <Ionicons name="heart" size={20} color={colors.accent} />
          </View>
          <Txt variant="bodyBold">تطابق‌های ما</Txt>
          <Txt variant="tiny" color={colors.textMuted}>
            ایده‌هایی که هر دو می‌خواید
          </Txt>
        </Pressable>
        <Pressable style={styles.shortcut} onPress={() => router.push('/desire-match')}>
          <View style={[styles.shortcutIcon, { backgroundColor: '#FFF6E5' }]}>
            <Ionicons name="flame" size={20} color="#F5A623" />
          </View>
          <Txt variant="bodyBold">ادامهٔ بازی</Txt>
          <Txt variant="tiny" color={colors.textMuted}>
            چند کارت دیگه پاسخ بده
          </Txt>
        </Pressable>
      </View>

      {/* مقاله‌ها و توصیه‌های کارشناسی */}
      <SectionHeader title="بخوان و یاد بگیر" />
      <View style={{ gap: spacing.md }}>
        {articles.map((a) => (
          <Card key={a.id} onPress={() => router.push(`/article/${a.id}`)} style={styles.article}>
            <View style={styles.gameRow}>
              <IconChip icon={a.icon as any} size={44} tone={a.tone} />
              <View style={{ flex: 1 }}>
                <Txt variant="bodyBold" style={{ lineHeight: 26 }}>
                  {a.title}
                </Txt>
                <View style={styles.metaRow}>
                  <Tag label={a.category} />
                  <Txt variant="tiny" color={colors.textFaint}>
                    {a.readTime}
                  </Txt>
                </View>
              </View>
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: spacing.xl,
    backgroundColor: colors.accent,
    borderRadius: radius.xl,
    padding: spacing.xl,
    overflow: 'hidden',
    ...shadow.card,
  },
  heroGlow: {
    position: 'absolute',
    top: -40,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.accentWarm,
    opacity: 0.45,
  },
  heroHead: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  heroBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  heroStats: { marginTop: spacing.lg },
  heroProgressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  heroProgressFill: { height: 6, borderRadius: 999, backgroundColor: colors.surface },

  shortcuts: { flexDirection: 'row-reverse', gap: spacing.md, marginTop: spacing.lg },
  shortcut: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  shortcutIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },

  gameRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md },
  article: { overflow: 'hidden' },
  accentBar: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.accent,
  },
  metaRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
});
