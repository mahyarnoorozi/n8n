import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, spacing, tones, type Tone } from '@/theme';
import { Button } from './Button';
import { Txt } from './Txt';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body?: string;
  tone?: Tone;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  children?: React.ReactNode;
};

/**
 * حالتِ خالیِ دوستانه — به‌جای فقط یک آیکنِ خشک، یک «بلابِ» نرمِ دولایه با آیکنِ
 * توپرِ رنگی (حسِ تصویرسازی، مثل بلو). پایه‌ای یکدست برای همهٔ حالت‌های خالی.
 */
export function EmptyState({
  icon,
  title,
  body,
  tone = 'rose',
  actionLabel,
  onAction,
  actionIcon,
  style,
  children,
}: Props) {
  const t = tones[tone];
  const filled = String(icon).replace(/-outline$/, '') as keyof typeof Ionicons.glyphMap;
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.art}>
        <View style={[styles.blobBack, { backgroundColor: t.bg }]} />
        <View style={[styles.blobFront, { backgroundColor: colors.surface }]}>
          <Ionicons name={filled} size={38} color={t.fg} />
        </View>
      </View>
      <Txt variant="heading" center style={{ marginTop: spacing.lg }}>
        {title}
      </Txt>
      {body ? (
        <Txt
          variant="body"
          center
          color={colors.textMuted}
          style={{ marginTop: spacing.sm, paddingHorizontal: spacing.lg }}
        >
          {body}
        </Txt>
      ) : null}
      {children}
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          icon={actionIcon}
          onPress={onAction}
          style={{ marginTop: spacing.xl, alignSelf: 'stretch' }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: spacing.lg },
  art: { width: 120, height: 110, alignItems: 'center', justifyContent: 'center' },
  blobBack: {
    position: 'absolute',
    width: 104,
    height: 104,
    borderRadius: 46,
    transform: [{ rotate: '18deg' }],
  },
  blobFront: {
    width: 78,
    height: 78,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
