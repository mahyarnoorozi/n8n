import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/theme';

/**
 * اسکلتونِ لودینگ — مثلِ دیجی‌کالا/دیوار/بلو، به‌جای چرخندهٔ خالی.
 * یک مستطیلِ گردگوشه با «نفسِ» ملایم (پالس) که حسِ بارگذاریِ حرفه‌ای می‌دهد.
 */

export function Skeleton({
  width,
  height = 16,
  radius: r = radius.sm,
  style,
}: {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}) {
  const pulse = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={[
        { width: width ?? '100%', height, borderRadius: r, backgroundColor: colors.surfaceAlt, opacity: pulse },
        style,
      ]}
    />
  );
}

/** کارتِ اسکلتونیِ آماده برای فهرست‌ها (آواتار + دو خط متن). */
export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Skeleton width={40} height={40} radius={radius.pill} />
        <View style={{ flex: 1, gap: spacing.sm }}>
          <Skeleton width="55%" height={14} />
          <Skeleton width="32%" height={11} />
        </View>
      </View>
      <Skeleton height={12} style={{ marginTop: spacing.lg }} />
      <Skeleton width="80%" height={12} style={{ marginTop: spacing.sm }} />
    </View>
  );
}

/** چند کارتِ اسکلتونی پشتِ‌هم. */
export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.lg,
  },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md },
});
