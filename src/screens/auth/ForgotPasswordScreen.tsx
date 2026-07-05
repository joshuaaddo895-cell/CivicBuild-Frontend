import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ForgotPasswordScreenProps } from '@appTypes/navigation';
import {
  AuthBackButton,
  AuthDecorBackground,
  AuthHeroHeader,
  AuthInput,
  AuthPrimaryButton,
  ForgotPasswordIllustration,
} from '@components/auth';
import theme from '@theme/index';
import { resolveDemoEmail } from '@utils/mockAuth';

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<ForgotPasswordFormData>({
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      navigation.navigate('Verify', {
        email: resolveDemoEmail(data.email),
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
