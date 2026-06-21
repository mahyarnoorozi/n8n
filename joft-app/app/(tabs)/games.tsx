import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, IconChip, Screen, SectionHeader, Tag, Txt } from '@/components';
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

      {/* کارت‌های بازی — همگی با چیدمان و آیکنِ یکدست */}
      <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
        {games.map((g) => (
          <Card key={g.id} onPress={() => router.push(`/game/${g.id}`)}>
            <View style={styles.gameRow}>
              <IconChip icon={g.icon as any} size={52} />
              <View style={{ flex: 1 }}>
                <Txt variant="bodyBold">{g.title}</Txt>
                <Txt variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>
                  {g.subtitle}
                </Txt>
              </View>
              <Tag label={g.duration} />
            </View>
          </Card>
        ))}
      </View>

      {/* بخش مقاله‌ها و توصیه‌های کارشناسی */}
      <SectionHeader title="بخوان و یاد بگیر" />
      <View style={{ gap: spacing.md }}>
        {articles.map((a) => (
          <Card key={a.id} onPress={() => router.push(`/article/${a.id}`)} style={styles.article}>
            <View style={styles.accentBar} />
            <View style={styles.gameRow}>
              <IconChip icon={a.icon as any} size={48} />
              <View style={{ flex: 1 }}>
                <Txt variant="bodyBold" style={{ lineHeight: 26 }}>
                  {a.title}
                </Txt>
                <View style={styles.metaRow}>
                  <Tag label={a.category} />
                  <Txt variant="tiny" color={colors.textFaint}>
                    {a.readTime}
                  </Txt>
                </View>
              </View>
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gameRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md },
  article: { overflow: 'hidden' },
  accentBar: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.accent,
  },
  metaRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
});
