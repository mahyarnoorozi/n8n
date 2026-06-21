export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

// سایه‌های بسیار ملایم؛ جداکنندهٔ اصلیِ کارت‌ها «خط مویی» است نه سایهٔ سنگین.
export const shadow = {
  card: {
    shadowColor: '#1B1A29',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
  },
  soft: {
    shadowColor: '#1B1A29',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
} as const;
