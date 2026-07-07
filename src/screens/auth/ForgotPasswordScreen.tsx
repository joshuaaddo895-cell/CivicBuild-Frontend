import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { forgotPassword } from '@api/auth';
import type { ForgotPasswordScreenProps } from '@appTypes/navigation';
import {
  AuthBackButton,
  AuthDecorBackground,
  AuthErrorBanner,
  AuthHeroHeader,
  AuthInput,
  AuthPrimaryButton,
  ForgotPasswordIllustration,
} from '@components/auth';
import theme from '@theme/index';

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { control, handleSubmit } = useForm<ForgotPasswordFormData>({
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const result = await forgotPassword(data.email);

      if (!result.ok && result.error.code !== 'NETWORK' && result.error.code !== 'TIMEOUT') {
        // Backend intentionally returns generic success for anti-enumeration.
        // Only surface connectivity failures here.
        setErrorMessage(result.error.message);
        return;
      }

      navigation.navigate('Verify', {
        email: data.email.trim(),
        mode: 'reset',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AuthDecorBackground />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inner}>
            <AuthBackButton onPress={() => navigation.goBack()} label="Back to Sign In" />

            <AuthHeroHeader
              title="Forgot Password"
              subtitle="Enter your email address to receive a password reset link."
            />

            <AuthErrorBanner message={errorMessage} />

            <View style={styles.form}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AuthInput
                    label="Email Address"
                    icon="email"
                    placeholder="e.g. john@contractor.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />

              <AuthPrimaryButton
                label="Send Reset Link"
                loading={isSubmitting}
                onPress={handleSubmit(onSubmit)}
              />
            </View>

            <ForgotPasswordIllustration />
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.marginMobile,
    paddingVertical: theme.spacing.stackMd,
  },
  inner: {
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
  },
  form: {
    gap: theme.spacing.stackMd,
  },
});
