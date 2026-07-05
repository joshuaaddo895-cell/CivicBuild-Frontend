export type CheckEmailMode = 'reset' | 'signup';

export interface CheckEmailCopy {
  subtitleBefore: string;
  subtitleAfter: string;
  resendPrompt: string;
  resendLabel: string;
  resendSuccess: string;
  resendError: string;
}

export const CHECK_EMAIL_COPY: Record<CheckEmailMode, CheckEmailCopy> = {
  reset: {
    subtitleBefore: "We've sent a password reset link to ",
    subtitleAfter: '. Please check your inbox and follow the instructions.',
    resendPrompt: "Didn't receive the email?",
    resendLabel: 'Resend Link',
    resendSuccess: 'Email resent successfully!',
    resendError: 'Unable to resend reset link. Please try again.',
  },
  signup: {
    subtitleBefore: "We've sent a verification link to ",
    subtitleAfter: '. Please check your inbox and confirm your account.',
    resendPrompt: "Didn't receive the email?",
    resendLabel: 'Resend Link',
    resendSuccess: 'Verification email resent successfully!',
    resendError: 'Unable to resend verification email. Please try again.',
  },
};

export function resolveCheckEmailMode(mode?: CheckEmailMode): CheckEmailMode {
  return mode === 'signup' ? 'signup' : 'reset';
}
