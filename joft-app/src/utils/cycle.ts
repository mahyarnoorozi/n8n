import type { Perspective } from '@/storage/cycle';

/**
 * محاسباتِ چرخهٔ قاعدگی — بدون کتابخانهٔ خارجی.
 *
 * فلسفه: پیش‌بینی‌ها «تخمینی» هستند و با لحنی محترمانه و آرام نمایش داده می‌شوند،
 * نه قطعی و پزشکی. فازِ لوتئال را ثابت ۱۴ روز در نظر می‌گیریم (استانداردِ رایج) و
 * تخمک‌گذاری را روزِ (طول چرخه − ۱۴) می‌گذاریم.
 */

export type PhaseKey = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

const DAY = 86400000;

/** نیمه‌شبِ همان روز (برای حذف اثر ساعت). */
function midnight(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d: Date, n: number): Date {
  const x = midnight(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** تفاضلِ تقویمیِ دو تاریخ به روز (b − a). */
export function daysBetween(a: Date, b: Date): number {
  return Math.round((midnight(b).getTime() - midnight(a).getTime()) / DAY);
}

export type CycleStatus = {
  dayInCycle: number; // روزِ چندمِ چرخه (از ۱)
  cycleLength: number;
  periodLength: number;
  phase: PhaseKey;
  fertile: boolean;
  ovulationDay: number; // روزِ تخمک‌گذاری در چرخه
  nextPeriodStart: Date;
  daysUntilNextPeriod: number;
  fertileStart: Date;
  fertileEnd: Date;
  ovulationDate: Date;
  isOnPeriod: boolean;
};

/** نزدیک‌ترین شروعِ پریودِ پیشِ‌رو بر اساس آخرین پریود و طولِ چرخه. */
function predictNextStart(lastStart: Date, cycleLength: number, from: Date): Date {
  let next = midnight(lastStart);
  // اگر آخرین پریود در آینده بود (نباید پیش بیاید) همان را برگردان
  while (daysBetween(next, from) >= cycleLength) next = addDays(next, cycleLength);
  // next حالا «شروعِ چرخهٔ جاری» است؛ شروعِ بعدی یک چرخه جلوتر
  return addDays(next, cycleLength);
}

function ovulationDayOf(cycleLength: number, periodLength: number): number {
  return Math.max(periodLength + 1, cycleLength - 14);
}

export function phaseFor(
  day: number,
  periodLength: number,
  cycleLength: number,
): { phase: PhaseKey; fertile: boolean; ovulationDay: number } {
  const ov = ovulationDayOf(cycleLength, periodLength);
  const fertileStart = ov - 5;
  const fertileEnd = ov + 1;
  const fertile = day >= fertileStart && day <= fertileEnd;
  let phase: PhaseKey;
  if (day <= periodLength) phase = 'menstrual';
  else if (day >= ov - 1 && day <= ov + 1) phase = 'ovulation';
  else if (day < ov) phase = 'follicular';
  else phase = 'luteal';
  return { phase, fertile, ovulationDay: ov };
}

/** وضعیتِ کاملِ چرخه در «امروز» را برمی‌گرداند. */
export function computeStatus(
  lastStartISO: string,
  cycleLength: number,
  periodLength: number,
  today = new Date(),
): CycleStatus {
  const lastStart = midnight(new Date(lastStartISO));
  const t = midnight(today);
  const nextPeriodStart = predictNextStart(lastStart, cycleLength, t);
  const currentCycleStart = addDays(nextPeriodStart, -cycleLength);
  const dayInCycle = daysBetween(currentCycleStart, t) + 1;
  const { phase, fertile, ovulationDay } = phaseFor(dayInCycle, periodLength, cycleLength);

  return {
    dayInCycle,
    cycleLength,
    periodLength,
    phase,
    fertile,
    ovulationDay,
    nextPeriodStart,
    daysUntilNextPeriod: daysBetween(t, nextPeriodStart),
    fertileStart: addDays(currentCycleStart, ovulationDay - 5 - 1),
    fertileEnd: addDays(currentCycleStart, ovulationDay + 1 - 1),
    ovulationDate: addDays(currentCycleStart, ovulationDay - 1),
    isOnPeriod: phase === 'menstrual',
  };
}

/** فازِ یک روزِ دلخواه نسبت به شروعِ چرخه (برای رنگ‌آمیزیِ نوارِ تقویم). */
export function phaseOfDate(
  date: Date,
  lastStartISO: string,
  cycleLength: number,
  periodLength: number,
): { phase: PhaseKey; fertile: boolean } {
  const status = computeStatus(lastStartISO, cycleLength, periodLength, date);
  return { phase: status.phase, fertile: status.fertile };
}

// ——— محتوا: نام و توضیحِ هر فاز، یک‌بار برای «خودم» و یک‌بار برای «همراه» ———

export const PHASE_META: Record<
  PhaseKey,
  { title: string; emoji: string; color: 'menstrual' | 'fertile' | 'ovulation' | 'luteal' }
> = {
  menstrual: { title: 'روزهای پریود', emoji: '🌹', color: 'menstrual' },
  follicular: { title: 'فاز فولیکولار', emoji: '🌱', color: 'fertile' },
  ovulation: { title: 'تخمک‌گذاری', emoji: '✨', color: 'ovulation' },
  luteal: { title: 'پیش از پریود', emoji: '🌙', color: 'luteal' },
};

type PhaseCopy = { body: string; tip: string };

const SELF_COPY: Record<PhaseKey, PhaseCopy> = {
  menstrual: {
    body: 'این روزها ممکنه خسته، کم‌حوصله یا با گرفتگیِ شکم همراه باشی. به خودت سخت نگیر؛ استراحت و گرما کمک می‌کنه.',
    tip: 'نوشیدنیِ گرم، کیسهٔ آب‌گرم و کمی مراقبت از خودت حالت رو بهتر می‌کنه.',
  },
  follicular: {
    body: 'انرژی‌ات کم‌کم بالا می‌آد و روحیه‌ات بهتر می‌شه. روزهای خوبی برای شروعِ کارهای تازه‌ست.',
    tip: 'وقت خوبیه برای برنامهٔ یک قرارِ دونفره یا کاری که دوست داری.',
  },
  ovulation: {
    body: 'اوجِ انرژی و سرزندگی؛ بیشترین احتمالِ باروری هم در این روزهاست.',
    tip: 'اگر قصدِ بارداری نداری، این روزها مراقبت رو جدی بگیر.',
  },
  luteal: {
    body: 'ممکنه نوسانِ خلق، حساسیت یا هوسِ خوراکی داشته باشی (نشانه‌های پیش از قاعدگی). کاملاً طبیعیه.',
    tip: 'با خودت مهربون باش؛ خواب کافی و چیزهای آرام‌بخش این روزها می‌چسبه.',
  },
};

const PARTNER_COPY: Record<PhaseKey, PhaseCopy> = {
  menstrual: {
    body: 'این روزها ممکنه خسته یا با درد همراه باشه. حضورِ آرومت بیشتر از هر چیزی آرومش می‌کنه.',
    tip: 'یه نوشیدنیِ گرم بیار، کیسهٔ آب‌گرم آماده کن و فشار نیار؛ فقط کنارش باش. 💛',
  },
  follicular: {
    body: 'روحیه‌اش بهتره و انرژی‌اش بالاتر. روزهای خوبی برای با هم بودنه.',
    tip: 'یه برنامهٔ دونفرهٔ کوچیک یا یه کارِ مشترک این روزها حسابی می‌چسبه.',
  },
  ovulation: {
    body: 'این روزها پرانرژی و سرحاله؛ از نظر علمی هم بیشترین احتمالِ باروری همین روزهاست.',
    tip: 'نزدیکی و صمیمیت طبیعیه؛ اگر قصدِ بارداری ندارید، مراقبت رو با هم جدی بگیرید.',
  },
  luteal: {
    body: 'ممکنه کمی حساس‌تر یا کم‌حوصله‌تر باشه (روزهای پیش از پریود). به دلش ربطی نداره، به چرخه‌ست.',
    tip: 'صبوری و یه توجهِ کوچیک این روزها دنیایی ارزش داره. 💛',
  },
};

export function phaseCopy(phase: PhaseKey, perspective: Perspective): PhaseCopy {
  return (perspective === 'partner' ? PARTNER_COPY : SELF_COPY)[phase];
}
