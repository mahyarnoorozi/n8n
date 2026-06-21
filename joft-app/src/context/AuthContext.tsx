import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { requestOtp, verifyOtp } from '@/api/auth';
import { toEn } from '@/utils/persian';

/**
 * مدیریت احراز هویت با شمارهٔ موبایل.
 *
 * این لایه به بک‌اند پروژه (پوشهٔ server/) وصل می‌شود که خودش پیامک را از طریق
 * «کاوه‌نگار» می‌فرستد و کلید API را امن نگه می‌دارد. اگر آدرس سرور تنظیم نشده
 * باشد (EXPO_PUBLIC_API_URL خالی)، اپ در حالت دمو با کد ۱۲۳۴ کار می‌کند.
 */

const STORAGE_KEY = '@joft/user';

export type User = {
  phone: string;
  name?: string;
  partnerName?: string;
  anniversary?: string; // ISO date
  token?: string;
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
  const [pendingToken, setPendingToken] = useState<string | undefined>(undefined);
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

  /** ارسال کد؛ در صورت خطا (مثل محدودیت نرخ) پیام فارسی throw می‌شود. */
  async function sendCode(phone: string) {
    const normalized = toEn(phone).replace(/\D/g, '');
    setPendingPhone(normalized);
    await requestOtp(normalized); // در صورت خطا، پیام را به صفحه می‌رساند
  }

  async function verifyCode(code: string): Promise<boolean> {
    const c = toEn(code).replace(/\D/g, '');
    const phone = pendingPhone ?? user?.phone ?? '';
    const result = await verifyOtp(phone, c);
    if (!result.ok) return false;
    setPendingToken(result.token);
    // پروفایل ناقص ساخته می‌شود تا کاربر به مرحلهٔ تکمیل اطلاعات برود
    if (!user) await persist({ phone, token: result.token });
    return true;
  }

  async function completeProfile(data: Partial<User>) {
    const next: User = {
      phone: pendingPhone ?? user?.phone ?? '',
      token: pendingToken ?? user?.token,
      ...user,
      ...data,
    };
    await persist(next);
  }

  async function logout() {
    setPendingPhone(null);
    setPendingToken(undefined);
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
