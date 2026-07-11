export interface BackendMessageThread {
  id: string;
  participantName: string;
  participantLogoUrl?: string | null;
  participantType?: 'agency' | 'supplier' | 'customer' | string;
  agencyId?: string | null;
  supplierId?: string | null;
  customerId?: string | null;
  agencyName?: string | null;
  supplierName?: string | null;
  customerName?: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface PaginatedMessageThreads {
  items: BackendMessageThread[];
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
}

export interface BackendChatMessage {
  id: string;
  threadId: string;
  text: string;
  sentAt: string;
  isOutgoing: boolean;
}

export interface StartThreadRequest {
  agencyId?: string;
  supplierId?: string;
}

export interface SendMessageRequest {
  text: string;
}

export interface BackendThreadDetail extends BackendMessageThread {
  messages?: BackendChatMessage[];
}

export interface PaginatedChatMessages {
  items: BackendChatMessage[];
  page?: number;
  limit?: number;
  total?: number;
  hasNextPage?: boolean;
}
