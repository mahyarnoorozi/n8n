import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Screen, Txt } from '@/components';
import { api } from '@/api/client';
import { games, sampleQuiz } from '@/data/content';
import { colors, radius, spacing } from '@/theme';
import { toFa } from '@/utils/persian';

export default function GameDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const game = games.find((g) => g.id === id) ?? games[0];

  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);

  const total = sampleQuiz.length;
  const finished = step >= total;
  const current = sampleQuiz[step];

  function next() {
    if (selected === null) return;
    setAnswers((a) => [...a, selected]);
    setSelected(null);
    setStep((s) => s + 1);
  }

  function restart() {
    setStep(0);
    setSelected(null);
    setAnswers([]);
  }

  return (
    <Screen scroll={false}>
      <View style={styles.topbar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={26} color={colors.text} />
        </Pressable>
        <Txt variant="bodyBold">{game.title}</Txt>
        <View style={{ width: 26 }} />
      </View>

      {!finished ? (
        <>
          {/* نوار پیشرفت */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${((step + 1) / total) * 100}%` }]} />
          </View>
          <Txt variant="caption" color={colors.textMuted} style={{ marginTop: spacing.sm }}>
            سؤال {toFa(step + 1)} از {toFa(total)}
          </Txt>

          <Txt variant="title" style={{ marginTop: spacing.xl }}>
            {current.prompt}
          </Txt>

          <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
            {current.options.map((opt, i) => {
              const active = selected === i;
              return (
                <Pressable
                  key={i}
                  onPress={() => setSelected(i)}
                  style={[styles.option, active && styles.optionActive]}
                >
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active ? <Ionicons name="checkmark" size={14} color={colors.textInverse} /> : null}
                  </View>
                  <Txt variant="subtitle" style={{ flex: 1 }} color={active ? colors.accentDark : colors.text}>
                    {opt}
                  </Txt>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.footer}>
            <Button
              label={step + 1 === total ? 'دیدن نتیجه' : 'بعدی'}
              onPress={next}
              disabled={selected === null}
            />
          </View>
        </>
      ) : (
        <View style={styles.result}>
          <View style={styles.trophy}>
            <Ionicons name="heart-circle" size={72} color={colors.accent} />
          </View>
          <Txt variant="title" center style={{ marginTop: spacing.lg }}>
            آفرین! بازی تمام شد 🎉
          </Txt>
          <Txt variant="body" center color={colors.textMuted} style={{ marginTop: spacing.sm }}>
            به {toFa(answers.length)} سؤال جواب دادی. حالا نوبت نیمهٔ دیگرت است تا حدس بزند و
            امتیازتان مشخص شود.
          </Txt>
          <View style={styles.footer}>
            <Button
              label="ارسال برای نیمهٔ دیگر"
              icon="paper-plane"
              onPress={async () => {
                await api.saveGameResult(game.id, answers);
                router.back();
              }}
            />
            <Button label="بازی دوباره" variant="ghost" onPress={restart} style={{ marginTop: spacing.sm }} />
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: { height: 8, borderRadius: 999, backgroundColor: colors.accent },
  option: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  optionActive: { borderColor: colors.accent, backgroundColor: colors.accentTint },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.textFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  footer: { position: 'absolute', bottom: spacing.lg, left: spacing.lg, right: spacing.lg },
  result: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  trophy: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
