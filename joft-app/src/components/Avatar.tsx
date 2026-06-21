import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, fonts } from '@/theme';
import { Txt } from './Txt';

type Props = {
  name?: string;
  size?: number;
  color?: string;
};

/** آواتار دایره‌ای با حرف اول نام (بدون نیاز به عکس). */
export function Avatar({ name = '؟', size = 48, color = colors.primary }: Props) {
  const letter = name.trim().charAt(0) || '؟';
  return (
    <View
      style={[
        styles.wrap,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
      ]}
    >
      <Txt color={colors.textInverse} style={{ fontFamily: fonts.bold, fontSize: size * 0.4 }}>
        {letter}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
