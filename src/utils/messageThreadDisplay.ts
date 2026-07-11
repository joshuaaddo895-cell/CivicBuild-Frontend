import type { MessageThread } from '@appTypes/messages';
import type { BackendMessageThread } from '@appTypes/messagesApi';

export type MessageParticipantKind = 'agency' | 'supplier' | 'customer' | 'unknown';

export function getMessageParticipantKind(
  thread: Pick<BackendMessageThread, 'participantType' | 'agencyId' | 'supplierId' | 'customerId'>,
): MessageParticipantKind {
  const participantType = thread.participantType?.toLowerCase();
  if (
    participantType === 'agency' ||
    participantType === 'supplier' ||
    participantType === 'customer'
  ) {
    return participantType;
  }

  if (thread.agencyId) {
    return 'agency';
  }

  if (thread.supplierId) {
    return 'supplier';
  }

  if (thread.customerId) {
    return 'customer';
  }

  return 'unknown';
}

export function getMessageParticipantLabel(kind: MessageParticipantKind): string {
  switch (kind) {
    case 'agency':
      return 'Construction agency';
    case 'supplier':
      return 'Material supplier';
    case 'customer':
      return 'Customer';
    default:
      return 'Contact';
  }
}

export function resolveThreadParticipantName(thread: BackendMessageThread): string {
  const candidates = [
    thread.participantName,
    thread.agencyName,
    thread.supplierName,
    thread.customerName,
  ];

  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (trimmed && trimmed.toLowerCase() !== 'conversation') {
      return trimmed;
    }
  }

  return 'Unknown contact';
}

export function getThreadInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export function sortThreadsByRecent(threads: MessageThread[]): MessageThread[] {
  return [...threads].sort(
    (left, right) =>
      new Date(right.lastMessageAt).getTime() - new Date(left.lastMessageAt).getTime(),
  );
}

export function getParticipantAvatarIcon(
  kind: MessageParticipantKind,
): 'business' | 'store' | 'person' {
  switch (kind) {
    case 'agency':
      return 'business';
    case 'supplier':
      return 'store';
    case 'customer':
      return 'person';
    default:
      return 'business';
  }
}
