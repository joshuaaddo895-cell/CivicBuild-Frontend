import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { changePassword as changePasswordApi } from '@api/auth';
import type { ChangePasswordScreenProps } from '@appTypes/navigation';
import { AuthErrorBanner, AuthPrimaryButton, PasswordInput } from '@components/auth';
import theme from '@theme/index';
import { isValidPassword, PASSWORD_MISMATCH_MESSAGE } from '@utils/passwordValidation';
import { setChangePasswordSuccessToastFlag } from '@utils/session';

export default function ChangePasswordScreen({ navigation }: ChangePasswordScreenProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordsMismatch =
    confirmTouched && confirmPassword.length > 0 && newPassword !== confirmPassword;

  const canSubmit = useMemo(() => {
    return (
      currentPassword.length > 0 &&
      isValidPassword(newPassword) &&
      newPassword === confirmPassword &&
      !isSubmitting
    );
  }, [confirmPassword, currentPassword, isSubmitting, newPassword]);

  const handleSubmit = async () => {
    setConfirmTouched(true);
    setErrorMessage('');

    if (newPassword !== confirmPassword) {
      return;
    }

    if (!isValidPassword(newPassword)) {
      setErrorMessage('Password must be at least 8 characters with a letter and a number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await changePasswordApi({
        currentPassword,
        newPassword,
      });

      if (!result.ok) {
        setErrorMessage(result.error.message);
        return;
      }

      await setChangePasswordSuccessToastFlag();
      navigation.goBack();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backLabel}>Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subtitle}>
            Enter your current password and choose a new one. Other devices will be signed out.
          </Text>

          <AuthErrorBanner message={errorMessage} />

          <View style={styles.form}>
            <PasswordInput
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Your current password"
              autoComplete="password"
            />

            <PasswordInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
            />

            <PasswordInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onBlur={() => setConfirmTouched(true)}
              placeholder="Re-enter new password"
              autoComplete="new-password"
              hasError={passwordsMismatch}
              errorMessage={passwordsMismatch ? PASSWORD_MISMATCH_MESSAGE : undefined}
            />

            <AuthPrimaryButton
              label="Update Password"
              showArrow={false}
              loading={isSubmitting}
              disabled={!canSubmit}
              onPress={() => void handleSubmit()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.marginMobile,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surface,
  },
  backButton: {
    padding: theme.spacing.xs,
    minWidth: 48,
  },
  backLabel: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.onSurface,
  },
  headerSpacer: {
    width: 48,
  },
  pressed: {
    opacity: 0.75,
  },
  scrollContent: {
    padding: theme.spacing.marginMobile,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.stackLg,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    lineHeight: theme.typography.lineHeight.bodyMd,
    color: theme.colors.onSurfaceVariant,
  },
  form: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
});
