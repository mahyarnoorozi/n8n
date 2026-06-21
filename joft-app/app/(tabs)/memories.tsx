import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Avatar, Card, Screen, Txt } from '@/components';
import { api, type Memory } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import { fa } from '@/i18n/fa';
import { colors, fonts, radius, spacing } from '@/theme';
import { formatJalali } from '@/utils/jalali';

export default function Memories() {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getMemories().then((list) => {
      setMemories(list);
      setLoading(false);
    });
  }, []);

  async function addMemory() {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const m = await api.addMemory(text.trim());
      setMemories((prev) => [m, ...prev]);
      setText('');
    } finally {
      setSaving(false);
    }
  }

  const authorName = (m: Memory) =>
    m.author === 'me' ? user?.name ?? 'من' : user?.partnerName ?? 'نیمهٔ دیگر';

  return (
    <Screen>
      <Txt variant="title">{fa.memoriesTitle}</Txt>
      <Txt variant="body" color={colors.textMuted} style={{ marginTop: spacing.xs }}>
        لحظه‌های قشنگتان را ثبت کنید تا همیشه بماند.
      </Txt>

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
          style={[styles.addBtn, (!text.trim() || saving) && { opacity: 0.5 }]}
          disabled={!text.trim() || saving}
        >
          <Ionicons name="add" size={18} color={colors.textInverse} />
          <Txt variant="caption" color={colors.textInverse}>
            {fa.addMemory}
          </Txt>
        </Pressable>
      </Card>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xl }} />
      ) : memories.length === 0 ? (
        <Txt variant="caption" center color={colors.textFaint} style={{ marginTop: spacing.xxl }}>
          هنوز خاطره‌ای ثبت نشده. اولین خاطره‌تان را بنویسید 🖤
        </Txt>
      ) : (
        <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
          {memories.map((m) => (
            <Card key={m.id}>
              <View style={styles.memHeader}>
                <Avatar
                  name={authorName(m)}
                  size={36}
                  color={m.author === 'me' ? colors.ink : colors.accent}
                />
                <View style={{ flex: 1 }}>
                  <Txt variant="bodyBold">{authorName(m)}</Txt>
                  <Txt variant="tiny" color={colors.textFaint}>
                    {formatJalali(new Date(m.createdAt))}
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
      )}
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
