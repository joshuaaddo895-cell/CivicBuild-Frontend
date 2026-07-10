import type { ApiResponse } from '@appTypes/api';
import type { ChatMessage, MessageThread } from '@appTypes/messages';
import type {
  BackendChatMessage,
  BackendMessageThread,
  SendMessageRequest,
  StartThreadRequest,
} from '@appTypes/messagesApi';

import { toApiResult, type ApiResult } from './apiResult';
import { unwrapApiResponse } from './authTypes';
import apiClient from './client';

export function mapBackendThread(thread: BackendMessageThread): MessageThread {
  return {
    id: thread.id,
    participantName: thread.participantName,
    participantLogoUri: thread.participantLogoUrl ?? '',
    lastMessage: thread.lastMessage,
    lastMessageAt: thread.lastMessageAt,
    unreadCount: thread.unreadCount,
  };
}

export function mapBackendMessage(message: BackendChatMessage): ChatMessage {
  return {
    id: message.id,
    threadId: message.threadId,
    text: message.text,
    sentAt: message.sentAt,
    isOutgoing: message.isOutgoing,
  };
}

export async function getThreads(): Promise<ApiResult<MessageThread[]>> {
  return toApiResult(
    apiClient
      .get<ApiResponse<BackendMessageThread[]>>('/api/messages/threads')
      .then((response) => unwrapApiResponse(response.data).map(mapBackendThread)),
  );
}

export async function startThread(input: StartThreadRequest): Promise<ApiResult<MessageThread>> {
  return toApiResult(
    apiClient
      .post<ApiResponse<BackendMessageThread>>('/api/messages/threads', input)
      .then((response) => mapBackendThread(unwrapApiResponse(response.data))),
  );
}

export async function getThreadMessages(threadId: string): Promise<ApiResult<ChatMessage[]>> {
  return toApiResult(
    apiClient
      .get<ApiResponse<BackendChatMessage[]>>(`/api/messages/threads/${threadId}`)
      .then((response) => unwrapApiResponse(response.data).map(mapBackendMessage)),
  );
}

export async function sendMessage(
  threadId: string,
  input: SendMessageRequest,
): Promise<ApiResult<ChatMessage>> {
  return toApiResult(
    apiClient
      .post<ApiResponse<BackendChatMessage>>(`/api/messages/threads/${threadId}/messages`, input)
      .then((response) => mapBackendMessage(unwrapApiResponse(response.data))),
  );
}

export async function markThreadRead(threadId: string): Promise<ApiResult<null>> {
  return toApiResult(
    apiClient.patch<ApiResponse<null>>(`/api/messages/threads/${threadId}/read`).then(() => null),
  );
}

export function formatMessageTimestamp(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit' });
  }

  return date.toLocaleDateString('en-GH', { day: 'numeric', month: 'short' });
}
