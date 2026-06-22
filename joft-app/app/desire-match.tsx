import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { Button, Card, Screen, Txt } from '@/components';
import { api } from '@/api/client';
import {
  categoryOf,
  DESIRE_CATEGORIES,
  DesireCard,
  visibleCards,
} from '@/data/desires';
import {
  getDesireState,
  markOnboarded,
  saveDesireState,
  setSettings,
  setSwipe,
  swipeCount,
  type DesireState,
  type Swipe,
} from '@/storage/desires';
import { colors, fonts, radius, shadow, spacing } from '@/theme';
import { toFa } from '@/utils/persian';

/**
 * بازیِ «تطبیق خواسته‌ها» — قلبِ بخش بازی‌ها.
 *
 * هر دو نفر جداگانه به ایده‌ها بله/شاید/نه می‌دهند. فقط ایده‌هایی که هر دو
 * بله یا شاید گفته‌اند به‌عنوان «تطبیق» نمایش داده می‌شوند — صفحهٔ مجزا.
 *
 * UI: یک کارتِ بزرگِ مرکزی، با سه دکمهٔ زیرِ آن. هر پاسخ کارت را با
 * انیمیشنِ آرام جابه‌جا می‌کند و کارتِ بعدی را می‌آورد.
 */

export default function DesireMatch() {
  const router = useRouter();
  const [state, setState] = useState<DesireState | null>(null);
  const [index, setIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const slide = useRef(new Animated.Value(0)).current; // x translate
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    getDesireState().then(setState);
  }, []);

  // فقط کارت‌هایی که هنوز پاسخ نداده‌ایم، با احترام به سطحِ محتوای انتخاب‌شده
  const queue: DesireCard[] = useMemo(() => {
    if (!state) return [];
    const all = visibleCards(state.settings.contentLevel);
    return all.filter((c) => !state.swipes[c.id]);
  }, [state]);

  const current = queue[index];
  const totalAnswered = state ? swipeCount(state) : 0;
  const allCount = state ? visibleCards(state.settings.contentLevel).length : 0;
  const progress = allCount > 0 ? totalAnswered / allCount : 0;

  async function persist(next: DesireState) {
    setState(next);
    await saveDesireState(next);
  }

  function animateOut(direction: -1 | 0 | 1, after: () => void) {
    Animated.parallel([
      Animated.timing(slide, {
        toValue: direction * 220,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      after();
      slide.setValue(direction * -40);
      Animated.parallel([
        Animated.spring(slide, { toValue: 0, useNativeDriver: true, friction: 7 }),
        Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    });
  }

  async function answer(swipe: Swipe) {
    if (!state || !current) return;
    const direction = swipe === 'yes' ? -1 : swipe === 'no' ? 1 : 0;
    const cardId = current.id;
    const next = setSwipe(state, cardId, swipe);
    animateOut(direction, () => {
      // پس از انیمیشن، کارت پاسخ‌داده‌شده از صفِ visible حذف می‌شود؛
      // پس index = 0 یعنی رفتنِ خودکار به کارتِ بعدی.
      setIndex(0);
      persist(next);
    });
    // هم‌گام‌سازی با سرور (در حالت دمو بی‌صدا رد می‌شود)
    api.saveDesireSwipe(cardId, swipe).catch(() => {});
  }

  async function toggleLevel(allow: boolean) {
    if (!state) return;
    if (allow && !state.settings.adultConfirmed) {
      Alert.alert(
        'محتوای ۱۸+',
        'این بخش شاملِ ایده‌هایی برای صمیمتِ زناشویی است. لطفاً تأیید کن که سنّت بالای ۱۸ سال است.',
        [
          { text: 'انصراف', style: 'cancel' },
          {
            text: 'تأیید می‌کنم',
            style: 'destructive',
            onPress: async () => {
              await persist(setSettings(state, { contentLevel: 'all', adultConfirmed: true }));
            },
          },
        ],
      );
      return;
    }
    await persist(setSettings(state, { contentLevel: allow ? 'all' : 'soft' }));
  }

  if (!state) {
    return (
      <Screen scroll={false}>
        <Topbar onBack={() => router.back()} onSettings={() => setShowSettings(true)} />
      </Screen>
    );
  }

  // راهنمای اولِ بازی — فقط بارِ نخست
  if (!state.onboarded) {
    return (
      <Screen scroll={false}>
        <View style={styles.topbar}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="close" size={26} color={colors.text} />
          </Pressable>
          <Txt variant="bodyBold">چطور کار می‌کنه؟</Txt>
          <View style={{ width: 26 }} />
        </View>
        <Onboarding onDone={() => persist(markOnboarded(state))} />
      </Screen>
    );
  }

  return (
    <Screen scroll={false}>
      <Topbar onBack={() => router.back()} onSettings={() => setShowSettings(true)} />

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.min(100, progress * 100)}%` }]} />
      </View>
      <Txt variant="tiny" color={colors.textMuted} style={{ marginTop: spacing.xs }}>
        {toFa(totalAnswered)} از {toFa(allCount)} پاسخ
      </Txt>

      <View style={styles.stage}>
        {current ? (
          <>
            {/* کارت پشتی برای حسِ پشتهٔ کارت‌ها */}
            {queue[index + 1] ? <View style={[styles.cardBack, styles.cardBackFar]} /> : null}
            {queue[index + 1] ? <View style={styles.cardBack} /> : null}

            <Animated.View
              style={[
                styles.card,
                { transform: [{ translateX: slide }, { rotate: rotateForSlide(slide) }], opacity: fade },
              ]}
            >
              <CardBody card={current} />
            </Animated.View>
          </>
        ) : (
          <EmptyState
            allDone={allCount > 0 && totalAnswered >= allCount}
            onGoMatches={() => router.replace('/desire-matches')}
          />
        )}
      </View>

      {current ? (
        <View style={styles.actions}>
          <ActionButton
            icon="close"
            label="نه"
            color={colors.textMuted}
            bg={colors.surface}
            onPress={() => answer('no')}
          />
          <ActionButton
            icon="help"
            label="شاید"
            color="#F5A623"
            bg="#FFF6E5"
            big
            onPress={() => answer('maybe')}
          />
          <ActionButton
            icon="heart"
            label="بله"
            color={colors.textInverse}
            bg={colors.accent}
            onPress={() => answer('yes')}
          />
        </View>
      ) : null}

      <Txt variant="tiny" center color={colors.textFaint} style={{ marginTop: spacing.md }}>
        🔒 پاسخت تا وقتی هر دو نفر «بله/شاید» نگید، برای نیمهٔ دیگرت نمایان نمی‌شه.
      </Txt>

      <SettingsSheet
        visible={showSettings}
        state={state}
        onClose={() => setShowSettings(false)}
        onToggleLevel={toggleLevel}
        onReset={() =>
          Alert.alert('پاک کردن پاسخ‌ها', 'مطمئنی همهٔ پاسخ‌هات پاک بشه؟', [
            { text: 'انصراف', style: 'cancel' },
            {
              text: 'پاک کن',
              style: 'destructive',
              onPress: () => persist({ ...state, swipes: {} }),
            },
          ])
        }
      />
    </Screen>
  );
}

const ONBOARDING_STEPS: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
}[] = [
  {
    icon: 'people-outline',
    title: 'هر دو نفر، جداگانه',
    body: 'تو و نیمهٔ دیگرت جدا‌جدا به همین ایده‌ها پاسخ می‌دید. هیچ‌کس موقع انتخاب، جوابِ اون یکی رو نمی‌بینه.',
  },
  {
    icon: 'hand-left-outline',
    title: 'بله، شاید، یا نه',
    body: 'برای هر کارت یکی رو انتخاب کن. «شاید» یعنی بدم نمیاد امتحانش کنم. سریع و بدون فکرِ زیاد.',
  },
  {
    icon: 'heart',
    title: 'فقط تطابق‌ها آشکار می‌شن',
    body: 'اگر هر دو «بله یا شاید» بزنید، اون ایده به «تطابق‌ها» اضافه می‌شه. «نه»‌ی هر کدوم، برای همیشه خصوصی می‌مونه.',
  },
];

function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const s = ONBOARDING_STEPS[step];
  const last = step === ONBOARDING_STEPS.length - 1;
  return (
    <View style={styles.onboard}>
      <View style={styles.onboardBody}>
        <View style={styles.onboardIcon}>
          <Ionicons name={s.icon} size={44} color={colors.accent} />
        </View>
        <Txt variant="title" center style={{ marginTop: spacing.xl }}>
          {s.title}
        </Txt>
        <Txt variant="body" center color={colors.textMuted} style={{ marginTop: spacing.md }}>
          {s.body}
        </Txt>
      </View>

      <View style={styles.dots}>
        {ONBOARDING_STEPS.map((_, i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>

      <Button
        label={last ? 'شروع بازی' : 'بعدی'}
        icon={last ? 'play' : 'arrow-back'}
        onPress={() => (last ? onDone() : setStep((x) => x + 1))}
      />
      {!last ? (
        <Pressable onPress={onDone} style={{ paddingVertical: spacing.md }}>
          <Txt variant="caption" center color={colors.textFaint}>
            رد کردن
          </Txt>
        </Pressable>
      ) : (
        <View style={{ height: spacing.xl }} />
      )}
    </View>
  );
}

function rotateForSlide(v: Animated.Value) {
  return v.interpolate({
    inputRange: [-220, 0, 220],
    outputRange: ['-8deg', '0deg', '8deg'],
  });
}

function Topbar({ onBack, onSettings }: { onBack: () => void; onSettings: () => void }) {
  return (
    <View style={styles.topbar}>
      <Pressable onPress={onBack} hitSlop={12}>
        <Ionicons name="close" size={26} color={colors.text} />
      </Pressable>
      <Txt variant="bodyBold">تطبیق خواسته‌ها</Txt>
      <Pressable onPress={onSettings} hitSlop={12}>
        <Ionicons name="options-outline" size={24} color={colors.text} />
      </Pressable>
    </View>
  );
}

function CardBody({ card }: { card: DesireCard }) {
  const cat = categoryOf(card.category);
  const isSpicy = card.level === 'spicy';
  return (
    <>
      <View style={[styles.catChip, isSpicy && styles.catChipSpicy]}>
        <Txt variant="tiny" color={isSpicy ? colors.accentDark : colors.accent}>
          {cat.emoji} {cat.title}
        </Txt>
      </View>
      <Txt
        style={[styles.cardTitle, { fontFamily: fonts.bold }]}
        center
      >
        {card.title}
      </Txt>
      {card.hint ? (
        <Txt variant="caption" center color={colors.textMuted} style={{ marginTop: spacing.md }}>
          {card.hint}
        </Txt>
      ) : null}
      <View style={styles.cardFooter}>
        <Ionicons name="lock-closed" size={12} color={colors.textFaint} />
        <Txt variant="tiny" color={colors.textFaint}>
          پاسخت خصوصیه
        </Txt>
      </View>
    </>
  );
}

function ActionButton({
  icon,
  label,
  color,
  bg,
  big,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  bg: string;
  big?: boolean;
  onPress: () => void;
}) {
  const size = big ? 74 : 64;
  return (
    <View style={{ alignItems: 'center', gap: spacing.xs }}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.actionBtn,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
          pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
        ]}
      >
        <Ionicons name={icon} size={big ? 30 : 26} color={color} />
      </Pressable>
      <Txt variant="tiny" color={colors.textMuted}>
        {label}
      </Txt>
    </View>
  );
}

function EmptyState({ allDone, onGoMatches }: { allDone: boolean; onGoMatches: () => void }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name={allDone ? 'sparkles' : 'checkmark-done'} size={36} color={colors.accent} />
      </View>
      <Txt variant="heading" center style={{ marginTop: spacing.md }}>
        {allDone ? 'همه‌اش رو جواب دادی! ✨' : 'فعلاً کارتی نمونده'}
      </Txt>
      <Txt variant="body" center color={colors.textMuted} style={{ marginTop: spacing.sm }}>
        برو ببین تطابق‌هات با نیمهٔ دیگرت چی شده.
      </Txt>
      <Button
        label="دیدن تطابق‌ها"
        icon="heart"
        onPress={onGoMatches}
        style={{ marginTop: spacing.xl }}
      />
    </View>
  );
}

function SettingsSheet({
  visible,
  state,
  onClose,
  onToggleLevel,
  onReset,
}: {
  visible: boolean;
  state: DesireState;
  onClose: () => void;
  onToggleLevel: (v: boolean) => void;
  onReset: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <Txt variant="heading" center style={{ marginBottom: spacing.lg }}>
          تنظیمات بازی
        </Txt>

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Txt variant="subtitle">حالتِ ۱۸+ (صریح‌تر)</Txt>
            <Txt variant="tiny" color={colors.textMuted} style={{ marginTop: 2 }}>
              ایده‌های صمیمتِ زناشویی برای زوج‌های متعهد
            </Txt>
          </View>
          <Switch
            value={state.settings.contentLevel === 'all'}
            onValueChange={onToggleLevel}
            trackColor={{ true: colors.accent, false: colors.border }}
            thumbColor={colors.surface}
          />
        </View>

        <View style={styles.catsBox}>
          <Txt variant="caption" color={colors.textMuted} style={{ marginBottom: spacing.sm }}>
            دسته‌بندی‌ها
          </Txt>
          {DESIRE_CATEGORIES.filter(
            (c) => c.id !== 'intimacy' || state.settings.contentLevel === 'all',
          ).map((c) => (
            <View key={c.id} style={styles.catLine}>
              <Txt variant="body">
                {c.emoji} {c.title}
              </Txt>
              <Txt variant="tiny" color={colors.textFaint} style={{ flex: 1 }}>
                {' '}
                — {c.description}
              </Txt>
            </View>
          ))}
        </View>

        <Pressable onPress={onReset} style={styles.resetBtn}>
          <Ionicons name="refresh-outline" size={18} color={colors.accent} />
          <Txt variant="bodyBold" color={colors.accent}>
            پاک کردن همهٔ پاسخ‌ها
          </Txt>
        </Pressable>

        <Button label="بستن" variant="ghost" onPress={onClose} style={{ marginTop: spacing.md }} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  progressTrack: { height: 6, borderRadius: 999, backgroundColor: colors.border, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 999, backgroundColor: colors.accent },

  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.lg },
  card: {
    width: '92%',
    minHeight: 320,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  cardBack: {
    position: 'absolute',
    width: '88%',
    height: 320,
    top: 8,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    opacity: 0.7,
  },
  cardBackFar: { width: '84%', top: 16, opacity: 0.5 },
  catChip: {
    backgroundColor: colors.accentTint,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginBottom: spacing.lg,
  },
  catChipSpicy: { backgroundColor: '#FFE6EB' },
  cardTitle: { fontSize: 22, lineHeight: 38, color: colors.text, textAlign: 'center' },
  cardFooter: {
    position: 'absolute',
    bottom: spacing.lg,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
  },

  actions: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.hairline,
  },

  onboard: { flex: 1, paddingBottom: spacing.lg },
  onboardBody: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  onboardIcon: {
    width: 96,
    height: 96,
    borderRadius: 32,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.xl },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.accent, width: 22 },

  empty: { alignItems: 'center', padding: spacing.xl },
  emptyIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backdrop: { flex: 1, backgroundColor: 'rgba(27,26,41,0.35)' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  settingRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  catsBox: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  catLine: { flexDirection: 'row-reverse', alignItems: 'center', marginTop: spacing.xs },
  resetBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
});
