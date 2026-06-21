import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card, Screen, SectionHeader, Tag, Txt } from '@/components';
import { articles, games } from '@/data/content';
import { colors, radius, spacing } from '@/theme';

export default function Games() {
  const router = useRouter();

  return (
    <Screen>
      <Txt variant="title">بازی‌ها و کوییزها</Txt>
      <Txt variant="body" color={colors.textMuted} style={{ marginTop: spacing.xs }}>
        با هم بازی کنید، بخندید و بیشتر همدیگر را بشناسید.
      </Txt>

      <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
        {games.map((g) => (
          <Card key={g.id} onPress={() => router.push(`/game/${g.id}`)} padded={false}>
            <View style={[styles.gameTop, { backgroundColor: g.bg }]}>
              <Ionicons name={g.icon as any} size={40} color={colors.primary} />
            </View>
            <View style={styles.gameBody}>
              <View style={styles.gameRow}>
                <Txt variant="heading" style={{ flex: 1 }}>
                  {g.title}
                </Txt>
                <Tag label={g.duration} bg={colors.accentSoft} color={colors.accentDark} />
              </View>
              <Txt variant="caption" color={colors.textMuted} style={{ marginTop: spacing.xs }}>
                {g.subtitle}
              </Txt>
            </View>
          </Card>
        ))}
      </View>

      {/* بخش مقاله‌ها و توصیه‌های کارشناسی */}
      <SectionHeader title="بخوان و یاد بگیر" />
      <View style={{ gap: spacing.md }}>
        {articles.map((a) => (
          <Pressable
            key={a.id}
            style={[styles.article, { backgroundColor: a.bg }]}
            onPress={() => router.push(`/article/${a.id}`)}
          >
            <Tag label={a.category} bg={colors.surface} color={colors.primary} />
            <Txt variant="subtitle" style={{ marginTop: spacing.sm }}>
              {a.title}
            </Txt>
            <Txt variant="tiny" color={colors.textMuted} style={{ marginTop: spacing.xs }}>
              {a.readTime}
            </Txt>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gameTop: {
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  gameBody: { padding: spacing.lg },
  gameRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm },
  article: { borderRadius: radius.lg, padding: spacing.lg },
});
