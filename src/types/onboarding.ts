import type { MaterialIcons } from '@expo/vector-icons';

export type AccountType = 'customer' | 'supplier' | 'construction' | 'planning' | 'delivery';

export interface RoleOption {
  id: AccountType;
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

export function requiresVerification(accountType: AccountType): boolean {
  return accountType !== 'customer';
}
