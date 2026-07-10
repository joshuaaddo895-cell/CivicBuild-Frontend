export interface BackendMessageThread {
  id: string;
  participantName: string;
  participantLogoUrl?: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface BackendChatMessage {
  id: string;
  threadId: string;
  text: string;
  sentAt: string;
  isOutgoing: boolean;
}

export interface StartThreadRequest {
  agencyId: string;
}

export interface SendMessageRequest {
  text: string;
}
