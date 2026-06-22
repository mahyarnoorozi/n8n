import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, BannerCarousel, Card, IconChip, Screen, SectionHeader, Txt, type Banner } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { categories, dailyQuestions } from '@/data/content';
import { fa } from '@/i18n/fa';
import { getOccasions, type Occasion } from '@/storage/local';
import { getCycle } from '@/storage/cycle';
import { colors, radius, spacing, type Tone } from '@/theme';
import { daysSince, jalaliDayMonth } from '@/utils/jalali';
import { computeStatus, PHASE_META, type CycleStatus } from '@/utils/cycle';
import { toFa } from '@/utils/persian';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  // سؤال روز بر اساس روزِ سال انتخاب می‌شود تا با تب «سؤال روز» یکی باشد
  const _now = new Date();
  const _doy = Math.floor(
    (_now.getTime() - new Date(_now.getFullYear(), 0, 0).getTime()) / 86400000,
  );
  const today = dailyQuestions[_doy % dailyQuestions.length];

  const anniversary = user?.anniversary ? new Date(user.anniversary) : new Date();
  const togetherDays = daysSince(anniversary);

  // مناسبت‌ها از حافظهٔ محلی خوانده می‌شوند تا با افزودن/ویرایش هماهنگ بمانند
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [cycle, setCycle] = useState<CycleStatus | null>(null);
  useFocusEffect(
    useCallback(() => {
      getOccasions().then(setOccasions);
      getCycle().then((c) => {
        setCycle(
          c.periods.length > 0
            ? computeStatus(c.periods[0].startISO, c.cycleLength, c.periodLength)
            : null,
        );
      });
    }, []),
  );

  const fallbackEvents = [
    { title: 'سالگرد آشنایی', date: anniversary, icon: 'heart-outline' },
    {
      title: `تولد ${user?.partnerName ?? 'نیمهٔ دیگرت'}`,
      date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 12),
      icon: 'gift-outline',
    },
  ];
  const events =
    occasions.length > 0
      ? occasions.map((o) => ({ title: o.title, date: new Date(o.dateISO), icon: o.icon }))
      : fallbackEvents;

  const banners: Banner[] = [
    {
      id: 'desire',
      title: 'بازیِ تطبیق خواسته‌ها 💞',
      subtitle: 'ببین چه ایده‌هایی با هم دارید',
      icon: 'sparkles',
      tone: 'rose',
      onPress: () => router.push('/desire-match'),
    },
    {
      id: 'cycle',
      title: 'مراقبت و چرخه 🌸',
      subtitle: 'کنارِ هم، آگاه‌تر و مهربون‌تر',
      icon: 'flower',
      tone: 'lilac',
      onPress: () => router.push('/cycle'),
    },
    {
      id: 'premium',
      title: 'نسخهٔ ویژه ✨',
      subtitle: 'دسترسی کامل به همهٔ بخش‌ها',
      icon: 'star',
      tone: 'gold',
      onPress: () => router.push('/(tabs)/more'),
    },
  ];

  return (
    <Screen>
      {/* سربرگ */}
      <View style={styles.header}>
        <View>
          <Txt variant="caption" color={colors.textMuted}>
            سلام {user?.name ?? ''} 👋
          </Txt>
          <Txt variant="heading">امروز چه خبر؟</Txt>
        </View>
        <Pressable onPress={() => router.push('/(tabs)/more')}>
          <Avatar name={user?.name} size={46} photoUri={user?.photo} faceless={user?.avatarKind} color={colors.accent} />
        </Pressable>
      </View>

      {/* کارت رابطه */}
      <Card style={styles.relCard} padded>
        <View style={styles.relAvatars}>
          <Avatar name={user?.name} size={56} color={colors.ink} photoUri={user?.photo} faceless={user?.avatarKind} />
          <View style={styles.heartLink}>
            <Ionicons name="heart" size={20} color={colors.accent} />
          </View>
          <Avatar name={user?.partnerName} size={56} color={colors.accent} />
        </View>
        <Txt variant="caption" center color={colors.textMuted} style={{ marginTop: spacing.md }}>
          {fa.togetherFor}
        </Txt>
        <Txt variant="display" center color={colors.accent}>
          {toFa(togetherDays)} <Txt variant="heading" color={colors.text}>{fa.days}</Txt>
        </Txt>
      </Card>

      {/* بنرهای گرافیکیِ کوتاه و قابل‌اسکرول */}
      <View style={{ marginTop: spacing.lg }}>
        <BannerCarousel items={banners} />
      </View>

      {/* امروز — همهٔ کارهای روزانه در یک نگاه، تمیز و یکدست */}
      <SectionHeader title="امروز" />
      <Card padded={false}>
        <TodayRow
          icon="chatbubble-ellipses-outline"
          tone="sky"
          title="سؤال امروز"
          subtitle={today.text}
          onPress={() => router.push(`/question/${today.id}`)}
        />
        <TodayRow
          icon="sparkles-outline"
          tone="rose"
          title="تطبیق خواسته‌ها"
          subtitle="ببین چه ایده‌هایی با هم دارید"
          onPress={() => router.push('/desire-match')}
          divider
        />
        <TodayRow
          icon="flower-outline"
          tone="lilac"
          title="مراقبت و چرخه"
          subtitle={
            cycle
              ? cycle.isOnPeriod
                ? `روزهای پریود • روزِ ${toFa(cycle.dayInCycle)}`
                : `${toFa(cycle.daysUntilNextPeriod)} روز تا پریود بعدی • ${PHASE_META[cycle.phase].title}`
              : 'چرخه‌ات را اضافه کن'
          }
          onPress={() => router.push('/cycle')}
          divider
        />
        <TodayRow
          icon="heart-outline"
          tone="peach"
          title="پیام عاشقانه"
          subtitle={`دل ${user?.partnerName ?? 'نیمهٔ دیگرت'} رو ببر`}
          onPress={() => router.push('/love')}
          divider
        />
      </Card>

      {/* مناسبت‌های خاص */}
      <SectionHeader
        title={fa.specialDates}
        actionLabel="مدیریت"
        onAction={() => router.push('/occasions')}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.eventsRow}
      >
        {events.map((e, i) => {
          const dm = jalaliDayMonth(e.date);
          return (
            <Pressable key={i} onPress={() => router.push('/occasions')}>
              <Card style={styles.eventCard}>
                <View style={styles.eventDate}>
                  <Txt variant="heading" center color={colors.textInverse}>
                    {dm.day}
                  </Txt>
                  <Txt variant="tiny" center color={colors.textInverse}>
                    {dm.month}
                  </Txt>
                </View>
                <Ionicons
                  name={e.icon as any}
                  size={16}
                  color={colors.accent}
                  style={{ marginTop: spacing.sm }}
                />
                <Txt variant="caption" color={colors.text} style={{ marginTop: spacing.xs }}>
                  {e.title}
                </Txt>
              </Card>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* کاوش بر اساس موضوع — سلول‌های کاملاً یکدست */}
      <SectionHeader title={fa.exploreCats} />
      <View style={styles.catGrid}>
        {categories.map((c) => (
          <Pressable
            key={c.id}
            style={styles.catCard}
            onPress={() => router.push('/(tabs)/questions')}
          >
            <IconChip icon={c.icon as any} size={42} tone={c.tone} />
            <Txt variant="bodyBold" style={{ marginTop: spacing.md }}>
              {c.title}
            </Txt>
            <Txt variant="tiny" color={colors.textMuted}>
              {c.subtitle}
            </Txt>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

function TodayRow({
  icon,
  tone,
  title,
  subtitle,
  onPress,
  divider,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tone: Tone;
  title: string;
  subtitle: string;
  onPress: () => void;
  divider?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.todayRow, divider && styles.todayDivider, pressed && { opacity: 0.6 }]}
    >
      <IconChip icon={icon} size={40} tone={tone} />
      <View style={{ flex: 1 }}>
        <Txt variant="bodyBold">{title}</Txt>
        <Txt variant="tiny" color={colors.textMuted} numberOfLines={1} style={{ marginTop: 2 }}>
          {subtitle}
        </Txt>
      </View>
      <Ionicons name="chevron-back" size={18} color={colors.textFaint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  todayRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  todayDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  relCard: { alignItems: 'center' },
  relAvatars: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.xs },
  heartLink: { paddingHorizontal: spacing.sm },
  eventsRow: { gap: spacing.md, paddingVertical: spacing.xs, paddingLeft: spacing.xs },
  eventCard: { width: 132, alignItems: 'flex-start' },
  eventDate: {
    width: 50,
    height: 54,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: spacing.md },
  catCard: {
    width: '47.5%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
});
