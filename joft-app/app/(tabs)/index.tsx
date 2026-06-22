import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Vibration, View } from 'react-native';
import { Avatar, BannerCarousel, Card, IconChip, Screen, SectionHeader, Txt, useToast, type Banner } from '@/components';
import { api } from '@/api/client';
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

      {/* کارتِ امضایی: تلنگرِ «به فکرتم» — دمِ‌دست، بالای صفحه */}
      <NudgeCard partnerName={user?.partnerName?.trim() || 'نیمهٔ دیگرت'} />

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

/**
 * کارتِ امضاییِ «به فکرتم» — حلقهٔ احساسیِ اپ.
 * یک ضربه: گوشیِ خودت یه لرزشِ کوتاه می‌گیره (بازخوردِ آنی)، و گوشیِ نیمهٔ دیگرت
 * یه اعلانِ پرلرزشِ «به فکرته 💭». قلب با ریتمِ آرام می‌تپد تا دعوت‌کننده باشد.
 */
const NUDGE_TYPES: {
  key: 'miss' | 'kiss' | 'hug';
  emoji: string;
  label: string;
  sent: (p: string) => string;
}[] = [
  { key: 'miss', emoji: '💭', label: 'دلتنگی', sent: (p) => `به ${p} گفتیم دلت تنگه 💭` },
  { key: 'kiss', emoji: '😘', label: 'بوسه', sent: (p) => `یه بوسه برای ${p} فرستادیم 😘` },
  { key: 'hug', emoji: '🤗', label: 'بغل', sent: (p) => `یه بغلِ گرم برای ${p} فرستادیم 🤗` },
];

function NudgeCard({ partnerName }: { partnerName: string }) {
  const toast = useToast();
  const beat = useRef(new Animated.Value(1)).current;
  const lastSent = useRef(0);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(beat, { toValue: 1.1, duration: 1100, useNativeDriver: true }),
        Animated.timing(beat, { toValue: 1, duration: 1100, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [beat]);

  async function send(t: (typeof NUDGE_TYPES)[number]) {
    if (Date.now() - lastSent.current < 1200) return; // جلوگیری از اسپم
    lastSent.current = Date.now();
    Vibration.vibrate(40);
    Animated.sequence([
      Animated.spring(beat, { toValue: 1.4, useNativeDriver: true, friction: 4 }),
      Animated.spring(beat, { toValue: 1, useNativeDriver: true, friction: 4 }),
    ]).start();

    const r = await api.sendNudge(t.key);
    if (r.ok) toast.show(t.sent(partnerName), 'success');
    else if (r.reason === 'demo')
      toast.show('در حالت دمو تلنگر ارسال نمی‌شود؛ با اتصالِ واقعی به نیمهٔ دیگرت کار می‌کند 💭', 'info');
    else toast.show(r.message || 'اول به نیمهٔ دیگرت وصل شو تا تلنگرت برسه.', 'info');
  }

  return (
    <View style={styles.nudgeCard}>
      <View style={styles.nudgeHead}>
        <Animated.View style={[styles.nudgeHeart, { transform: [{ scale: beat }] }]}>
          <Ionicons name="heart" size={22} color={colors.accent} />
        </Animated.View>
        <View style={{ flex: 1 }}>
          <Txt variant="bodyBold" color={colors.textInverse}>
            یه تلنگر به {partnerName} بفرست
          </Txt>
          <Txt variant="tiny" color={colors.accentTint} style={{ marginTop: 2 }}>
            گوشیش می‌لرزه و می‌فهمه به فکرشی
          </Txt>
        </View>
      </View>
      <View style={styles.nudgeRow}>
        {NUDGE_TYPES.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => send(t)}
            style={({ pressed }) => [
              styles.nudgeBtn,
              pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
            ]}
          >
            <Txt style={styles.nudgeEmoji}>{t.emoji}</Txt>
            <Txt variant="tiny" color={colors.accent}>
              {t.label}
            </Txt>
          </Pressable>
        ))}
      </View>
    </View>
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
  nudgeCard: {
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  nudgeHead: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md },
  nudgeHeart: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nudgeRow: { flexDirection: 'row-reverse', gap: spacing.sm },
  nudgeBtn: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  nudgeEmoji: { fontSize: 18 },
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
