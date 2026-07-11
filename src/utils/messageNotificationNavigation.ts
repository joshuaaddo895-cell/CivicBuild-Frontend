import type { BackendNotification } from '@appTypes/notificationsApi';

export function getThreadIdFromNotification(notification: BackendNotification): string | null {
  const data = notification.data;
  if (!data) {
    return null;
  }

  return data.threadId ?? data.thread_id ?? null;
}

export function getConversationParamsFromNotification(notification: BackendNotification): {
  threadId: string;
  participantName?: string;
  participantLogoUri?: string;
} | null {
  const threadId = getThreadIdFromNotification(notification);
  if (!threadId) {
    return null;
  }

  const data = notification.data;

  return {
    threadId,
    participantName: data?.participantName ?? data?.participant_name ?? notification.title,
    participantLogoUri: data?.participantLogoUri ?? data?.participant_logo_uri,
  };
}

export function getPersonnelIdFromNotification(notification: BackendNotification): string | null {
  const data = notification.data;
  if (!data) {
    return null;
  }

  return data.personnelId ?? data.personnel_id ?? null;
}

export function isPendingPersonnelNotification(notification: BackendNotification): boolean {
  if (notification.type !== 'personnel') {
    return false;
  }

  const status = notification.data?.approvalStatus ?? notification.data?.approval_status;
  return !status || status === 'pending';
}
