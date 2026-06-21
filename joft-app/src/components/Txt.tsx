import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { typography } from '@/theme';

type Variant = keyof typeof typography;

type Props = TextProps & {
  variant?: Variant;
  color?: string;
  center?: boolean;
  style?: TextStyle | TextStyle[];
};

/**
 * کامپوننت متن پایه که فونت وزیرمتن و راست‌چینی فارسی را به‌صورت پیش‌فرض اعمال می‌کند.
 */
export function Txt({ variant = 'body', color, center, style, ...rest }: Props) {
  return (
    <Text
      {...rest}
      style={[
        typography[variant],
        { writingDirection: 'rtl', textAlign: center ? 'center' : 'right' },
        color ? { color } : null,
        style as TextStyle,
      ]}
    />
  );
}
