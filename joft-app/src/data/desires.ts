/**
 * کارت‌های «خواسته‌ها» برای بازیِ تطبیق دونفره.
 *
 * فلسفه: هر کارت یک «ایده» است که هر دو نفر به‌طور خصوصی به آن بله/شاید/نه می‌گویند.
 * فقط ایده‌هایی که «هر دو» بله یا شاید گفته‌اند به‌عنوان «تطبیق» نمایش داده می‌شوند.
 * نه‌گفتن یک نفر، پاسخ او را برای طرف مقابل پنهان می‌کند تا کسی تحت فشار نباشد.
 *
 * دو سطحِ محتوا داریم:
 *  - 'soft'  : محترمانه، عاشقانه، بدون صراحتِ جنسی — پیش‌فرض همه.
 *  - 'spicy' : صریح‌تر اما باسلیقه و محترمانه — نیازمندِ روشن‌کردنِ حالتِ ۱۸+.
 *
 * این محتوا برای زوج‌های متأهل/متعهد طراحی شده و از کلماتِ خام و گرافیک پرهیز می‌کند.
 */

export type DesireLevel = 'soft' | 'spicy';
export type DesireCategoryId =
  | 'connection'   // نزدیکیِ عاطفی
  | 'daily'        // ریزه‌کاری‌های روزمره
  | 'adventure'    // ماجراجویی و تفریح
  | 'touch'        // لمس و نزدیکی غیرجنسی
  | 'intimacy';    // صمیمتِ زناشویی (فقط spicy)

export type DesireCategory = {
  id: DesireCategoryId;
  title: string;
  emoji: string;
  description: string;
};

export const DESIRE_CATEGORIES: DesireCategory[] = [
  { id: 'connection', title: 'نزدیکیِ عاطفی', emoji: '💞', description: 'لحظه‌هایی که حس می‌کنی واقعاً دیده می‌شی' },
  { id: 'daily', title: 'ریزه‌کاری‌های روزمره', emoji: '☕', description: 'عادت‌های کوچک که رابطه را گرم نگه می‌دارد' },
  { id: 'adventure', title: 'ماجراجویی و تفریح', emoji: '🎒', description: 'تجربه‌های تازه که با هم می‌سازید' },
  { id: 'touch', title: 'لمس و نزدیکی', emoji: '🤍', description: 'محبتِ بدنی و آرامش‌بخشِ غیرجنسی' },
  { id: 'intimacy', title: 'صمیمتِ زناشویی', emoji: '🌹', description: 'ایده‌های دونفرهٔ خصوصی برای زوج‌ها' },
];

export type DesireCard = {
  id: string;
  title: string;
  hint?: string;
  category: DesireCategoryId;
  level: DesireLevel;
};

/**
 * کارت‌های «محترمانه» — همه برای زوج‌های متعهد، بدون صراحتِ جنسی.
 * این مجموعه قلبِ بازی است و بدون نیاز به تأیید سن نمایش داده می‌شود.
 */
const SOFT_CARDS: Omit<DesireCard, 'level'>[] = [
  // نزدیکی عاطفی
  { id: 's-c1', category: 'connection', title: 'هر شب قبل خواب، سه دقیقه فقط حرف بزنیم — بدون موبایل.' },
  { id: 's-c2', category: 'connection', title: 'یک شب «گفت‌وگوی عمیق» — هر کدوم یک سؤال جدی بپرسیم.' },
  { id: 's-c3', category: 'connection', title: 'هفته‌ای یک‌بار، یه چیزی که قدردانش هستم بهش بگم.' },
  { id: 's-c4', category: 'connection', title: 'وقتی ناراحته، فقط گوش بدم — بدون راه‌حل دادن.', hint: 'گاهی فقط شنیده شدن کافیه' },
  { id: 's-c5', category: 'connection', title: 'یه شب فقط دربارهٔ آرزوهامون حرف بزنیم.' },
  { id: 's-c6', category: 'connection', title: 'هر صبح یه پیامِ کوتاهِ عاشقانه بفرستم.' },
  { id: 's-c7', category: 'connection', title: 'یه نامهٔ دست‌نویس به هم بنویسیم.', hint: 'بعد از یک هفته با هم بخونیم' },

  // روزمره
  { id: 's-d1', category: 'daily', title: 'یک صبحانهٔ بی‌عجله با هم — بدون گوشی.' },
  { id: 's-d2', category: 'daily', title: 'با هم آشپزی کنیم؛ یه غذای جدید.' },
  { id: 's-d3', category: 'daily', title: 'یه پیادروی شبانه بعد از شام.' },
  { id: 's-d4', category: 'daily', title: 'با هم چای دم کنیم و کنار هم بنوشیم.' },
  { id: 's-d5', category: 'daily', title: 'پیغامِ صوتیِ کوتاه به‌جای تایپ بفرستم.' },
  { id: 's-d6', category: 'daily', title: 'صبح‌ها همدیگه رو با اسم صدا بزنیم؛ نه «هی!»' },
  { id: 's-d7', category: 'daily', title: 'هر شب جواب «بهترین لحظهٔ امروزت چی بود؟» رو بپرسیم.' },

  // ماجراجویی
  { id: 's-a1', category: 'adventure', title: 'یه قرارِ سورپرایز بریزم — جای جدید.' },
  { id: 's-a2', category: 'adventure', title: 'یه فیلم/سریال جدید با هم شروع کنیم.' },
  { id: 's-a3', category: 'adventure', title: 'یه سفرِ یک‌روزه به یه جای نزدیک.' },
  { id: 's-a4', category: 'adventure', title: 'با هم یه چیز جدید یاد بگیریم.', hint: 'آشپزی، ساز، زبان…' },
  { id: 's-a5', category: 'adventure', title: 'یه شب رو با کمپ و ستاره دیدن بگذرونیم.' },
  { id: 's-a6', category: 'adventure', title: 'تا قبلِ آخر سال، با هم یه کارِ تازه تجربه کنیم.' },

  // لمس و نزدیکی
  { id: 's-t1', category: 'touch', title: 'ده دقیقه ماساژِ شانه/گردن بدم.' },
  { id: 's-t2', category: 'touch', title: 'وقتی فیلم می‌بینیم، دست همدیگه رو بگیریم.' },
  { id: 's-t3', category: 'touch', title: 'یه بغلِ طولانیِ بدون هیچ کلام.', hint: 'حداقل ۲۰ ثانیه' },
  { id: 's-t4', category: 'touch', title: 'سرش رو روی پاهام بگیرم و موهاش رو نوازش کنم.' },
  { id: 's-t5', category: 'touch', title: 'هر روز یه بوسهٔ صبح و یه بوسهٔ شب.' },
  { id: 's-t6', category: 'touch', title: 'دست‌هاش رو با کِرِم گرم ماساژ بدم.' },
  { id: 's-t7', category: 'touch', title: 'وقتی خوابش می‌بره، آروم پیشونی‌اش رو ببوسم.' },
];

/**
 * کارت‌های صریح‌تر — فقط برای زوج‌های متعهد، باسلیقه و محترمانه.
 * این‌ها فقط با روشن‌کردنِ حالتِ ۱۸+ و تأیید کاربر نمایش داده می‌شوند.
 */
const SPICY_CARDS: Omit<DesireCard, 'level'>[] = [
  { id: 'p-i1', category: 'intimacy', title: 'یه شبِ رمانتیک با شمع و موزیک ترتیب بدیم.' },
  { id: 'p-i2', category: 'intimacy', title: 'با هم یه دوش/حمامِ آروم بگیریم.' },
  { id: 'p-i3', category: 'intimacy', title: 'ماساژِ کاملِ بدن با روغنِ معطر.' },
  { id: 'p-i4', category: 'intimacy', title: 'یه شب فقط روی همدیگه تمرکز کنیم — بدون عجله.' },
  { id: 'p-i5', category: 'intimacy', title: 'پیامِ عاشقانهٔ گرم وسطِ روز برام بفرستی.' },
  { id: 'p-i6', category: 'intimacy', title: 'با هم یه لباسِ تازه برای شب انتخاب کنیم.' },
  { id: 'p-i7', category: 'intimacy', title: 'یه «قرارِ سرّی» ترتیب بدیم؛ مثل قبل از ازدواج.' },
  { id: 'p-i8', category: 'intimacy', title: 'برام بنویس چه چیزی تو رو جذبِ من می‌کنه.' },
  { id: 'p-i9', category: 'intimacy', title: 'یه آخر هفته رو جایی بریم که فقط با هم باشیم.' },
  { id: 'p-i10', category: 'intimacy', title: 'با هم یه پلی‌لیستِ «شب‌های ما» بسازیم.' },
  { id: 'p-i11', category: 'intimacy', title: 'یه شب «بدونِ ساعت» — تا هر وقت دلمون خواست بیدار بمونیم.' },
  { id: 'p-i12', category: 'intimacy', title: 'صبح زود از خواب با یه ناز و نوازشِ آروم بیدارم کنی.' },
  { id: 'p-i13', category: 'intimacy', title: 'با هم یه «شب‌نشینیِ خصوصی» تو خونه ترتیب بدیم.' },
  { id: 'p-i14', category: 'intimacy', title: 'برام تعریف کنی چه چیزی از من خاطره‌انگیزه برات.' },
  { id: 'p-i15', category: 'intimacy', title: 'یه شب فقط ما؛ بچه‌ها/کارها رو فراموش کنیم.' },
];

export const DESIRE_CARDS: DesireCard[] = [
  ...SOFT_CARDS.map((c) => ({ ...c, level: 'soft' as DesireLevel })),
  ...SPICY_CARDS.map((c) => ({ ...c, level: 'spicy' as DesireLevel })),
];

/** کارت‌های قابلِ نمایش بر اساس سطحِ محتوای انتخاب‌شده. */
export function visibleCards(level: 'soft' | 'all'): DesireCard[] {
  if (level === 'all') return DESIRE_CARDS;
  return DESIRE_CARDS.filter((c) => c.level === 'soft');
}

export function getCard(id: string): DesireCard | undefined {
  return DESIRE_CARDS.find((c) => c.id === id);
}

export function categoryOf(id: DesireCategoryId): DesireCategory {
  return DESIRE_CATEGORIES.find((c) => c.id === id) ?? DESIRE_CATEGORIES[0];
}
