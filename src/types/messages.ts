export interface MessageThread {
  id: string;
  participantName: string;
  participantLogoUri: string;
  participantKind: 'agency' | 'supplier' | 'customer' | 'unknown';
  participantLabel: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  agencyId?: string | null;
  supplierId?: string | null;
  customerId?: string | null;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  text: string;
  sentAt: string;
  isOutgoing: boolean;
}
