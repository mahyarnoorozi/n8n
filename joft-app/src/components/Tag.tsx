import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing, tones, type Tone } from '@/theme';
import { Txt } from './Txt';

type Props = {
  label: string;
  bg?: string;
  color?: string;
  /** تونِ پاستلیِ رنگی (rose/peach/...). در صورت تعیین، رنگ‌های نرم و گرم می‌گیرد. */
  tone?: Tone;
};

/** برچسب کوچک و نرم برای دسته‌بندی، زمان مطالعه و... — حالا با تونِ پاستلیِ رنگی. */
export function Tag({ label, bg, color, tone }: Props) {
  const t = tone ? tones[tone] : null;
  const background = bg ?? (t ? t.bg : colors.chip);
  const fg = color ?? (t ? t.fg : colors.textMuted);
  return (
    <View style={[styles.tag, { backgroundColor: background }]}>
      <Txt variant="tiny" color={fg}>
        {label}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
});
