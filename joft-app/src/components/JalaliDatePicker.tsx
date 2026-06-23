import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/theme';
import { JALALI_MONTHS, formatJalali, jalaliToDate, toJalaliParts } from '@/utils/jalali';
import { toFa } from '@/utils/persian';
import { Button } from './Button';
import { Txt } from './Txt';

type Props = {
  value?: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
};

const currentJYear = toJalaliParts(new Date()).jy;
const YEARS = Array.from({ length: 60 }, (_, i) => currentJYear - i); // امسال تا ۶۰ سال قبل
const MONTHS = JALALI_MONTHS.map((m, i) => ({ label: m, value: i + 1 }));
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

/** انتخابگر تاریخ شمسی با سه ستونِ سال/ماه/روز. */
export function JalaliDatePicker({ value, onChange, placeholder = 'انتخاب تاریخ' }: Props) {
  const [open, setOpen] = useState(false);
  const init = useMemo(() => toJalaliParts(value ?? new Date()), [value, open]);
  const [jy, setJy] = useState(init.jy);
  const [jm, setJm] = useState(init.jm);
  const [jd, setJd] = useState(init.jd);

  function openPicker() {
    const p = toJalaliParts(value ?? new Date());
    setJy(p.jy);
    setJm(p.jm);
    setJd(p.jd);
    setOpen(true);
  }

  function confirm() {
    onChange(jalaliToDate(jy, jm, jd));
    setOpen(false);
  }

  return (
    <>
      <Pressable style={styles.field} onPress={openPicker}>
        <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
        <Txt variant="subtitle" color={value ? colors.text : colors.textFaint} style={{ flex: 1 }}>
          {value ? formatJalali(value) : placeholder}
        </Txt>
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={styles.sheet}>
          <Txt variant="heading" center style={{ marginBottom: spacing.md }}>
            تاریخ را انتخاب کن
          </Txt>
          <View style={styles.columns}>
            <Column data={DAYS} selected={jd} onSelect={setJd} render={(d) => toFa(d)} />
            <Column data={MONTHS.map((m) => m.value)} selected={jm} onSelect={setJm} render={(m) => JALALI_MONTHS[m - 1]} wide />
            <Column data={YEARS} selected={jy} onSelect={setJy} render={(y) => toFa(y)} />
          </View>
          <Button label="تأیید" onPress={confirm} style={{ marginTop: spacing.lg }} />
        </View>
      </Modal>
    </>
  );
}

function Column<T extends number>({
  data,
  selected,
  onSelect,
  render,
  wide,
}: {
  data: T[];
  selected: T;
  onSelect: (v: T) => void;
  render: (v: T) => string;
  wide?: boolean;
}) {
  return (
    <ScrollView
      style={[styles.col, wide && { flex: 1.4 }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: spacing.sm }}
    >
      {data.map((item) => {
        const active = item === selected;
        return (
          <Pressable key={item} onPress={() => onSelect(item)} style={styles.cell}>
            <Txt
              center
              color={active ? colors.accent : colors.textMuted}
              style={active ? styles.activeText : undefined}
            >
              {render(item)}
            </Txt>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    height: 56,
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(27,26,41,0.35)' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  columns: {
    flexDirection: 'row-reverse',
    height: 200,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    overflow: 'hidden',
  },
  col: { flex: 1 },
  cell: { paddingVertical: spacing.md, paddingHorizontal: spacing.sm },
  activeText: { fontFamily: fonts.bold, fontSize: 18 },
});
