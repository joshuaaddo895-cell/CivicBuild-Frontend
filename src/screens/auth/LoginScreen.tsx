import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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

import { login as loginApi, googleSignIn as googleSignInApi } from '@api/auth';
import type { LoginScreenProps } from '@appTypes/navigation';
import {
  AuthDecorBackground,
  AuthErrorBanner,
  AuthFooterLink,
  AuthHeader,
  AuthInput,
  AuthPrimaryButton,
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

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const login = useAuthStore((state) => state.login);
  const [, , promptGoogleAsync] = useGoogleAuthRequest();

  const { control, handleSubmit } = useForm<LoginFormData>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const result = await loginApi({
        email: data.email,
        password: data.password,
      });

      if (!result.ok) {
        setErrorMessage(result.error.message);
        return;
      }

      await login(result.data.user, result.data.accessToken, result.data.refreshToken);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGooglePress = async () => {
    setErrorMessage('');

    if (!isGoogleSignInConfigured()) {
      setErrorMessage(
        'Google Sign-In is not configured yet. Add Google client IDs to .env.development.',
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
            <AuthHeader title="Sign In" subtitle="Let's build something great together." />

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

              <AuthPrimaryButton
                label="Sign In"
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

            <AuthFooterLink
              prompt="Don't have an account?"
              linkText="Sign Up."
              onPress={() => navigation.navigate('Register')}
            />

            <Pressable
              style={styles.forgotLink}
              onPress={() => navigation.navigate('ForgotPassword')}
              accessibilityRole="link"
              accessibilityLabel="Forgot your password"
            >
              <Text style={styles.forgotLinkText}>Forgot your password?</Text>
            </Pressable>
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
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.marginMobile,
    paddingVertical: theme.spacing.stackLg,
  },
  inner: {
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
  },
  form: {
    gap: theme.spacing.stackMd,
    marginBottom: theme.spacing.stackLg,
  },
  divider: {
    height: theme.spacing.stackSm,
  },
  forgotLink: {
    alignSelf: 'center',
    marginTop: theme.spacing.stackMd,
    paddingVertical: theme.spacing.sm,
  },
  forgotLinkText: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodySm,
    lineHeight: theme.typography.lineHeight.bodySm,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
