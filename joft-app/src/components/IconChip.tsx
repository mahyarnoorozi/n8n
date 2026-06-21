import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius } from '@/theme';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  size?: number;
  active?: boolean;
  style?: ViewStyle;
};

/**
 * چیپِ آیکنِ یکدست برای کل برنامه: یک مربعِ گردگوشهٔ هم‌رنگ با آیکنِ outline.
 * این کامپوننت تضمین می‌کند همهٔ آیکن‌ها یک خانواده، یک اندازه و یک رنگ داشته باشند.
 * حالت active برای جلب توجه از رنگ برند (قرمز) استفاده می‌کند.
 */
export function IconChip({ icon, size = 46, active = false, style }: Props) {
  return (
    <View
      style={[
        styles.chip,
        { width: size, height: size, borderRadius: size * 0.32 },
        active ? styles.active : null,
        style,
      ]}
    >
      <Ionicons
        name={icon}
        size={size * 0.5}
        color={colors.accent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: { backgroundColor: colors.accentSoft },
});
