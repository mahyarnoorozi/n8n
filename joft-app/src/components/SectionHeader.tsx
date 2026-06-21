import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/theme';
import { Txt } from './Txt';

type Props = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, actionLabel, onAction }: Props) {
  return (
    <View style={styles.row}>
      <Txt variant="heading">{title}</Txt>
      {actionLabel ? (
        <Pressable onPress={onAction}>
          <Txt variant="caption" color={colors.accent}>
            {actionLabel}
          </Txt>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    marginTop: spacing.xl,
  },
});
