import { createMockUser, getMockAuthTokens, resolveDemoEmail } from '@utils/mockAuth';

type LoginFn = (
  user: ReturnType<typeof createMockUser>,
  accessToken: string,
  refreshToken: string,
) => void;

/** Frontend-only auth until the CivicBuild backend is wired up. */
export function signInWithMockAuth(login: LoginFn, email?: string, name?: string) {
  const resolvedEmail = resolveDemoEmail(email);
  const { accessToken, refreshToken } = getMockAuthTokens();
  login(createMockUser(resolvedEmail, name), accessToken, refreshToken);
}

export function signInWithMockGoogle(login: LoginFn) {
  signInWithMockAuth(login, 'google.user@gmail.com', 'Google User');
}
