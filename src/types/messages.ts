export interface MessageThread {
  id: string;
  participantName: string;
  participantLogoUri: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  text: string;
  sentAt: string;
  isOutgoing: boolean;
}
