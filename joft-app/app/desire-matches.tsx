import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Card, Screen, Tag, Txt } from '@/components';
import { api } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import { categoryOf, DESIRE_CARDS, type DesireCard } from '@/data/desires';
import {
  getDesireState,
  saveDesireState,
  setCachedMatches,
  userYesSwipes,
  type DesireState,
} from '@/storage/desires';
import { colors, radius, spacing } from '@/theme';
import { toFa } from '@/utils/persian';

/**
 * صفحهٔ «تطابق‌ها» — کارت‌هایی که هر دو نفر «بله یا شاید» گفته‌اند.
 *
 * در حالتی که نیمهٔ دیگر هنوز وصل/پاسخ‌گو نیست، کاربر یا به دعوتِ پارتنر هدایت
 * می‌شود، یا فقط لیستِ خودش (پاسخ‌های بله/شاید) را به‌عنوان «پیش‌نمایش» می‌بیند.
 */
export default function DesireMatches() {
  const router = useRouter();
  const { user } = useAuth();
  const [state, setState] = useState<DesireState | null>(null);
  const [serverMatches, setServerMatches] = useState<string[] | null>(null);
  const [partnerSwipedCount, setPartnerSwipedCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const s = await getDesireState();
        if (cancelled) return;
        setState(s);
        const remote = await api.getDesireMatches();
        if (cancelled) return;
        if (remote) {
          setServerMatches(remote.matches);
          setPartnerSwipedCount(remote.partnerSwipedCount);
          await saveDesireState(setCachedMatches(s, remote.matches));
        } else {
          // در حالت دمو، تطابق سرور نداریم؛ از cache استفاده می‌کنیم
          setServerMatches(s.cachedMatches);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  if (!state) {
    return (
      <Screen>
        <Topbar onBack={() => router.back()} />
      </Screen>
    );
  }

  const myYes = userYesSwipes(state);
  const hasPartner = partnerSwipedCount > 0 || (serverMatches?.length ?? 0) > 0;
  const matches: DesireCard[] = (serverMatches ?? [])
    .map((id) => DESIRE_CARDS.find((c) => c.id === id))
    .filter((c): c is DesireCard => Boolean(c));

  // اگر هنوز هیچی swipe نکرده
  if (myYes.length === 0) {
    return (
      <Screen>
        <Topbar onBack={() => router.back()} />
        <EmptyHero
          icon="sparkles-outline"
          title="هنوز به ایده‌ها پاسخ ندادی"
          body="اول چند کارت رو بله/شاید/نه بزن تا اینجا تطابق‌هات با نیمهٔ دیگرت ببینی."
          actionLabel="شروع بازی"
          onAction={() => router.replace('/desire-match')}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Topbar onBack={() => router.back()} />

      <Txt variant="title">تطابق‌های شما 💞</Txt>
      <Txt variant="body" color={colors.textMuted} style={{ marginTop: spacing.xs }}>
        ایده‌هایی که هر دو نفرتون «بله یا شاید» گفتید.
      </Txt>

      {/* اگر پارتنر هنوز وصل نیست یا پاسخی نداده */}
      {!hasPartner ? (
        <Card style={styles.invite}>
          <View style={styles.inviteHead}>
            <View style={styles.inviteIcon}>
              <Ionicons name="link" size={22} color={colors.accent} />
            </View>
            <Txt variant="bodyBold" style={{ flex: 1 }}>
              نیمهٔ دیگرت رو دعوت کن
            </Txt>
          </View>
          <Txt variant="caption" color={colors.textMuted} style={{ marginTop: spacing.sm }}>
            تطابق وقتی شکل می‌گیره که {user?.partnerName ?? 'نیمهٔ دیگرت'} هم به همین کارت‌ها پاسخ بده. کد دعوت رو براش بفرست.
          </Txt>
          <Button
            label="ساختن کد دعوت"
            icon="paper-plane"
            onPress={() => router.push('/connect')}
            style={{ marginTop: spacing.md }}
          />
          <Txt variant="tiny" center color={colors.textFaint} style={{ marginTop: spacing.md }}>
            تا اون موقع، پایین لیستِ ایده‌هایی که خودت بله گفتی رو می‌بینی.
          </Txt>
        </Card>
      ) : (
        <View style={styles.statRow}>
          <Stat label="پاسخ‌های تو" value={toFa(myYes.length)} />
          <Stat label="پاسخ‌های پارتنر" value={toFa(partnerSwipedCount)} />
          <Stat label="تطابق" value={toFa(matches.length)} accent />
        </View>
      )}

      {/* تطابق‌ها (یا پیش‌نمایش از پاسخ‌های خودت) */}
      {hasPartner && matches.length === 0 ? (
        <Card style={{ marginTop: spacing.xl }}>
          <Txt variant="bodyBold" center>
            هنوز تطابقی پیدا نشده
          </Txt>
          <Txt variant="caption" center color={colors.textMuted} style={{ marginTop: spacing.sm }}>
            هر دو نفر باید روی یه کارت «بله یا شاید» بزنید تا تطابق شکل بگیره.
          </Txt>
        </Card>
      ) : null}

      {hasPartner ? <MatchList items={matches} hero /> : <MatchList items={fromIds(myYes)} preview />}
    </Screen>
  );
}

function fromIds(ids: string[]): DesireCard[] {
  return ids.map((id) => DESIRE_CARDS.find((c) => c.id === id)).filter((c): c is DesireCard => Boolean(c));
}

function Topbar({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.topbar}>
      <Pressable onPress={onBack} hitSlop={12}>
        <Ionicons name="chevron-forward" size={26} color={colors.text} />
      </Pressable>
      <Txt variant="heading">تطابق‌ها</Txt>
      <View style={{ width: 26 }} />
    </View>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={[styles.stat, accent && styles.statAccent]}>
      <Txt variant="display" color={accent ? colors.textInverse : colors.accent} center>
        {value}
      </Txt>
      <Txt variant="tiny" center color={accent ? colors.accentTint : colors.textMuted}>
        {label}
      </Txt>
    </View>
  );
}

function MatchList({
  items,
  hero,
  preview,
}: {
  items: DesireCard[];
  hero?: boolean;
  preview?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
      {preview ? (
        <Txt variant="caption" color={colors.textMuted}>
          پاسخ‌های تو (پیش‌نمایش — تا پارتنر وصل بشه و جواب بده)
        </Txt>
      ) : null}
      {items.map((c) => {
        const cat = categoryOf(c.category);
        return (
          <Card key={c.id} style={hero ? styles.heroCard : undefined}>
            <View style={styles.matchHead}>
              <Tag label={`${cat.emoji} ${cat.title}`} />
              {hero ? (
                <View style={styles.heart}>
                  <Ionicons name="heart" size={14} color={colors.textInverse} />
                </View>
              ) : null}
            </View>
            <Txt variant="subtitle" style={{ marginTop: spacing.sm }}>
              {c.title}
            </Txt>
            {c.hint ? (
              <Txt variant="caption" color={colors.textMuted} style={{ marginTop: spacing.xs }}>
                {c.hint}
              </Txt>
            ) : null}
          </Card>
        );
      })}
    </View>
  );
}

function EmptyHero({
  icon,
  title,
  body,
  actionLabel,
  onAction,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <View style={styles.emptyHero}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={36} color={colors.accent} />
      </View>
      <Txt variant="heading" center style={{ marginTop: spacing.md }}>
        {title}
      </Txt>
      <Txt variant="body" center color={colors.textMuted} style={{ marginTop: spacing.sm }}>
        {body}
      </Txt>
      <Button label={actionLabel} icon="arrow-back" onPress={onAction} style={{ marginTop: spacing.xl }} />
    </View>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  invite: { marginTop: spacing.xl, backgroundColor: colors.accentTint, borderColor: colors.accentSoft },
  inviteHead: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md },
  inviteIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statRow: { flexDirection: 'row-reverse', gap: spacing.md, marginTop: spacing.xl },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  statAccent: { backgroundColor: colors.accent, borderColor: colors.accent },
  matchHead: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  heroCard: { borderColor: colors.accentSoft, backgroundColor: colors.accentTint },
  heart: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHero: { alignItems: 'center', paddingTop: spacing.xxl },
  emptyIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
