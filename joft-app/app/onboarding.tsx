import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Txt } from '@/components';
import { fa } from '@/i18n/fa';
import { colors, radius, spacing } from '@/theme';

const { width } = Dimensions.get('window');

export default function Onboarding() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const slides = fa.onboarding;

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const p = Math.round(e.nativeEvent.contentOffset.x / width);
    if (p !== page) setPage(p);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {slides.map((s, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <View style={styles.art}>
              <View style={styles.blob} />
              <Ionicons name={s.icon as any} size={92} color={colors.accent} />
            </View>
            <Txt variant="title" center style={{ marginTop: spacing.xxl }}>
              {s.title}
            </Txt>
            <Txt variant="body" center color={colors.textMuted} style={{ marginTop: spacing.sm }}>
              {s.desc}
            </Txt>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === page && styles.dotActive]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Button label={fa.getStarted} onPress={() => router.push('/(auth)/phone')} />
        <Button
          label={fa.haveAccount}
          variant="ghost"
          onPress={() => router.push('/(auth)/phone')}
          style={{ marginTop: spacing.sm }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  art: { width: 220, height: 220, alignItems: 'center', justifyContent: 'center' },
  blob: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.accentTint,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { width: 22, backgroundColor: colors.accent },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
});
