import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Avatar, Button, Card, Screen, Tag, Txt } from '@/components';
import { api, type AnswerView } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import { dailyQuestions } from '@/data/content';
import { fa } from '@/i18n/fa';
import { colors, fonts, spacing } from '@/theme';

export default function QuestionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const question = dailyQuestions.find((q) => q.id === id) ?? dailyQuestions[0];

  const [answer, setAnswer] = useState('');
  const [view, setView] = useState<AnswerView | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    const v = await api.getAnswers(question.id);
    setView(v);
    if (v.mine?.text) setAnswer(v.mine.text);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, [question.id]);

  async function submit() {
    setSaving(true);
    try {
      await api.saveAnswer(question.id, answer.trim());
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  const submitted = Boolean(view?.mine);

  return (
    <Screen>
      <View style={styles.topbar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={26} color={colors.text} />
        </Pressable>
        <Tag label={question.category} />
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="chatbubble-ellipses" size={28} color={colors.accent} />
        </View>
        <Txt variant="title" center style={{ marginTop: spacing.md }}>
          {question.text}
        </Txt>
        <Txt variant="caption" center color={colors.textMuted} style={{ marginTop: spacing.sm }}>
          خصوصی بین شما دو نفر — تا وقتی هر دو جواب بدید، نمایان نمی‌شه.
        </Txt>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xxl }} />
      ) : (
        <>
          {/* پاسخ کاربر */}
          <Txt variant="caption" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
            {fa.yourAnswer}
          </Txt>
          {submitted ? (
            <Card>
              <View style={styles.answerHead}>
                <Avatar name={user?.name} size={32} color={colors.ink} />
                <Txt variant="bodyBold">{user?.name ?? 'من'}</Txt>
                <Txt variant="tiny" color={colors.success} style={{ marginRight: 'auto' }}>
                  {fa.answered}
                </Txt>
              </View>
              <Txt variant="body" style={{ marginTop: spacing.sm }}>
                {view?.mine?.text}
              </Txt>
            </Card>
          ) : (
            <Card>
              <TextInput
                value={answer}
                onChangeText={setAnswer}
                placeholder={fa.writeAnswer}
                placeholderTextColor={colors.textFaint}
                multiline
                style={styles.input}
              />
            </Card>
          )}

          {!submitted ? (
            <Button
              label={fa.submitAnswer}
              onPress={submit}
              loading={saving}
              disabled={!answer.trim()}
              style={{ marginTop: spacing.lg }}
            />
          ) : null}

          {/* پاسخ نیمهٔ دیگر */}
          <Txt variant="caption" style={{ marginTop: spacing.xxl, marginBottom: spacing.sm }}>
            {fa.partnerAnswer}
          </Txt>
          {submitted && view?.partner ? (
            <Card style={{ backgroundColor: colors.accentTint, borderColor: colors.accentSoft }}>
              <View style={styles.answerHead}>
                <Avatar name={user?.partnerName} size={32} color={colors.accent} />
                <Txt variant="bodyBold">{user?.partnerName ?? 'نیمهٔ دیگر'}</Txt>
              </View>
              <Txt variant="body" style={{ marginTop: spacing.sm }}>
                {view.partner.text}
              </Txt>
            </Card>
          ) : (
            <Card style={styles.locked}>
              <Ionicons name="lock-closed-outline" size={22} color={colors.textFaint} />
              <Txt variant="caption" center color={colors.textMuted} style={{ marginTop: spacing.sm }}>
                {submitted ? fa.partnerNotYet : fa.partnerLocked}
              </Txt>
            </Card>
          )}
        </>
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
  hero: { alignItems: 'center', paddingHorizontal: spacing.md, marginTop: spacing.lg },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    minHeight: 110,
    textAlign: 'right',
    writingDirection: 'rtl',
    textAlignVertical: 'top',
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
  },
  answerHead: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm },
  locked: { alignItems: 'center', backgroundColor: colors.surfaceAlt },
});
