import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Screen, Tag, Txt } from '@/components';
import { dailyQuestions } from '@/data/content';
import { colors, spacing } from '@/theme';

export default function Questions() {
  const router = useRouter();

  return (
    <Screen>
      <Txt variant="title">سؤال‌های روزانه</Txt>
      <Txt variant="body" color={colors.textMuted} style={{ marginTop: spacing.xs }}>
        هر روز یک سؤال تازه برای نزدیک‌تر شدن به نیمهٔ دیگرت.
      </Txt>

      <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
        {dailyQuestions.map((q, i) => (
          <Card key={q.id} onPress={() => router.push(`/question/${q.id}`)}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Tag label={q.category} />
                <Txt variant="subtitle" style={{ marginTop: spacing.sm }}>
                  {q.text}
                </Txt>
              </View>
              {i === 0 ? (
                <View style={styles.todayBadge}>
                  <Txt variant="tiny" color={colors.textInverse}>
                    امروز
                  </Txt>
                </View>
              ) : null}
            </View>
            <View style={styles.cta}>
              <Ionicons name="arrow-back" size={16} color={colors.accent} />
              <Txt variant="caption" color={colors.accent}>
                پاسخ بده
              </Txt>
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row-reverse', gap: spacing.md },
  todayBadge: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  cta: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
});
