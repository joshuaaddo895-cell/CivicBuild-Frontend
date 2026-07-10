import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { googleSignIn as googleSignInApi, register as registerApi } from '@api/auth';
import type { RegisterScreenProps } from '@appTypes/navigation';
import {
  AuthDecorBackground,
  AuthErrorBanner,
  AuthFooterLink,
  AuthHeroHeader,
  AuthInput,
  AuthPrimaryButton,
  AuthScreenFooter,
  AuthScreenTopBar,
  AuthTermsNotice,
  GoogleSignInButton,
  PasswordInput,
} from '@components/auth';
import { useAuthStore } from '@store/authStore';
import theme from '@theme/index';
import {
  extractGoogleIdToken,
  isGoogleSignInConfigured,
  useGoogleAuthRequest,
} from '@utils/googleSignIn';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const login = useAuthStore((state) => state.login);
  const [, , promptGoogleAsync] = useGoogleAuthRequest();

  const { control, handleSubmit } = useForm<RegisterFormData>({
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setErrorMessage('');

    if (data.password !== data.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await registerApi({
        fullName: data.name,
        email: data.email,
        password: data.password,
      });

      if (!result.ok) {
        setErrorMessage(result.error.message);
        return;
      }

      navigation.navigate('Login');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGooglePress = async () => {
    setErrorMessage('');

    if (!isGoogleSignInConfigured()) {
      setErrorMessage(
        'Google Sign-In is not configured yet. Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to .env.development.',
      );
      return;
    }

    setIsGoogleSubmitting(true);

    try {
      const googleResult = await promptGoogleAsync();
      const idToken = extractGoogleIdToken(googleResult);

      if (!idToken) {
        return;
      }

      const result = await googleSignInApi(idToken);
      if (!result.ok) {
        setErrorMessage(result.error.message);
        return;
      }

      await login(result.data.user, result.data.accessToken, result.data.refreshToken);
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const isBusy = isSubmitting || isGoogleSubmitting;

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
            <AuthScreenTopBar onClose={() => navigation.navigate('Login')} />

            <AuthHeroHeader title="Sign Up For Free" subtitle="Sign up in 1 minute for free!" />

            <AuthErrorBanner message={errorMessage} />

            <View style={styles.form}>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AuthInput
                    label="Full Name"
                    icon="person"
                    placeholder="e.g. John Contractor"
                    autoCapitalize="words"
                    autoCorrect={false}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />

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

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <PasswordInput
                    label="Password"
                    placeholder="Min. 8 characters"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <PasswordInput
                    label="Password Confirmation"
                    placeholder="Confirm your password"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />

              <AuthTermsNotice />

              <AuthPrimaryButton
                label="Sign Up"
                loading={isSubmitting}
                disabled={isBusy}
                onPress={handleSubmit(onSubmit)}
              />

              <View style={styles.divider} />

              <GoogleSignInButton
                onPress={handleGooglePress}
                disabled={isBusy}
                loading={isGoogleSubmitting}
              />
            </View>

            <AuthScreenFooter>
              <AuthFooterLink
                prompt="Already have an account?"
                linkText="Sign In."
                onPress={() => navigation.navigate('Login')}
              />
            </AuthScreenFooter>
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
  divider: {
    height: theme.spacing.stackSm,
  },
});
