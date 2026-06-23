import { Ionicons } from '@expo/vector-icons';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, shadow, spacing } from '@/theme';

/**
 * توستِ پایین — بازخوردِ کوتاه و بی‌مزاحمت (مثل اسنپ/دیجی‌کالا)، به‌جای متنِ خطی
 * یا Alertِ مزاحم. از هر صفحه‌ای با useToast().show(...) صدا زده می‌شود.
 */

type Kind = 'success' | 'info' | 'error';
type ToastApi = { show: (message: string, kind?: Kind) => void };

const ToastContext = createContext<ToastApi>({ show: () => {} });

const ICON: Record<Kind, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  info: 'information-circle',
  error: 'alert-circle',
};
const TINT: Record<Kind, string> = {
  success: colors.success,
  info: colors.accent,
  error: colors.accentDark,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<{ message: string; kind: Kind } | null>(null);
  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (message: string, kind: Kind = 'success') => {
      if (timer.current) clearTimeout(timer.current);
      setToast({ message, kind });
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 8, tension: 80 }).start();
      timer.current = setTimeout(() => {
        Animated.timing(anim, { toValue: 0, duration: 220, useNativeDriver: true }).start(() =>
          setToast(null),
        );
      }, 2600);
    },
    [anim],
  );

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.wrap,
            {
              bottom: insets.bottom + spacing.xxl,
              opacity: anim,
              transform: [
                { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
              ],
            },
          ]}
        >
          <View style={styles.toast}>
            <Ionicons name={ICON[toast.kind]} size={20} color={TINT[toast.kind]} />
            <View style={styles.textWrap}>
              <Animated.Text style={styles.text} numberOfLines={2}>
                {toast.message}
              </Animated.Text>
            </View>
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: spacing.lg, right: spacing.lg, alignItems: 'center', zIndex: 1000 },
  toast: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.ink,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    maxWidth: '100%',
    ...shadow.card,
  },
  textWrap: { flexShrink: 1 },
  text: {
    color: colors.textInverse,
    fontFamily: fonts.medium,
    fontSize: 14,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
