import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { colors, fonts } from '@/theme';
import { Gradient } from './Gradient';
import { Txt } from './Txt';

export type AvatarKind = 'man' | 'woman';

type Props = {
  name?: string;
  size?: number;
  color?: string;
  photoUri?: string | null;
  /** آواتار بی‌چهرهٔ تک‌رنگ (خنثی) وقتی عکسی انتخاب نشده. */
  faceless?: AvatarKind | null;
  /** گرادیانتِ نرم برای پس‌زمینهٔ آواتار (حسِ گرم‌تر و تصویری‌تر). */
  gradient?: readonly string[];
};

/**
 * آواتار دایره‌ای. اولویت: عکس کاربر ← آواتار بی‌چهرهٔ خنثی (زن/مرد) ← حرف اول نام.
 * با تعیینِ gradient، پس‌زمینه به‌جای رنگِ تخت، گرادیانتِ نرم می‌شود.
 */
export function Avatar({ name = '؟', size = 48, color = colors.primary, photoUri, faceless, gradient }: Props) {
  const dim = { width: size, height: size, borderRadius: size / 2 };

  if (photoUri) {
    return <Image source={{ uri: photoUri }} style={[styles.wrap, dim]} />;
  }

  if (faceless) {
    const inner = (
      <Ionicons
        name={faceless === 'woman' ? 'woman' : 'man'}
        size={size * 0.56}
        color={gradient ? colors.textInverse : colors.textMuted}
      />
    );
    if (gradient) {
      return <Gradient colors={gradient} style={[styles.wrap, dim]}>{inner}</Gradient>;
    }
    return (
      <View style={[styles.wrap, dim, { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border }]}>
        {inner}
      </View>
    );
  }

  const letter = name.trim().charAt(0) || '؟';
  const label = (
    <Txt color={colors.textInverse} style={{ fontFamily: fonts.bold, fontSize: size * 0.4 }}>
      {letter}
    </Txt>
  );
  if (gradient) {
    return <Gradient colors={gradient} style={[styles.wrap, dim]}>{label}</Gradient>;
  }
  return <View style={[styles.wrap, dim, { backgroundColor: color }]}>{label}</View>;
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
