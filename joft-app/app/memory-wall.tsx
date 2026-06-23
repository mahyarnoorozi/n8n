import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Screen, Skeleton, Txt } from '@/components';
import { api, type Memory } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import { colors, radius, shadow, spacing, tones } from '@/theme';
import { formatJalali } from '@/utils/jalali';

/**
 * «دیوارِ خاطره‌ها» — یک بومِ بزرگ که عکس‌ها و یادداشت‌ها با استایلِ پولاروید روی آن
 * پخش شده‌اند. کاربر می‌تواند آزادانه در هر جهت بکشد (پن دوبعدی)، با دکمهٔ «نمای کلی»
 * همه را یکجا ببیند، و روی هر خاطره بزند تا بزرگ شود.
 *
 * پیاده‌سازیِ پن: ScrollView عمودیِ بیرونی + ScrollView افقیِ درونی (بدون نیاز به
 * کتابخانهٔ ژست). بزرگ‌نمایی: تغییرِ حالت بین «دیوار» و «نمای کلیِ مقیاس‌شده».
 */

const SCREEN = Dimensions.get('window');
const CARD_W = 150;
const SLOT_H = 196;
const COLS = 3;
const GAP = 20;
const PAD = 22;

const NOTE_TONES = ['rose', 'peach', 'lilac', 'mint', 'gold', 'sky'] as const;

type Placed = Memory & {
  x: number;
  y: number;
  rot: string;
  toneKey: (typeof NOTE_TONES)[number];
};

function layout(items: Memory[]): { cards: Placed[]; width: number; height: number } {
  const cards = items.map((m, i): Placed => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    // کمی به‌هم‌ریختگیِ عمدی تا حسِ «دیوار» بدهد، نه گریدِ خشک
    const jitterX = ((i * 53) % 17) - 8;
    const jitterY = ((i * 31) % 15) - 7;
    return {
      ...m,
      x: PAD + col * (CARD_W + GAP) + jitterX,
      y: PAD + row * (SLOT_H + GAP) + jitterY,
      rot: `${(((i * 37) % 9) - 4)}deg`,
      toneKey: NOTE_TONES[i % NOTE_TONES.length],
    };
  });
  const rows = Math.max(1, Math.ceil(items.length / COLS));
  const width = PAD * 2 + COLS * CARD_W + (COLS - 1) * GAP;
  const height = PAD * 2 + rows * SLOT_H + (rows - 1) * GAP;
  return { cards, width: Math.max(width, SCREEN.width), height: Math.max(height, 320) };
}

export default function MemoryWall() {
  const router = useRouter();
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[] | null>(null);
  const [overview, setOverview] = useState(false);
  const [selected, setSelected] = useState<Memory | null>(null);

  useEffect(() => {
    (async () => {
      const [list, photoMap] = await Promise.all([api.getMemories(), api.getMemoryPhotoMap()]);
      setMemories(list.map((m) => (m.photoUri ? m : { ...m, photoUri: photoMap[m.id] ?? null })));
    })();
  }, []);

  const { cards, width, height } = useMemo(() => layout(memories ?? []), [memories]);
  const authorName = (m: Memory) =>
    m.author === 'me' ? user?.name ?? 'من' : user?.partnerName ?? 'نیمهٔ دیگر';

  // مقیاسِ نمای کلی تا کلِ دیوار در صفحه جا شود
  const fitScale = Math.min((SCREEN.width - 24) / width, (SCREEN.height - 220) / height, 1);

  function Card({ c, onPress }: { c: Placed; onPress: () => void }) {
    const tone = tones[c.toneKey];
    return (
      <Pressable
        onPress={onPress}
        style={[styles.card, { left: c.x, top: c.y, transform: [{ rotate: c.rot }] }]}
      >
        {c.photoUri ? (
          <>
            <Image source={{ uri: c.photoUri }} style={styles.photo} />
            {c.text?.trim() ? (
              <Txt variant="tiny" numberOfLines={1} style={{ marginTop: 6, color: colors.ink }}>
                {c.text}
              </Txt>
            ) : (
              <View style={{ height: 6 }} />
            )}
          </>
        ) : (
          <View style={[styles.note, { backgroundColor: tone.bg }]}>
            <Ionicons name="heart" size={14} color={tone.fg} />
            <Txt variant="caption" numberOfLines={5} style={{ color: colors.ink, marginTop: 6 }}>
              {c.text || '—'}
            </Txt>
          </View>
        )}
      </Pressable>
    );
  }

  // —— حالتِ بارگذاری ——
  if (!memories) {
    return (
      <Screen>
        <Topbar onBack={() => router.back()} overview={false} onToggle={() => {}} />
        <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: GAP, marginTop: spacing.xl }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} width={CARD_W} height={SLOT_H} radius={radius.md} />
          ))}
        </View>
      </Screen>
    );
  }

  // —— حالتِ خالی ——
  if (memories.length === 0) {
    return (
      <Screen>
        <Topbar onBack={() => router.back()} overview={false} onToggle={() => {}} />
        <View style={{ alignItems: 'center', marginTop: spacing.xxl * 2 }}>
          <Ionicons name="images-outline" size={40} color={colors.accent} />
          <Txt variant="heading" center style={{ marginTop: spacing.md }}>
            دیوارتون هنوز خالیه
          </Txt>
          <Txt variant="body" center color={colors.textMuted} style={{ marginTop: spacing.sm }}>
            از تب «خاطره‌ها» اولین عکس و یادداشت رو اضافه کنید تا اینجا روی دیوار بشینه.
          </Txt>
        </View>
      </Screen>
    );
  }

  const wall = (
    <View style={[styles.canvas, { width, height }]}>
      {cards.map((c) => (
        <Card key={c.id} c={c} onPress={() => setSelected(c)} />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={{ paddingHorizontal: spacing.lg }}>
        <Topbar onBack={() => router.back()} overview={overview} onToggle={() => setOverview((v) => !v)} />
        <Txt variant="tiny" color={colors.textFaint} style={{ marginBottom: spacing.sm }}>
          {overview ? 'نمای کلیِ دیوار — روی هر خاطره بزن' : 'آزادانه بکش و بگرد؛ روی هر خاطره بزن تا بزرگ شه'}
        </Txt>
      </View>

      {overview ? (
        // نمای کلی: کلِ بوم مقیاس‌شده و وسط‌چین
        <View style={styles.overviewWrap}>
          <View style={{ width, height, transform: [{ scale: fitScale }] }}>{wall}</View>
        </View>
      ) : (
        // دیوار: پن دوبعدی (عمودی × افقی)
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ height }}
          showsVerticalScrollIndicator={false}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ width }}
          >
            {wall}
          </ScrollView>
        </ScrollView>
      )}

      {/* بزرگ‌نماییِ یک خاطره */}
      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.detailBackdrop} onPress={() => setSelected(null)}>
          <Pressable style={styles.detailCard} onPress={() => {}}>
            {selected?.photoUri ? (
              <Image source={{ uri: selected.photoUri }} style={styles.detailPhoto} />
            ) : null}
            {selected?.text?.trim() ? (
              <Txt variant="subtitle" style={{ marginTop: selected?.photoUri ? spacing.md : 0 }}>
                {selected.text}
              </Txt>
            ) : null}
            {selected ? (
              <View style={styles.detailMeta}>
                <Avatar
                  name={authorName(selected)}
                  size={28}
                  color={selected.author === 'me' ? colors.ink : colors.accent}
                />
                <Txt variant="tiny" color={colors.textMuted} style={{ flex: 1 }}>
                  {authorName(selected)} • {formatJalali(new Date(selected.createdAt))}
                </Txt>
                <Pressable onPress={() => setSelected(null)} hitSlop={10}>
                  <Ionicons name="close-circle" size={26} color={colors.textFaint} />
                </Pressable>
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function Topbar({
  onBack,
  overview,
  onToggle,
}: {
  onBack: () => void;
  overview: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.topbar}>
      <Pressable onPress={onBack} hitSlop={12}>
        <Ionicons name="chevron-forward" size={26} color={colors.text} />
      </Pressable>
      <Txt variant="heading">دیوارِ خاطره‌ها</Txt>
      <Pressable onPress={onToggle} hitSlop={12} style={styles.zoomBtn}>
        <Ionicons name={overview ? 'scan-outline' : 'contract-outline'} size={18} color={colors.accent} />
        <Txt variant="tiny" color={colors.accent}>
          {overview ? 'دیوار' : 'نمای کلی'}
        </Txt>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceAlt },
  topbar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  zoomBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accentTint,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  overviewWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  canvas: { backgroundColor: colors.surfaceAlt },
  card: {
    position: 'absolute',
    width: CARD_W,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: 6,
    ...shadow.card,
  },
  photo: {
    width: CARD_W - 12,
    height: 140,
    borderRadius: 6,
    backgroundColor: colors.surfaceAlt,
  },
  note: {
    minHeight: SLOT_H - 12,
    borderRadius: 8,
    padding: spacing.md,
  },
  detailBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(27,26,41,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  detailCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  detailPhoto: {
    width: '100%',
    height: 320,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  detailMeta: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
