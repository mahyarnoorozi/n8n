/** رشته‌های مشترک رابط کاربری به فارسی (راست‌به‌چپ) */
export const fa = {
  appName: 'جفت',
  tagline: 'زوج‌ها و روابط',

  // عمومی
  continue: 'ادامه',
  confirm: 'تأیید',
  skip: 'رد کردن',
  next: 'بعدی',
  back: 'بازگشت',
  done: 'تمام',
  save: 'ذخیره',
  cancel: 'انصراف',

  // آنبوردینگ
  onboarding: [
    {
      title: 'هر روز کمی نزدیک‌تر',
      desc: 'با سؤال‌های روزانه و گفت‌وگوهای معنادار، رابطه‌تان را گرم‌تر کنید.',
      icon: 'heart',
    },
    {
      title: 'بازی و کوییز دونفره',
      desc: 'با بازی‌های بامزه ببینید چقدر همدیگر را می‌شناسید و بیشتر بخندید.',
      icon: 'game-controller',
    },
    {
      title: 'خاطره‌ها و مناسبت‌ها',
      desc: 'سالگردها، تولدها و خاطره‌های خاص‌تان را یک‌جا نگه دارید.',
      icon: 'calendar',
    },
  ],
  getStarted: 'بزن بریم',
  haveAccount: 'قبلاً حساب ساخته‌ام',

  // ورود با شماره
  phoneTitle: 'ورود یا ثبت‌نام',
  phoneSubtitle: 'شمارهٔ موبایلت را وارد کن تا کد تأیید برایت بفرستیم.',
  phoneLabel: 'شمارهٔ موبایل',
  phonePlaceholder: '۰۹۱۲ ۳۴۵ ۶۷۸۹',
  phoneInvalid: 'شمارهٔ موبایل معتبر نیست.',
  sendCode: 'دریافت کد تأیید',
  terms: 'با ادامه، قوانین و حریم خصوصی «جفت» را می‌پذیری.',

  // کد تأیید
  verifyTitle: 'کد تأیید را وارد کن',
  verifySubtitle: 'کد چهاررقمی پیامک‌شده به شمارهٔ زیر را وارد کن:',
  resendIn: 'ارسال دوباره تا',
  resend: 'ارسال دوبارهٔ کد',
  seconds: 'ثانیه',
  verifyButton: 'تأیید و ورود',
  wrongCode: 'کد واردشده درست نیست.',
  demoHint: 'کد نمایشی: ۱۲۳۴',

  // پروفایل
  profileTitle: 'خوش اومدی! 👋',
  profileSubtitle: 'بیا پروفایلت را کامل کنیم.',
  nameLabel: 'اسم تو',
  namePlaceholder: 'مثلاً سارا',
  partnerLabel: 'اسم نیمهٔ دیگرت',
  partnerPlaceholder: 'مثلاً علی',
  anniversaryLabel: 'تاریخ شروع رابطه (اختیاری)',
  finish: 'بزن بریم به خانه',

  // تب‌ها
  tabHome: 'خانه',
  tabQuestions: 'سؤال روز',
  tabGames: 'بازی‌ها',
  tabMemories: 'خاطره‌ها',
  tabMore: 'بیشتر',

  // خانه
  togetherFor: 'با همیم به مدت',
  days: 'روز',
  specialDates: 'مناسبت‌های خاص',
  questionOfDay: 'سؤال امروز',
  answerNow: 'همین حالا جواب بده',
  exploreCats: 'بر اساس موضوع کاوش کن',
  seeAll: 'دیدن همه',

  // سؤال‌ها
  yourAnswer: 'پاسخ تو',
  partnerAnswer: 'پاسخ نیمهٔ دیگرت',
  partnerLocked: 'وقتی تو جواب بدهی، پاسخ او هم باز می‌شود.',
  writeAnswer: 'پاسخت را بنویس...',
  submitAnswer: 'ثبت پاسخ',
  answered: 'ثبت شد! ✅',

  // خاطره‌ها
  memoriesTitle: 'خاطره‌های ما',
  addMemory: 'افزودن خاطره',
  memoryPlaceholder: 'یک خاطرهٔ قشنگ بنویس...',

  // بیشتر / پروفایل
  account: 'حساب کاربری',
  partner: 'نیمهٔ دیگر',
  notifications: 'اعلان‌ها',
  language: 'زبان',
  privacy: 'حریم خصوصی',
  support: 'پشتیبانی',
  about: 'درباره',
  logout: 'خروج از حساب',
  premium: 'نسخهٔ ویژه',
  premiumDesc: 'دسترسی کامل به همهٔ سؤال‌ها، بازی‌ها و مقاله‌ها',
  upgrade: 'ارتقا به ویژه',
} as const;
