import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toEn } from '@/utils/persian';

/**
 * مدیریت احراز هویت با شمارهٔ موبایل.
 *
 * توجه: ارسال واقعی پیامک نیاز به یک سرویس پیامکی دارد (برای ایران مثلاً
 * کاوه‌نگار، قاصدک، ملی‌پیامک یا Firebase Phone Auth). این لایه فعلاً به‌صورت
 * نمایشی (mock) کار می‌کند و کد ثابت «۱۲۳۴» را می‌پذیرد تا کل جریان قابل تست باشد.
 * فقط کافی است متدهای sendCode و verifyCode را به API واقعی وصل کنی.
 */

const DEMO_CODE = '1234';
const STORAGE_KEY = '@joft/user';

export type User = {
  phone: string;
  name?: string;
  partnerName?: string;
  anniversary?: string; // ISO date
};

type AuthState = {
  user: User | null;
  isLoading: boolean;
  pendingPhone: string | null;
  sendCode: (phone: string) => Promise<void>;
  verifyCode: (code: string) => Promise<boolean>;
  completeProfile: (data: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setUser(JSON.parse(raw));
      } catch {
        // اگر چیزی ذخیره نشده بود، کاربر مهمان می‌ماند
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function persist(next: User | null) {
    setUser(next);
    if (next) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else await AsyncStorage.removeItem(STORAGE_KEY);
  }

  async function sendCode(phone: string) {
    // اینجا درخواست ارسال پیامک به سرویس واقعی زده می‌شود
    setPendingPhone(toEn(phone).replace(/\D/g, ''));
    await new Promise((r) => setTimeout(r, 600)); // شبیه‌سازی تأخیر شبکه
  }

  async function verifyCode(code: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 400));
    if (toEn(code).replace(/\D/g, '') !== DEMO_CODE) return false;
    // پروفایل ناقص ساخته می‌شود تا کاربر به مرحلهٔ تکمیل اطلاعات برود
    if (!user) await persist({ phone: pendingPhone ?? '' });
    return true;
  }

  async function completeProfile(data: Partial<User>) {
    const next: User = { phone: pendingPhone ?? user?.phone ?? '', ...user, ...data };
    await persist(next);
  }

  async function logout() {
    setPendingPhone(null);
    await persist(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, pendingPhone, sendCode, verifyCode, completeProfile, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth باید درون AuthProvider استفاده شود');
  return ctx;
}
