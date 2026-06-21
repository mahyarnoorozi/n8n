import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Card, IconChip, Screen, SectionHeader, Tag, Txt } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { categories, dailyQuestions } from '@/data/content';
import { fa } from '@/i18n/fa';
import { getOccasions, type Occasion } from '@/storage/local';
import { colors, radius, spacing } from '@/theme';
import { daysSince, jalaliDayMonth } from '@/utils/jalali';
import { toFa } from '@/utils/persian';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const today = dailyQuestions[new Date().getDay() % dailyQuestions.length];

  const anniversary = user?.anniversary ? new Date(user.anniversary) : new Date();
  const togetherDays = daysSince(anniversary);

  // مناسبت‌ها از حافظهٔ محلی خوانده می‌شوند تا با افزودن/ویرایش هماهنگ بمانند
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  useFocusEffect(
    useCallback(() => {
      getOccasions().then(setOccasions);
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

      {/* کارت صمیمت — دعوت به ارسال پیام عاشقانه */}
      <Pressable onPress={() => router.push('/love')} style={styles.loveCard}>
        <View style={styles.loveIcon}>
          <Ionicons name="heart" size={22} color={colors.surface} />
        </View>
        <View style={{ flex: 1 }}>
          <Txt variant="bodyBold" color={colors.textInverse}>
            یه پیام عاشقانه بده 💌
          </Txt>
          <Txt variant="tiny" color={colors.accentTint} style={{ marginTop: 2 }}>
            الان وقت خوبیه دل {user?.partnerName ?? 'نیمهٔ دیگرت'} رو ببری
          </Txt>
        </View>
        <Ionicons name="chevron-back" size={20} color={colors.textInverse} />
      </Pressable>

      {/* سؤال امروز */}
      <SectionHeader title={fa.questionOfDay} />
      <Card onPress={() => router.push(`/question/${today.id}`)}>
        <Tag label={today.category} />
        <Txt variant="subtitle" style={{ marginTop: spacing.md, marginBottom: spacing.lg }}>
          {today.text}
        </Txt>
        <View style={styles.answerRow}>
          <Ionicons name="arrow-back" size={16} color={colors.accent} />
          <Txt variant="caption" color={colors.accent}>
            {fa.answerNow}
          </Txt>
        </View>
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
            <IconChip icon={c.icon as any} size={42} />
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

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  relCard: { alignItems: 'center' },
  relAvatars: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.xs },
  heartLink: { paddingHorizontal: spacing.sm },
  answerRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.xs },
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
  loveCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  loveIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.accentWarm,
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
