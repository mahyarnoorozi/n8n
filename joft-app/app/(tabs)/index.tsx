import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Card, Screen, SectionHeader, Tag, Txt } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { categories, dailyQuestions } from '@/data/content';
import { fa } from '@/i18n/fa';
import { colors, radius, shadow, spacing } from '@/theme';
import { daysSince, jalaliDayMonth } from '@/utils/jalali';
import { toFa } from '@/utils/persian';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const today = dailyQuestions[new Date().getDay() % dailyQuestions.length];

  const anniversary = user?.anniversary ? new Date(user.anniversary) : new Date();
  const togetherDays = daysSince(anniversary);

  // مناسبت‌های نمونه با تاریخ شمسی
  const events = [
    { title: 'سالگرد آشنایی', date: anniversary, icon: 'heart' as const, color: colors.accent },
    {
      title: `تولد ${user?.partnerName ?? 'نیمهٔ دیگرت'}`,
      date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 12),
      icon: 'gift' as const,
      color: colors.primary,
    },
    {
      title: `تولد ${user?.name ?? 'تو'}`,
      date: new Date(new Date().getFullYear(), new Date().getMonth() + 2, 3),
      icon: 'gift' as const,
      color: colors.success,
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
          <Avatar name={user?.name} size={46} />
        </Pressable>
      </View>

      {/* کارت رابطه */}
      <Card style={styles.relCard} padded>
        <View style={styles.relAvatars}>
          <Avatar name={user?.name} size={56} color={colors.primary} />
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

      {/* سؤال امروز */}
      <SectionHeader title={fa.questionOfDay} />
      <Card
        onPress={() => router.push(`/question/${today.id}`)}
        style={styles.questionCard}
      >
        <Tag label={today.category} />
        <Txt variant="subtitle" style={{ marginTop: spacing.md, marginBottom: spacing.lg }}>
          {today.text}
        </Txt>
        <View style={styles.answerRow}>
          <Txt variant="caption" color={colors.accent}>
            {fa.answerNow}
          </Txt>
          <Ionicons name="arrow-back" size={16} color={colors.accent} />
        </View>
      </Card>

      {/* مناسبت‌های خاص */}
      <SectionHeader title={fa.specialDates} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.eventsRow}
      >
        {events.map((e, i) => {
          const dm = jalaliDayMonth(e.date);
          return (
            <Card key={i} style={styles.eventCard}>
              <View style={[styles.eventDate, { backgroundColor: e.color }]}>
                <Txt variant="heading" center color={colors.textInverse}>
                  {dm.day}
                </Txt>
                <Txt variant="tiny" center color={colors.textInverse}>
                  {dm.month}
                </Txt>
              </View>
              <Ionicons name={e.icon} size={18} color={e.color} style={{ marginTop: spacing.sm }} />
              <Txt variant="caption" color={colors.text} style={{ marginTop: spacing.xs }}>
                {e.title}
              </Txt>
            </Card>
          );
        })}
      </ScrollView>

      {/* کاوش بر اساس موضوع */}
      <SectionHeader title={fa.exploreCats} />
      <View style={styles.catGrid}>
        {categories.map((c) => (
          <Pressable
            key={c.id}
            style={[styles.catCard, { backgroundColor: c.bg }]}
            onPress={() => router.push('/(tabs)/questions')}
          >
            <Ionicons name={c.icon as any} size={26} color={colors.primary} />
            <Txt variant="bodyBold" style={{ marginTop: spacing.sm }}>
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
  relCard: { backgroundColor: colors.surface, alignItems: 'center' },
  relAvatars: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.xs },
  heartLink: { paddingHorizontal: spacing.sm },
  questionCard: { backgroundColor: colors.surface },
  answerRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.xs },
  eventsRow: { gap: spacing.md, paddingVertical: spacing.xs },
  eventCard: { width: 130, alignItems: 'flex-start' },
  eventDate: {
    width: 52,
    height: 56,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: spacing.md },
  catCard: {
    width: '47%',
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.soft,
  },
});
