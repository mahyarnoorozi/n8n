import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, tones, type Tone } from '@/theme';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  size?: number;
  tone?: Tone;
  /** حالتِ قدیمی برای سازگاری؛ معادلِ تونِ rose. */
  active?: boolean;
  style?: ViewStyle;
};

/**
 * چیپِ آیکنِ «دوتون»: یک حبابِ گردگوشهٔ پاستلی با آیکنِ توپرِ سرزنده.
 * نامِ آیکن را خودکار از حالتِ outline به توپر تبدیل می‌کند تا ظاهر مدرن و گرم بماند.
 * هر چیپ یک «تون» رنگی می‌گیرد تا کلِ اپ، چندرنگ اما یکدست دیده شود.
 */
export function IconChip({ icon, size = 46, tone = 'rose', active = false, style }: Props) {
  const t = tones[tone];
  const filled = String(icon).replace(/-outline$/, '') as keyof typeof Ionicons.glyphMap;
  return (
    <View
      style={[
        styles.chip,
        { width: size, height: size, borderRadius: size * 0.38, backgroundColor: t.bg },
        active ? { backgroundColor: colors.accentSoft } : null,
        style,
      ]}
    >
      <Ionicons name={filled} size={size * 0.5} color={t.fg} />
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
