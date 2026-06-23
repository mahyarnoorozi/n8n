import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { colors, radius, spacing, tones, type Tone } from '@/theme';
import { GradientFill, GRADIENTS } from './Gradient';
import { Txt } from './Txt';

const TONE_GRADIENT: Record<Tone, readonly string[]> = {
  rose: GRADIENTS.rose,
  peach: GRADIENTS.peach,
  lilac: GRADIENTS.lilac,
  mint: GRADIENTS.mint,
  gold: GRADIENTS.gold,
  sky: GRADIENTS.sky,
};

export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: Tone;
  onPress: () => void;
};

const SCREEN = Dimensions.get('window').width;
const CARD_W = SCREEN - spacing.lg * 2; // هم‌عرضِ محتوای صفحه
const GAP = spacing.md;

/**
 * نوارِ بنرِ گرافیکیِ کوتاه و قابل‌اسکرول (مثل دیجی‌کالا/اسنپ).
 * عمداً کم‌ارتفاع است تا فضای زیادی نگیرد؛ بنرِ بعدی کمی «سرک» می‌کشد.
 */
export function BannerCarousel({ items }: { items: Banner[] }) {
  const [active, setActive] = useState(0);
  const ref = useRef<ScrollView>(null);

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const x = Math.abs(e.nativeEvent.contentOffset.x);
    const i = Math.round(x / (CARD_W + GAP));
    if (i !== active) setActive(i);
  }

  return (
    <View>
      <ScrollView
        ref={ref}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_W + GAP}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.row}
      >
        {items.map((b) => {
          const t = tones[b.tone];
          return (
            <Pressable
              key={b.id}
              onPress={b.onPress}
              style={({ pressed }) => [styles.card, { width: CARD_W }, pressed && { opacity: 0.9 }]}
            >
              <GradientFill colors={TONE_GRADIENT[b.tone]} radius={radius.lg} />
              <View style={{ flex: 1 }}>
                <Txt variant="bodyBold" color={colors.ink}>
                  {b.title}
                </Txt>
                <Txt variant="caption" color={colors.inkSoft} style={{ marginTop: 2 }}>
                  {b.subtitle}
                </Txt>
              </View>
              <View style={[styles.iconBubble, { backgroundColor: colors.surface }]}>
                <Ionicons name={b.icon} size={26} color={t.fg} />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {items.length > 1 ? (
        <View style={styles.dots}>
          {items.map((_, i) => (
            <View key={i} style={[styles.dot, i === active && styles.dotActive]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: GAP, paddingVertical: spacing.xs },
  card: {
    height: 96,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    overflow: 'hidden',
  },
  iconBubble: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotActive: { width: 18, backgroundColor: colors.accent },
});
