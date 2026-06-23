import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { Button, Card, JalaliDatePicker, Screen, Txt } from '@/components';
import { api } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import { colors, radius, spacing } from '@/theme';
import { formatJalali, jalaliDayMonth, jalaliWeekday } from '@/utils/jalali';
import { toFa } from '@/utils/persian';
import { cancelNotification, schedulePeriodReminder } from '@/utils/notifications';
import {
  addDays,
  computeStatus,
  PHASE_META,
  phaseCopy,
  phaseOfDate,
  type CycleStatus,
  type PhaseKey,
} from '@/utils/cycle';
import {
  addPeriodStart,
  getCycle,
  removePeriod,
  saveCycle,
  withLearnedCycleLength,
  type CycleData,
  type Perspective,
} from '@/storage/cycle';

/** رنگِ هر فاز — قرمزِ برند برای پریود، و طیفی آرام برای بقیه. */
const PHASE_COLOR: Record<PhaseKey, string> = {
  menstrual: colors.accent,
  follicular: '#1FAE78',
  ovulation: '#F5A623',
  luteal: '#8C7BD6',
};

export default function Cycle() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<CycleData | null>(null);
  const [setupDate, setSetupDate] = useState<Date>(new Date());
  const [partnerCycle, setPartnerCycle] = useState<{
    lastPeriodStartISO: string;
    cycleLength: number;
    periodLength: number;
  } | null>(null);

  useEffect(() => {
    getCycle().then(setData);
  }, []);

  // چرخهٔ به‌اشتراک‌گذاشتهٔ نیمهٔ دیگر را می‌گیریم (هنگام ورود و هر بار سوییچ به حالتِ همراه)
  useEffect(() => {
    api.getPartnerCycle().then(setPartnerCycle);
  }, [data?.perspective]);

  /** وضعیتِ چرخهٔ خودِ کاربر از روی داده‌های محلی. */
  const selfStatus: CycleStatus | null = useMemo(() => {
    if (!data || data.periods.length === 0) return null;
    return computeStatus(data.periods[0].startISO, data.cycleLength, data.periodLength);
  }, [data]);

  /** وضعیتِ چرخهٔ نیمهٔ دیگر، از روی داده‌های همگام‌شده از سرور. */
  const partnerStatus: CycleStatus | null = useMemo(() => {
    if (!partnerCycle) return null;
    return computeStatus(
      partnerCycle.lastPeriodStartISO,
      partnerCycle.cycleLength,
      partnerCycle.periodLength,
    );
  }, [partnerCycle]);

  /** ذخیره + برنامه‌ریزیِ دوبارهٔ یادآور + همگام‌سازیِ اشتراک با پارتنر. */
  async function persist(next: CycleData) {
    let toSave = next;
    await cancelNotification(next.reminderId);
    let reminderId: string | null = null;
    if (next.reminders && next.periods.length > 0) {
      const st = computeStatus(next.periods[0].startISO, next.cycleLength, next.periodLength);
      reminderId = await schedulePeriodReminder(st.nextPeriodStart);
    }
    toSave = { ...next, reminderId };
    setData(toSave);
    await saveCycle(toSave);

    // اگر اشتراک روشن است، پارامترهای تازه را برای نیمهٔ دیگر بفرست
    if (toSave.shareWithPartner && toSave.periods.length > 0) {
      api
        .shareCycle({
          share: true,
          lastPeriodStartISO: toSave.periods[0].startISO,
          cycleLength: toSave.cycleLength,
          periodLength: toSave.periodLength,
        })
        .catch(() => {});
    }
  }

  async function toggleShare(v: boolean) {
    if (!data) return;
    await persist({ ...data, shareWithPartner: v });
    if (!v) api.shareCycle({ share: false }).catch(() => {});
  }

  async function handleSetup() {
    if (!data) return;
    const next = withLearnedCycleLength(addPeriodStart(data, setupDate.toISOString()));
    await persist(next);
  }

  async function logToday() {
    if (!data) return;
    const next = withLearnedCycleLength(addPeriodStart(data, new Date().toISOString()));
    await persist(next);
  }

  async function deletePeriod(id: string) {
    if (!data) return;
    await persist(withLearnedCycleLength(removePeriod(data, id)));
  }

  async function setPerspective(p: Perspective) {
    if (!data) return;
    await persist({ ...data, perspective: p });
  }

  async function changeCycleLength(delta: number) {
    if (!data) return;
    const cycleLength = Math.min(45, Math.max(18, data.cycleLength + delta));
    await persist({ ...data, cycleLength });
  }
  async function changePeriodLength(delta: number) {
    if (!data) return;
    const periodLength = Math.min(12, Math.max(2, data.periodLength + delta));
    await persist({ ...data, periodLength });
  }
  async function toggleReminders(v: boolean) {
    if (!data) return;
    await persist({ ...data, reminders: v });
  }

  if (!data) {
    return (
      <Screen>
        <Topbar onBack={() => router.back()} />
      </Screen>
    );
  }

  const perspective = data.perspective;
  const isPartnerView = perspective === 'partner';
  // در حالتِ همراه: اگر دادهٔ واقعیِ پارتنر آمده از آن استفاده کن؛ وگرنه به‌عنوان
  // پیش‌نمایش، چرخهٔ خودِ کاربر را نشان بده (با برچسبِ شفاف).
  const usingRealPartner = isPartnerView && Boolean(partnerStatus);
  const previewFromSelf = isPartnerView && !partnerStatus && Boolean(selfStatus);
  const activeStatus = isPartnerView ? partnerStatus ?? selfStatus : selfStatus;
  const stripParams = usingRealPartner && partnerCycle
    ? partnerCycle
    : data.periods.length > 0
      ? {
          lastPeriodStartISO: data.periods[0].startISO,
          cycleLength: data.cycleLength,
          periodLength: data.periodLength,
        }
      : null;

  return (
    <Screen>
      <Topbar onBack={() => router.back()} />

      <Txt variant="caption" color={colors.textMuted} style={{ marginTop: spacing.xs }}>
        {isPartnerView
          ? `چرخهٔ ${user?.partnerName ?? 'نیمهٔ دیگرت'} را دنبال کن تا این روزها کنارش باشی.`
          : 'چرخه‌ات را آرام و خصوصی دنبال کن. داده‌ها روی گوشی می‌ماند و فقط با اجازهٔ خودت با نیمهٔ دیگر به اشتراک گذاشته می‌شود.'}
      </Txt>

      {/* انتخابِ نگاه: خودم / همراه — همیشه در دسترس */}
      <PerspectiveToggle value={perspective} onChange={setPerspective} />

      {/* —— حالتِ همراه —— */}
      {isPartnerView ? (
        activeStatus ? (
          <>
            <PartnerBanner
              synced={usingRealPartner}
              preview={previewFromSelf}
              partnerName={user?.partnerName}
            />
            <CycleRing status={activeStatus} />
            <PhaseCard phase={activeStatus.phase} perspective="partner" />
            <PredictionsCard status={activeStatus} />
            {stripParams ? <UpcomingStrip {...stripParams} /> : null}
            <Disclaimer />
          </>
        ) : (
          <PartnerEmpty partnerName={user?.partnerName} />
        )
      ) : /* —— حالتِ خودم —— */ data.periods.length === 0 ? (
        <SetupCard
          date={setupDate}
          onChange={setSetupDate}
          onSubmit={handleSetup}
          partnerName={user?.partnerName}
        />
      ) : selfStatus ? (
        <>
          <CycleRing status={selfStatus} />
          <PhaseCard phase={selfStatus.phase} perspective="self" />
          <Button
            label={selfStatus.isOnPeriod ? 'پریودم امروز شروع شد (ثبت دوباره)' : 'پریودم امروز شروع شد'}
            icon="water-outline"
            onPress={logToday}
            style={{ marginTop: spacing.lg }}
          />
          <PredictionsCard status={selfStatus} />
          {stripParams ? <UpcomingStrip {...stripParams} /> : null}
          <SettingsCard
            data={data}
            onCycle={changeCycleLength}
            onPeriod={changePeriodLength}
            onReminders={toggleReminders}
            onShare={toggleShare}
          />
          <HistoryCard data={data} onDelete={deletePeriod} />
          <Disclaimer />
        </>
      ) : null}
    </Screen>
  );
}

function Disclaimer() {
  return (
    <Txt variant="tiny" center color={colors.textFaint} style={{ marginTop: spacing.xl }}>
      🔒 پیش‌بینی‌ها تخمینی‌اند و جای مشورتِ پزشک را نمی‌گیرند.
    </Txt>
  );
}

function PartnerBanner({
  synced,
  preview,
  partnerName,
}: {
  synced: boolean;
  preview: boolean;
  partnerName?: string;
}) {
  if (synced) {
    return (
      <View style={[styles.banner, { backgroundColor: '#E9F7F1' }]}>
        <Ionicons name="sync" size={16} color={colors.success} />
        <Txt variant="tiny" color={colors.success} style={{ flex: 1 }}>
          همگام‌شده از چرخهٔ {partnerName ?? 'نیمهٔ دیگرت'} — همیشه به‌روز.
        </Txt>
      </View>
    );
  }
  if (preview) {
    return (
      <View style={[styles.banner, { backgroundColor: colors.surfaceAlt }]}>
        <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
        <Txt variant="tiny" color={colors.textMuted} style={{ flex: 1 }}>
          این پیش‌نمایش از روی چرخهٔ خودته. وقتی {partnerName ?? 'نیمهٔ دیگرت'} چرخه‌اش را به اشتراک بگذارد، اینجا واقعی می‌شود.
        </Txt>
      </View>
    );
  }
  return null;
}

function PartnerEmpty({ partnerName }: { partnerName?: string }) {
  const router = useRouter();
  return (
    <Card style={{ marginTop: spacing.xl }}>
      <View style={styles.heroIconWrap}>
        <View style={[styles.heroIcon, { backgroundColor: colors.accentSoft }]}>
          <Ionicons name="heart-outline" size={30} color={colors.accent} />
        </View>
      </View>
      <Txt variant="heading" center>
        هنوز چرخه‌ای به اشتراک گذاشته نشده
      </Txt>
      <Txt variant="caption" center color={colors.textMuted} style={{ marginTop: spacing.xs }}>
        وقتی {partnerName ?? 'نیمهٔ دیگرت'} در بخش «مراقبت و چرخه»، گزینهٔ «اشتراک با همراه» را روشن کند، چرخه‌اش اینجا برایت نمایش داده می‌شود تا این روزها کنارش باشی.
      </Txt>
      <Button
        label="اتصال / دعوت نیمهٔ دیگر"
        icon="link"
        variant="outline"
        onPress={() => router.push('/connect')}
        style={{ marginTop: spacing.lg }}
      />
    </Card>
  );
}

function Topbar({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.topbar}>
      <Pressable onPress={onBack} hitSlop={12}>
        <Ionicons name="chevron-forward" size={26} color={colors.text} />
      </Pressable>
      <Txt variant="heading">مراقبت و چرخه</Txt>
      <View style={{ width: 26 }} />
    </View>
  );
}

function SetupCard({
  date,
  onChange,
  onSubmit,
  partnerName,
}: {
  date: Date;
  onChange: (d: Date) => void;
  onSubmit: () => void;
  partnerName?: string;
}) {
  return (
    <Card style={{ marginTop: spacing.xl }}>
      <View style={styles.heroIconWrap}>
        <View style={[styles.heroIcon, { backgroundColor: colors.accentSoft }]}>
          <Ionicons name="flower-outline" size={30} color={colors.accent} />
        </View>
      </View>
      <Txt variant="heading" center>
        بریم شروع کنیم
      </Txt>
      <Txt variant="caption" center color={colors.textMuted} style={{ marginTop: spacing.xs }}>
        آخرین باری که پریود شروع شد چه روزی بود؟ با همین یک تاریخ، چرخه را برایت پیش‌بینی می‌کنیم.
      </Txt>
      <View style={{ marginTop: spacing.lg }}>
        <JalaliDatePicker value={date} onChange={onChange} placeholder="تاریخِ شروعِ آخرین پریود" />
      </View>
      <Button label="ثبت و شروع" onPress={onSubmit} style={{ marginTop: spacing.lg }} />
      <Txt variant="tiny" center color={colors.textFaint} style={{ marginTop: spacing.md }}>
        {partnerName
          ? `بعداً می‌تونی «حالت همراه» رو روشن کنی تا کنارِ ${partnerName} این روزها رو بهتر بفهمی.`
          : 'هرچه بیشتر پریودهات را ثبت کنی، پیش‌بینی دقیق‌تر می‌شود.'}
      </Txt>
    </Card>
  );
}

function PerspectiveToggle({
  value,
  onChange,
}: {
  value: Perspective;
  onChange: (p: Perspective) => void;
}) {
  return (
    <View style={styles.segment}>
      {(['self', 'partner'] as Perspective[]).map((p) => {
        const active = value === p;
        return (
          <Pressable
            key={p}
            onPress={() => onChange(p)}
            style={[styles.segmentItem, active && styles.segmentActive]}
          >
            <Ionicons
              name={p === 'self' ? 'person-outline' : 'heart-outline'}
              size={16}
              color={active ? colors.textInverse : colors.textMuted}
            />
            <Txt variant="tiny" color={active ? colors.textInverse : colors.textMuted}>
              {p === 'self' ? 'برای خودم' : 'حالت همراه'}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

function CycleRing({ status }: { status: CycleStatus }) {
  const color = PHASE_COLOR[status.phase];
  const big = status.daysUntilNextPeriod;
  return (
    <View style={styles.ringWrap}>
      <View style={[styles.ring, { borderColor: color }]}>
        <Txt variant="tiny" color={colors.textMuted}>
          {status.isOnPeriod ? 'روزِ پریود' : 'تا پریودِ بعدی'}
        </Txt>
        <Txt style={[styles.ringNumber, { color }]}>
          {status.isOnPeriod ? toFa(status.dayInCycle) : toFa(big)}
        </Txt>
        <Txt variant="caption" color={colors.textMuted}>
          {status.isOnPeriod ? '' : big <= 1 ? 'روز' : 'روز دیگر'}
        </Txt>
      </View>
      <Txt variant="caption" color={colors.textMuted} style={{ marginTop: spacing.md }}>
        روزِ {toFa(status.dayInCycle)} از چرخهٔ {toFa(status.cycleLength)} روزه
        {status.fertile ? ' • پنجرهٔ باروری' : ''}
      </Txt>
    </View>
  );
}

function PhaseCard({ phase, perspective }: { phase: PhaseKey; perspective: Perspective }) {
  const meta = PHASE_META[phase];
  const copy = phaseCopy(phase, perspective);
  const color = PHASE_COLOR[phase];
  return (
    <Card style={{ marginTop: spacing.lg }}>
      <View style={styles.phaseHead}>
        <View style={[styles.phaseDot, { backgroundColor: color }]} />
        <Txt variant="bodyBold" style={{ flex: 1 }}>
          {meta.emoji} {meta.title}
        </Txt>
      </View>
      <Txt variant="body" color={colors.inkSoft} style={{ marginTop: spacing.sm }}>
        {copy.body}
      </Txt>
      <View style={[styles.tip, { backgroundColor: colors.accentTint }]}>
        <Ionicons
          name={perspective === 'partner' ? 'heart' : 'bulb-outline'}
          size={16}
          color={colors.accent}
        />
        <Txt variant="caption" color={colors.ink} style={{ flex: 1 }}>
          {copy.tip}
        </Txt>
      </View>
    </Card>
  );
}

function PredictionsCard({ status }: { status: CycleStatus }) {
  const rows: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; color: string }[] = [
    {
      icon: 'water-outline',
      label: 'پریودِ بعدی',
      value: formatJalali(status.nextPeriodStart),
      color: PHASE_COLOR.menstrual,
    },
    {
      icon: 'leaf-outline',
      label: 'پنجرهٔ باروری',
      value: `${formatJalali(status.fertileStart)} تا ${formatJalali(status.fertileEnd)}`,
      color: PHASE_COLOR.follicular,
    },
    {
      icon: 'sparkles-outline',
      label: 'تخمک‌گذاری',
      value: formatJalali(status.ovulationDate),
      color: PHASE_COLOR.ovulation,
    },
  ];
  return (
    <Card style={{ marginTop: spacing.lg }} padded={false}>
      {rows.map((r, i) => (
        <View key={r.label} style={[styles.predRow, i > 0 && styles.rowBorder]}>
          <View style={[styles.predIcon, { backgroundColor: r.color + '22' }]}>
            <Ionicons name={r.icon} size={18} color={r.color} />
          </View>
          <Txt variant="subtitle" style={{ flex: 1 }}>
            {r.label}
          </Txt>
          <Txt variant="caption" color={colors.textMuted}>
            {r.value}
          </Txt>
        </View>
      ))}
    </Card>
  );
}

function UpcomingStrip({
  lastPeriodStartISO,
  cycleLength,
  periodLength,
}: {
  lastPeriodStartISO: string;
  cycleLength: number;
  periodLength: number;
}) {
  const today = new Date();
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i));
  return (
    <View style={{ marginTop: spacing.lg }}>
      <Txt variant="bodyBold" style={{ marginBottom: spacing.sm }}>
        دو هفتهٔ پیشِ‌رو
      </Txt>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stripRow}>
        {days.map((d, i) => {
          const { phase, fertile } = phaseOfDate(d, lastPeriodStartISO, cycleLength, periodLength);
          const color = PHASE_COLOR[phase];
          const isToday = i === 0;
          return (
            <View key={i} style={[styles.dayCell, isToday && styles.dayToday]}>
              <Txt variant="tiny" color={colors.textFaint}>
                {jalaliWeekday(d).slice(0, 3)}
              </Txt>
              <Txt variant="bodyBold" color={isToday ? colors.accent : colors.text}>
                {jalaliDayMonth(d).day}
              </Txt>
              <View style={[styles.dayDot, { backgroundColor: color }]} />
              {fertile && phase !== 'ovulation' ? (
                <View style={[styles.fertileRing]} />
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function Stepper({
  label,
  value,
  suffix,
  onMinus,
  onPlus,
}: {
  label: string;
  value: number;
  suffix: string;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <View style={styles.stepperRow}>
      <Txt variant="subtitle" style={{ flex: 1 }}>
        {label}
      </Txt>
      <View style={styles.stepper}>
        <Pressable onPress={onMinus} hitSlop={8} style={styles.stepBtn}>
          <Ionicons name="remove" size={18} color={colors.accent} />
        </Pressable>
        <Txt variant="bodyBold" style={{ minWidth: 64, textAlign: 'center' }} center>
          {toFa(value)} {suffix}
        </Txt>
        <Pressable onPress={onPlus} hitSlop={8} style={styles.stepBtn}>
          <Ionicons name="add" size={18} color={colors.accent} />
        </Pressable>
      </View>
    </View>
  );
}

function SettingsCard({
  data,
  onCycle,
  onPeriod,
  onReminders,
  onShare,
}: {
  data: CycleData;
  onCycle: (d: number) => void;
  onPeriod: (d: number) => void;
  onReminders: (v: boolean) => void;
  onShare: (v: boolean) => void;
}) {
  return (
    <Card style={{ marginTop: spacing.lg }}>
      <Txt variant="bodyBold" style={{ marginBottom: spacing.sm }}>
        تنظیمِ چرخه
      </Txt>
      <Stepper
        label="طول چرخه"
        value={data.cycleLength}
        suffix="روز"
        onMinus={() => onCycle(-1)}
        onPlus={() => onCycle(1)}
      />
      <View style={styles.rowBorder} />
      <Stepper
        label="طول پریود"
        value={data.periodLength}
        suffix="روز"
        onMinus={() => onPeriod(-1)}
        onPlus={() => onPeriod(1)}
      />
      <View style={[styles.rowBorder, { marginTop: spacing.md }]} />
      <View style={styles.switchRow}>
        <View style={{ flex: 1 }}>
          <Txt variant="subtitle">یادآوریِ پریود</Txt>
          <Txt variant="tiny" color={colors.textMuted}>
            دو روز قبل بهت خبر می‌دیم
          </Txt>
        </View>
        <Switch
          value={data.reminders}
          onValueChange={onReminders}
          trackColor={{ true: colors.accent, false: colors.border }}
          thumbColor={colors.surface}
        />
      </View>
      <View style={[styles.rowBorder, { marginTop: spacing.md }]} />
      <View style={styles.switchRow}>
        <View style={{ flex: 1 }}>
          <Txt variant="subtitle">اشتراک با همراه</Txt>
          <Txt variant="tiny" color={colors.textMuted}>
            نیمهٔ دیگرت چرخه‌ات را در «حالت همراه» می‌بیند تا کنارت باشد
          </Txt>
        </View>
        <Switch
          value={data.shareWithPartner}
          onValueChange={onShare}
          trackColor={{ true: colors.accent, false: colors.border }}
          thumbColor={colors.surface}
        />
      </View>
    </Card>
  );
}

function HistoryCard({ data, onDelete }: { data: CycleData; onDelete: (id: string) => void }) {
  return (
    <Card style={{ marginTop: spacing.lg }} padded={false}>
      <View style={{ padding: spacing.lg, paddingBottom: spacing.sm }}>
        <Txt variant="bodyBold">پریودهای ثبت‌شده</Txt>
      </View>
      {data.periods.slice(0, 6).map((p, i) => (
        <View key={p.id} style={[styles.histRow, i > 0 && styles.rowBorder]}>
          <Ionicons name="ellipse" size={10} color={PHASE_COLOR.menstrual} />
          <Txt variant="subtitle" style={{ flex: 1 }}>
            {formatJalali(new Date(p.startISO))}
          </Txt>
          <Pressable onPress={() => onDelete(p.id)} hitSlop={8}>
            <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
          </Pressable>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  banner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  heroIconWrap: { alignItems: 'center', marginBottom: spacing.md },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segment: {
    flexDirection: 'row-reverse',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    padding: 4,
    marginTop: spacing.lg,
    gap: 4,
  },
  segmentItem: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  segmentActive: { backgroundColor: colors.accent },
  ringWrap: { alignItems: 'center', marginTop: spacing.xl },
  ring: {
    width: 188,
    height: 188,
    borderRadius: 94,
    borderWidth: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringNumber: { fontSize: 56, lineHeight: 70, fontFamily: 'Vazirmatn_900Black' },
  phaseHead: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm },
  phaseDot: { width: 12, height: 12, borderRadius: 6 },
  tip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  predRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  predIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  stripRow: { gap: spacing.sm, paddingVertical: spacing.xs },
  dayCell: {
    width: 52,
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
  },
  dayToday: { borderColor: colors.accent, borderWidth: 1.5, backgroundColor: colors.accentTint },
  dayDot: { width: 8, height: 8, borderRadius: 4, marginTop: 2 },
  fertileRing: {
    position: 'absolute',
    bottom: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: PHASE_COLOR.follicular,
  },
  stepperRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  stepper: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  histRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
