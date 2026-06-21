import { TextStyle } from 'react-native';
import { colors } from './colors';

/**
 * فونت‌های وزیرمتن (Vazirmatn) برای فارسی‌نویسی روان و راست‌به‌چپ.
 * نام فونت‌ها در ریشهٔ برنامه با useFonts بارگذاری می‌شوند.
 */
export const fonts = {
  regular: 'Vazirmatn_400Regular',
  medium: 'Vazirmatn_500Medium',
  bold: 'Vazirmatn_700Bold',
  black: 'Vazirmatn_900Black',
} as const;

type Variant =
  | 'display'
  | 'title'
  | 'heading'
  | 'subtitle'
  | 'body'
  | 'bodyBold'
  | 'caption'
  | 'tiny';

export const typography: Record<Variant, TextStyle> = {
  display: { fontFamily: fonts.black, fontSize: 30, lineHeight: 46, color: colors.text },
  title: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 40, color: colors.text },
  heading: { fontFamily: fonts.bold, fontSize: 19, lineHeight: 32, color: colors.text },
  subtitle: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 28, color: colors.text },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 28, color: colors.text },
  bodyBold: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 28, color: colors.text },
  caption: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 22, color: colors.textMuted },
  tiny: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 18, color: colors.textMuted },
};
