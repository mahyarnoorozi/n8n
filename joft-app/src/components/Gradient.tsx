import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

/**
 * گرادیانتِ نرم — برای عمق و لطافتِ کارت‌های قهرمان (به‌جای رنگِ تخت).
 * پریست‌ها عمداً پاستلی و هماهنگ با قرمزِ برندند.
 */
export const GRADIENTS = {
  brand: ['#FF6B86', '#EE1844'],
  blush: ['#FDE9EE', '#F0E8FB'], // رز → یاسی (کارت رابطه)
  rose: ['#FDEAF0', '#F8C9D6'],
  peach: ['#FFEFE0', '#FFD6BC'],
  lilac: ['#F1ECFB', '#DED1F6'],
  mint: ['#E7F6EF', '#C9ECDC'],
  gold: ['#FCF2D8', '#F6DFA4'],
  sky: ['#E7F1FB', '#CCE0F6'],
  // آواتارها
  avMe: ['#A78BFA', '#7C66D6'],
  avPartner: ['#FF8DA3', '#EE1844'],
} as const;

export type GradientKey = keyof typeof GRADIENTS;

export function Gradient({
  colors,
  style,
  children,
  diagonal = true,
}: {
  colors: readonly string[];
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
  diagonal?: boolean;
}) {
  return (
    <LinearGradient
      colors={colors as unknown as readonly [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={diagonal ? { x: 1, y: 1 } : { x: 0, y: 1 }}
      style={style}
    >
      {children}
    </LinearGradient>
  );
}

/** گرادیانتی که کلِ والد را پر می‌کند (برای پس‌زمینهٔ کارت‌ها زیر محتوا). */
export function GradientFill({ colors, radius }: { colors: readonly string[]; radius?: number }) {
  return (
    <LinearGradient
      colors={colors as unknown as readonly [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[StyleSheet.absoluteFill, radius ? { borderRadius: radius } : null]}
    />
  );
}
