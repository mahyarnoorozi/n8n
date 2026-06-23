import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { Txt } from './Txt';

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  scroll?: boolean;
};

/**
 * شیتِ پایینیِ یکدست برای کلِ اپ (مثلِ الگوی «ثَنات» دیوار): دستگیرهٔ بالا،
 * گوشه‌های گرد، پس‌زمینهٔ تار، و رفتارِ یکسانِ بستن. تا همهٔ کنش‌ها یک حس داشته باشند.
 */
export function BottomSheet({ visible, onClose, title, children, scroll = true }: Props) {
  const Body = scroll ? ScrollView : View;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          {title ? (
            <Txt variant="heading" center style={{ marginBottom: spacing.lg }}>
              {title}
            </Txt>
          ) : null}
          <Body
            {...(scroll
              ? { keyboardShouldPersistTaps: 'handled' as const, showsVerticalScrollIndicator: false }
              : {})}
          >
            {children}
          </Body>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(27,26,41,0.4)' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    maxHeight: '88%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
});
