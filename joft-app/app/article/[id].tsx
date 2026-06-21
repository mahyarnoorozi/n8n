import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Screen, Tag, Txt } from '@/components';
import { articles } from '@/data/content';
import { colors, radius, spacing } from '@/theme';

export default function ArticleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const article = articles.find((a) => a.id === id) ?? articles[0];

  return (
    <Screen>
      <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
        <Ionicons name="chevron-forward" size={26} color={colors.text} />
      </Pressable>

      <View style={[styles.cover, { backgroundColor: article.bg }]}>
        <Ionicons name="book" size={44} color={colors.primary} />
      </View>

      <View style={styles.metaRow}>
        <Tag label={article.category} bg={colors.lavender} color={colors.primary} />
        <Txt variant="tiny" color={colors.textFaint}>
          {article.readTime}
        </Txt>
      </View>

      <Txt variant="title" style={{ marginTop: spacing.md }}>
        {article.title}
      </Txt>

      <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
        {article.body.map((p, i) => (
          <Txt key={i} variant="body" color={colors.text} style={{ lineHeight: 30 }}>
            {p}
          </Txt>
        ))}
      </View>

      <View style={styles.quote}>
        <Ionicons name="heart" size={20} color={colors.accent} />
        <Txt variant="bodyBold" color={colors.primary} style={{ flex: 1 }}>
          {article.excerpt}
        </Txt>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start', marginBottom: spacing.md },
  cover: {
    height: 160,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  quote: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    alignItems: 'flex-start',
    backgroundColor: colors.accentTint,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
});
