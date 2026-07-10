export type NotificationType = 'order' | 'verification' | 'personnel' | 'message';

export interface BackendNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, string>;
}
