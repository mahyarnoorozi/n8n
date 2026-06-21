import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { colors, fonts } from '@/theme';
import { Txt } from './Txt';

export type AvatarKind = 'man' | 'woman';

type Props = {
  name?: string;
  size?: number;
  color?: string;
  photoUri?: string | null;
  /** آواتار بی‌چهرهٔ تک‌رنگ (خنثی) وقتی عکسی انتخاب نشده. */
  faceless?: AvatarKind | null;
};

/**
 * آواتار دایره‌ای. اولویت: عکس کاربر ← آواتار بی‌چهرهٔ خنثی (زن/مرد) ← حرف اول نام.
 * آواتار بی‌چهره عمداً تک‌رنگ و بدون چهره است تا ساده و محترمانه بماند.
 */
export function Avatar({ name = '؟', size = 48, color = colors.primary, photoUri, faceless }: Props) {
  const dim = { width: size, height: size, borderRadius: size / 2 };

  if (photoUri) {
    return <Image source={{ uri: photoUri }} style={[styles.wrap, dim]} />;
  }

  if (faceless) {
    return (
      <View style={[styles.wrap, dim, { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border }]}>
        <Ionicons
          name={faceless === 'woman' ? 'woman' : 'man'}
          size={size * 0.56}
          color={colors.textMuted}
        />
      </View>
    );
  }

  const letter = name.trim().charAt(0) || '؟';
  return (
    <View style={[styles.wrap, dim, { backgroundColor: color }]}>
      <Txt color={colors.textInverse} style={{ fontFamily: fonts.bold, fontSize: size * 0.4 }}>
        {letter}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
