import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { Txt } from './Txt';

type Variant = 'accent' | 'primary' | 'outline' | 'ghost';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

/** دکمهٔ اصلی برنامه. حالت accent از رنگ قرمز کسب‌وکار برای جلب توجه استفاده می‌کند. */
export function Button({ label, onPress, variant = 'accent', icon, loading, disabled, style }: Props) {
  const bg =
    variant === 'accent' ? colors.accent : variant === 'primary' ? colors.primary : 'transparent';
  const fg =
    variant === 'outline' || variant === 'ghost' ? colors.primary : colors.textInverse;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg },
        variant === 'outline' && styles.outline,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.content}>
          <Txt variant="bodyBold" color={fg}>
            {label}
          </Txt>
          {icon ? <Ionicons name={icon} size={18} color={fg} /> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  outline: { borderWidth: 1.5, borderColor: colors.border },
  content: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
});
