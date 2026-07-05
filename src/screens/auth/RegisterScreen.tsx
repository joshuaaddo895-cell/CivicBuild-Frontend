import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import type { RegisterScreenProps } from '@appTypes/navigation';
import { authApi } from '@services/endpoints';
import { useAuthStore } from '@store/authStore';
import theme from '@theme/index';

// ─── Validation Schema ────────────────────────────────────────────────────────
const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Component ────────────────────────────────────────────────────────────────
export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const login = useAuthStore((state) => state.login);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      };
      const response = await authApi.register(payload);
      const { user, accessToken, refreshToken } = response.data.data;
      login(user, accessToken, refreshToken);
      navigation.navigate('Verify', { email: data.email });
    } catch {
      Alert.alert('Registration Failed', 'This email may already be in use. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields: {
    name: keyof RegisterFormData;
    label: string;
    placeholder: string;
    secure?: boolean;
    keyboardType?: 'email-address' | 'default';
  }[] = [
    { name: 'firstName', label: 'First Name', placeholder: 'John' },
    { name: 'lastName', label: 'Last Name', placeholder: 'Doe' },
    {
      name: 'email',
      label: 'Email',
      placeholder: 'you@example.com',
      keyboardType: 'email-address',
    },
    { name: 'password', label: 'Password', placeholder: '••••••••', secure: true },
    { name: 'confirmPassword', label: 'Confirm Password', placeholder: '••••••••', secure: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Join the CivicBuild community today</Text>
          </View>

          <View style={styles.form}>
            {fields.map(({ name, label, placeholder, secure, keyboardType }) => (
              <Controller
                key={name}
                control={control}
                name={name}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>{label}</Text>
                    <TextInput
                      style={[styles.input, errors[name] && styles.inputError]}
                      placeholder={placeholder}
                      placeholderTextColor={theme.colors.text.muted}
                      secureTextEntry={secure}
                      keyboardType={keyboardType ?? 'default'}
                      autoCapitalize={keyboardType === 'email-address' || secure ? 'none' : 'words'}
                      autoCorrect={false}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                    {errors[name] && <Text style={styles.errorText}>{errors[name]?.message}</Text>}
                  </View>
                )}
              />
            ))}

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface.DEFAULT },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing['2xl'],
  },
  backButton: { marginBottom: theme.spacing.xl },
  backButtonText: { color: theme.colors.primary[400], fontSize: theme.typography.fontSize.base },
  header: { marginBottom: theme.spacing['2xl'] },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: { fontSize: theme.typography.fontSize.base, color: theme.colors.text.secondary },
  form: { gap: theme.spacing.md },
  fieldContainer: { gap: theme.spacing.xs },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: theme.colors.surface.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 14,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
  },
  inputError: { borderColor: theme.colors.error },
  errorText: { fontSize: theme.typography.fontSize.xs, color: theme.colors.error },
  submitButton: {
    backgroundColor: theme.colors.primary[600],
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    ...theme.shadows.md,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing['2xl'],
  },
  footerText: { color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.base },
  footerLink: {
    color: theme.colors.primary[400],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
