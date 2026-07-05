import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RegisterScreenProps } from '@appTypes/navigation';
import {
  AuthDecorBackground,
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
import { signInWithMockAuth, signInWithMockGoogle } from '@utils/devAuth';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const login = useAuthStore((state) => state.login);

  const { control, handleSubmit } = useForm<RegisterFormData>({
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      signInWithMockAuth(login, data.email, data.name);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGooglePress = () => {
    signInWithMockGoogle(login);
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
            <AuthScreenTopBar onClose={() => navigation.navigate('Login')} />

            <AuthHeroHeader title="Sign Up For Free" subtitle="Sign up in 1 minute for free!" />

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
                onPress={handleSubmit(onSubmit)}
              />

              <View style={styles.divider} />

              <GoogleSignInButton onPress={handleGooglePress} />
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
