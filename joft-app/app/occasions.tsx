import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { Button, Card, JalaliDatePicker, Screen, Txt } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { colors, fonts, radius, spacing } from '@/theme';
import { jalaliDayMonth } from '@/utils/jalali';
import { cancelNotification, scheduleOccasionReminder } from '@/utils/notifications';
import {
  getOccasions,
  saveOccasions,
  uid,
  type Occasion,
} from '@/storage/local';

const ICONS = [
  'heart-outline',
  'gift-outline',
  'calendar-outline',
  'star-outline',
  'sparkles-outline',
  'restaurant-outline',
] as const;

export default function Occasions() {
  const router = useRouter();
  const { user } = useAuth();
  const [list, setList] = useState<Occasion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Occasion | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      let data = await getOccasions();
      if (data.length === 0) {
        // دفعهٔ اول: از پروفایل، چند مناسبت پیش‌فرض می‌سازیم
        data = [
          {
            id: uid(),
            title: 'سالگرد آشنایی',
            dateISO: user?.anniversary ?? new Date().toISOString(),
            icon: 'heart-outline',
            reminder: true,
          },
        ];
        await saveOccasions(data);
      }
      setList(data);
      setLoading(false);
    })();
  }, []);

  async function persist(next: Occasion[]) {
    setList(next);
    await saveOccasions(next);
  }

  function openAdd() {
    setEditing({ id: uid(), title: '', dateISO: new Date().toISOString(), icon: 'gift-outline', reminder: true });
    setModalOpen(true);
  }
  function openEdit(o: Occasion) {
    setEditing({ ...o });
    setModalOpen(true);
  }

  async function handleSave(o: Occasion) {
    // یادآورِ قبلی را لغو و در صورت نیاز دوباره زمان‌بندی کن
    await cancelNotification(o.reminderId);
    let reminderId: string | null = null;
    if (o.reminder) {
      reminderId = await scheduleOccasionReminder(o.title || 'مناسبت', new Date(o.dateISO));
    }
    const updated: Occasion = { ...o, reminderId };
    const exists = list.some((x) => x.id === o.id);
    const next = exists ? list.map((x) => (x.id === o.id ? updated : x)) : [...list, updated];
    await persist(next);
    setModalOpen(false);
    setEditing(null);
  }

  async function handleDelete(o: Occasion) {
    await cancelNotification(o.reminderId);
    await persist(list.filter((x) => x.id !== o.id));
  }

  async function toggleReminder(o: Occasion) {
    await cancelNotification(o.reminderId);
    let reminderId: string | null = null;
    const reminder = !o.reminder;
    if (reminder) reminderId = await scheduleOccasionReminder(o.title, new Date(o.dateISO));
    await persist(list.map((x) => (x.id === o.id ? { ...x, reminder, reminderId } : x)));
  }

  return (
    <Screen>
      <View style={styles.topbar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-forward" size={26} color={colors.text} />
        </Pressable>
        <Txt variant="heading">مناسبت‌های خاص</Txt>
        <Pressable onPress={openAdd} hitSlop={12}>
          <Ionicons name="add-circle" size={28} color={colors.accent} />
        </Pressable>
      </View>

      <Txt variant="body" color={colors.textMuted} style={{ marginTop: spacing.xs }}>
        روزهای مهمتان را اضافه کنید تا با یادآوری هیچ‌کدام را فراموش نکنید.
      </Txt>

      {loading ? null : list.length === 0 ? (
        <Txt variant="caption" center color={colors.textFaint} style={{ marginTop: spacing.xxl }}>
          هنوز مناسبتی نداری. با دکمهٔ + اضافه کن.
        </Txt>
      ) : (
        <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
          {list.map((o) => {
            const dm = jalaliDayMonth(new Date(o.dateISO));
            return (
              <Card key={o.id}>
                <View style={styles.row}>
                  <View style={styles.dateBadge}>
                    <Txt variant="heading" center color={colors.textInverse}>
                      {dm.day}
                    </Txt>
                    <Txt variant="tiny" center color={colors.textInverse}>
                      {dm.month}
                    </Txt>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.titleRow}>
                      <Ionicons name={o.icon as any} size={18} color={colors.accent} />
                      <Txt variant="bodyBold" style={{ flex: 1 }}>
                        {o.title}
                      </Txt>
                    </View>
                    <Pressable onPress={() => toggleReminder(o)} style={styles.reminderRow}>
                      <Ionicons
                        name={o.reminder ? 'notifications' : 'notifications-off-outline'}
                        size={15}
                        color={o.reminder ? colors.accent : colors.textFaint}
                      />
                      <Txt variant="tiny" color={o.reminder ? colors.accent : colors.textFaint}>
                        {o.reminder ? 'یادآوری روشن' : 'یادآوری خاموش'}
                      </Txt>
                    </Pressable>
                  </View>
                  <View style={styles.actions}>
                    <Pressable onPress={() => openEdit(o)} hitSlop={8}>
                      <Ionicons name="create-outline" size={20} color={colors.textMuted} />
                    </Pressable>
                    <Pressable onPress={() => handleDelete(o)} hitSlop={8}>
                      <Ionicons name="trash-outline" size={20} color={colors.accent} />
                    </Pressable>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      )}

      {editing ? (
        <EditModal
          visible={modalOpen}
          occasion={editing}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      ) : null}
    </Screen>
  );
}

function EditModal({
  visible,
  occasion,
  onClose,
  onSave,
}: {
  visible: boolean;
  occasion: Occasion;
  onClose: () => void;
  onSave: (o: Occasion) => void;
}) {
  const [draft, setDraft] = useState<Occasion>(occasion);
  useEffect(() => setDraft(occasion), [occasion]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalRoot}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Txt variant="heading" center style={{ marginBottom: spacing.lg }}>
              {occasion.title ? 'ویرایش مناسبت' : 'مناسبت جدید'}
            </Txt>

            <Txt variant="caption" style={{ marginBottom: spacing.sm }}>
              عنوان
            </Txt>
            <TextInput
              value={draft.title}
              onChangeText={(t) => setDraft({ ...draft, title: t })}
              placeholder="مثلاً سالگرد ازدواج"
              placeholderTextColor={colors.textFaint}
              style={styles.input}
            />

            <Txt variant="caption" style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>
              تاریخ (شمسی)
            </Txt>
            <JalaliDatePicker
              value={new Date(draft.dateISO)}
              onChange={(d) => setDraft({ ...draft, dateISO: d.toISOString() })}
            />

            <Txt variant="caption" style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>
              آیکن
            </Txt>
            <View style={styles.iconRow}>
              {ICONS.map((ic) => {
                const active = draft.icon === ic;
                return (
                  <Pressable
                    key={ic}
                    onPress={() => setDraft({ ...draft, icon: ic })}
                    style={[styles.iconPick, active && styles.iconPickActive]}
                  >
                    <Ionicons name={ic} size={20} color={active ? colors.accent : colors.textMuted} />
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.switchRow}>
              <Txt variant="subtitle">یادآوری بگیرم</Txt>
              <Switch
                value={draft.reminder}
                onValueChange={(v) => setDraft({ ...draft, reminder: v })}
                trackColor={{ true: colors.accent, false: colors.border }}
                thumbColor={colors.surface}
              />
            </View>

            <Button
              label="ذخیره"
              onPress={() => onSave(draft)}
              disabled={!draft.title.trim()}
              style={{ marginTop: spacing.lg }}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md },
  dateBadge: {
    width: 54,
    height: 58,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.xs },
  reminderRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
  actions: { flexDirection: 'row-reverse', gap: spacing.md, alignItems: 'center' },
  modalRoot: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(27,26,41,0.35)' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    maxHeight: '88%',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    height: 54,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.text,
  },
  iconRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: spacing.sm },
  iconPick: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPickActive: { borderColor: colors.accent, backgroundColor: colors.accentTint },
  switchRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
});
