import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Avatar, Card, Screen, Txt } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { fa } from '@/i18n/fa';
import { colors, fonts, radius, spacing } from '@/theme';
import { formatJalali } from '@/utils/jalali';

type Memory = { id: string; author: string; color: string; text: string; date: Date };

export default function Memories() {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [memories, setMemories] = useState<Memory[]>([
    {
      id: 'm1',
      author: user?.partnerName ?? 'نیمهٔ دیگر',
      color: colors.accent,
      text: 'یادمه اولین باری که با هم رفتیم کافه، تا صبح حرف زدیم و اصلاً نفهمیدیم چطور گذشت ☕️',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    },
    {
      id: 'm2',
      author: user?.name ?? 'من',
      color: colors.primary,
      text: 'سفر شمالمون بهترین خاطرهٔ امساله. صدای بارون و جادهٔ جنگلی 🌲',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    },
  ]);

  function addMemory() {
    if (!text.trim()) return;
    setMemories((prev) => [
      {
        id: String(Date.now()),
        author: user?.name ?? 'من',
        color: colors.primary,
        text: text.trim(),
        date: new Date(),
      },
      ...prev,
    ]);
    setText('');
  }

  return (
    <Screen>
      <Txt variant="title">{fa.memoriesTitle}</Txt>
      <Txt variant="body" color={colors.textMuted} style={{ marginTop: spacing.xs }}>
        لحظه‌های قشنگتان را ثبت کنید تا همیشه بماند.
      </Txt>

      {/* ورودی افزودن خاطره */}
      <Card style={{ marginTop: spacing.xl }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={fa.memoryPlaceholder}
          placeholderTextColor={colors.textFaint}
          multiline
          style={styles.input}
        />
        <Pressable
          onPress={addMemory}
          style={[styles.addBtn, !text.trim() && { opacity: 0.5 }]}
          disabled={!text.trim()}
        >
          <Ionicons name="add" size={18} color={colors.textInverse} />
          <Txt variant="caption" color={colors.textInverse}>
            {fa.addMemory}
          </Txt>
        </Pressable>
      </Card>

      {/* خط زمانی خاطره‌ها */}
      <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
        {memories.map((m) => (
          <Card key={m.id}>
            <View style={styles.memHeader}>
              <Avatar name={m.author} size={36} color={m.color} />
              <View style={{ flex: 1 }}>
                <Txt variant="bodyBold">{m.author}</Txt>
                <Txt variant="tiny" color={colors.textFaint}>
                  {formatJalali(m.date)}
                </Txt>
              </View>
              <Ionicons name="heart" size={18} color={colors.accentSoft} />
            </View>
            <Txt variant="body" style={{ marginTop: spacing.sm }}>
              {m.text}
            </Txt>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 80,
    textAlign: 'right',
    writingDirection: 'rtl',
    textAlignVertical: 'top',
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  addBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  memHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm },
});
