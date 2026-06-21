import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Avatar, Button, Card, Screen, Tag, Txt } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { dailyQuestions } from '@/data/content';
import { fa } from '@/i18n/fa';
import { colors, fonts, radius, spacing } from '@/theme';

export default function QuestionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const question = dailyQuestions.find((q) => q.id === id) ?? dailyQuestions[0];

  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // پاسخ نمونهٔ نیمهٔ دیگر که بعد از ثبت پاسخِ کاربر باز می‌شود
  const partnerAnswer =
    'برام مهم‌ترین چیز این بود که وقتی حرف می‌زدم واقعاً گوش می‌دادی و حس می‌کردم دیده می‌شم 💛';

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
        <Ionicons name="chatbubble-ellipses" size={32} color={colors.accent} />
        <Txt variant="title" center style={{ marginTop: spacing.md }}>
          {question.text}
        </Txt>
      </View>

      {/* پاسخ کاربر */}
      <Txt variant="caption" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
        {fa.yourAnswer}
      </Txt>
      {submitted ? (
        <Card>
          <View style={styles.answerHead}>
            <Avatar name={user?.name} size={32} color={colors.primary} />
            <Txt variant="bodyBold">{user?.name ?? 'من'}</Txt>
            <Txt variant="tiny" color={colors.success} style={{ marginRight: 'auto' }}>
              {fa.answered}
            </Txt>
          </View>
          <Txt variant="body" style={{ marginTop: spacing.sm }}>
            {answer}
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
          onPress={() => setSubmitted(true)}
          disabled={!answer.trim()}
          style={{ marginTop: spacing.lg }}
        />
      ) : null}

      {/* پاسخ نیمهٔ دیگر */}
      <Txt variant="caption" style={{ marginTop: spacing.xxl, marginBottom: spacing.sm }}>
        {fa.partnerAnswer}
      </Txt>
      {submitted ? (
        <Card style={{ backgroundColor: colors.accentTint }}>
          <View style={styles.answerHead}>
            <Avatar name={user?.partnerName} size={32} color={colors.accent} />
            <Txt variant="bodyBold">{user?.partnerName ?? 'نیمهٔ دیگر'}</Txt>
          </View>
          <Txt variant="body" style={{ marginTop: spacing.sm }}>
            {partnerAnswer}
          </Txt>
        </Card>
      ) : (
        <Card style={styles.locked}>
          <Ionicons name="lock-closed" size={22} color={colors.textFaint} />
          <Txt variant="caption" center color={colors.textMuted} style={{ marginTop: spacing.sm }}>
            {fa.partnerLocked}
          </Txt>
        </Card>
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
