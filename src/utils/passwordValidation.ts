export function isValidPassword(password: string): boolean {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

export const PASSWORD_MISMATCH_MESSAGE = 'ERROR: Password do not match';
