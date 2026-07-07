import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { forgotPassword } from '@api/auth';
import type { VerifyScreenProps } from '@appTypes/navigation';
import {
  AuthDecorBackground,
  BackToSignInLink,
  CheckEmailFooter,
  CheckEmailIllustration,
  CheckEmailMessage,
  CheckEmailTopBar,
  ResendEmailCard,
  ResendSuccessToast,
} from '@components/auth';
import { CHECK_EMAIL_COPY, resolveCheckEmailMode } from '@constants/checkEmailCopy';
import { authApi } from '@services/endpoints';
import theme from '@theme/index';

export default function VerifyScreen({ route, navigation }: VerifyScreenProps) {
  const { email, mode: modeParam } = route.params;
  const mode = resolveCheckEmailMode(modeParam);
  const copy = CHECK_EMAIL_COPY[mode];

  const [isResending, setIsResending] = useState(false);
  const [resendError, setResendError] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleResend = useCallback(async () => {
    setResendError('');
    setShowSuccessToast(false);
    setIsResending(true);

    try {
      if (mode === 'signup') {
        await authApi.resendVerification(email);
      } else {
        const result = await forgotPassword(email);
        if (!result.ok && (result.error.code === 'NETWORK' || result.error.code === 'TIMEOUT')) {
          throw new Error(result.error.message);
        }
      }
      setShowSuccessToast(true);
    } catch {
      setResendError(copy.resendError);
    } finally {
      setIsResending(false);
    }
  }, [copy.resendError, email, mode]);

  return (
    <SafeAreaView style={styles.container}>
      <AuthDecorBackground />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          <CheckEmailTopBar onClose={() => navigation.navigate('Login')} />

          <View style={styles.centerContent}>
            <CheckEmailIllustration />

            <CheckEmailMessage
              email={email}
              subtitleBefore={copy.subtitleBefore}
              subtitleAfter={copy.subtitleAfter}
            />

            <ResendEmailCard
              prompt={copy.resendPrompt}
              label={copy.resendLabel}
              loading={isResending}
              errorMessage={resendError}
              onResend={handleResend}
            />

            <ResendSuccessToast
              message={copy.resendSuccess}
              visible={showSuccessToast}
              onHide={() => setShowSuccessToast(false)}
            />

            <BackToSignInLink onPress={() => navigation.navigate('Login')} />
          </View>

          <CheckEmailFooter />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.marginMobile,
    paddingVertical: theme.spacing.stackMd,
  },
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
    minHeight: '100%',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.stackLg,
  },
});
