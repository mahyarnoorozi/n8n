import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card, Screen, SectionHeader, Tag, Txt } from '@/components';
import { dailyQuestions } from '@/data/content';
import { colors, radius, shadow, spacing } from '@/theme';
import { formatJalali, jalaliWeekday } from '@/utils/jalali';
import { toFa } from '@/utils/persian';

/**
 * تب «سؤال روز» — حسّ یک آیینِ روزانه.
 *
 * - بالا: کارتِ بزرگِ سؤالِ امروز با تاریخ و دعوت به پاسخ.
 * - فیلترِ دسته‌بندی برای کاوش بر اساس موضوع.
 * - لیستِ بقیه سؤال‌ها به‌صورت لیستِ مرتبِ کم‌نویز.
 *
 * انتخابِ سؤال امروز: بر اساس روزِ سال تا برای همهٔ کاربران یکی باشد
 * و هر روز یک سؤالِ تازه بیاید.
 */

function dayOfYear(d: Date) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

const ALL = 'all' as const;
type CatFilter = typeof ALL | string;

export default function Questions() {
  const router = useRouter();
  const today = useMemo(() => new Date(), []);
  const todays = dailyQuestions[dayOfYear(today) % dailyQuestions.length];

  const categories = useMemo(() => {
    const set = new Set(dailyQuestions.map((q) => q.category));
    return [ALL, ...Array.from(set)];
  }, []);
  const [filter, setFilter] = useState<CatFilter>(ALL);

  const others = useMemo(
    () =>
      dailyQuestions.filter(
        (q) => q.id !== todays.id && (filter === ALL || q.category === filter),
      ),
    [filter, todays.id],
  );

  return (
    <Screen>
      <Txt variant="title">سؤال روز</Txt>
      <Txt variant="body" color={colors.textMuted} style={{ marginTop: spacing.xs }}>
        هر روز یک سؤال تازه برای نزدیک‌تر شدن. هر دو نفر پاسخ بدید تا جوابِ هم آشکار بشه.
      </Txt>

      {/* کارتِ آیینیِ امروز */}
      <Pressable onPress={() => router.push(`/question/${todays.id}`)} style={styles.hero}>
        <View style={styles.heroGlow} />
        <View style={styles.heroTop}>
          <View style={styles.dateChip}>
            <Ionicons name="calendar" size={14} color={colors.accent} />
            <Txt variant="tiny" color={colors.accent}>
              {jalaliWeekday(today)} • {formatJalali(today)}
            </Txt>
          </View>
          <View style={styles.todayBadge}>
            <Txt variant="tiny" color={colors.textInverse}>
              امروز
            </Txt>
          </View>
        </View>

        <Txt variant="title" color={colors.textInverse} style={{ marginTop: spacing.lg }}>
          {todays.text}
        </Txt>

        <View style={styles.heroFooter}>
          <Tag label={todays.category} />
          <View style={styles.cta}>
            <Txt variant="bodyBold" color={colors.textInverse}>
              پاسخ بده
            </Txt>
            <Ionicons name="arrow-back" size={18} color={colors.textInverse} />
          </View>
        </View>
      </Pressable>

      {/* فیلتر دسته‌بندی‌ها */}
      <SectionHeader title="کاوش بر اساس موضوع" />
      <View style={styles.filters}>
        {categories.map((c) => {
          const active = filter === c;
          return (
            <Pressable
              key={c}
              onPress={() => setFilter(c)}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Txt variant="tiny" color={active ? colors.textInverse : colors.textMuted}>
                {c === ALL ? 'همه' : c}
              </Txt>
            </Pressable>
          );
        })}
      </View>

      {/* لیستِ کم‌نویز */}
      <Card style={{ marginTop: spacing.md }} padded={false}>
        {others.map((q, i) => (
          <Pressable
            key={q.id}
            onPress={() => router.push(`/question/${q.id}`)}
            style={[styles.row, i > 0 && styles.rowBorder]}
          >
            <View style={styles.rowDot} />
            <View style={{ flex: 1 }}>
              <Txt variant="tiny" color={colors.accent}>
                {q.category}
              </Txt>
              <Txt variant="subtitle" style={{ marginTop: 2 }}>
                {q.text}
              </Txt>
            </View>
            <Ionicons name="chevron-back" size={18} color={colors.textFaint} />
          </Pressable>
        ))}
      </Card>

      <Txt variant="tiny" center color={colors.textFaint} style={{ marginTop: spacing.lg }}>
        {toFa(dailyQuestions.length)} سؤال در مجموع
      </Txt>
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
    top: -50,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.accentWarm,
    opacity: 0.4,
  },
  heroTop: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  dateChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  todayBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  heroFooter: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
  cta: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.xs },

  filters: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: spacing.sm },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  filterChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },

  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  rowDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
});
