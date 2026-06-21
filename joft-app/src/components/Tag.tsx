import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { Txt } from './Txt';

type Props = {
  label: string;
  bg?: string;
  color?: string;
};

/** برچسب کوچک برای دسته‌بندی، زمان مطالعه و... — به‌صورت پیش‌فرض خنثی و آرام. */
export function Tag({ label, bg = colors.chip, color = colors.textMuted }: Props) {
  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      <Txt variant="tiny" color={color}>
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
