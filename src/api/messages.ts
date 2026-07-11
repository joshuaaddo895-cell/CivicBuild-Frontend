import type { ApiResponse } from '@appTypes/api';
import type { ChatMessage, MessageThread } from '@appTypes/messages';
import type {
  BackendChatMessage,
  BackendMessageThread,
  BackendThreadDetail,
  PaginatedChatMessages,
  PaginatedMessageThreads,
  SendMessageRequest,
  StartThreadRequest,
} from '@appTypes/messagesApi';
import {
  getMessageParticipantKind,
  getMessageParticipantLabel,
  resolveThreadParticipantName,
} from '@utils/messageThreadDisplay';

import { toApiResult, type ApiResult } from './apiResult';
import { unwrapApiResponse } from './authTypes';
import apiClient from './client';

function unwrapThreads(
  data: BackendMessageThread[] | PaginatedMessageThreads,
): BackendMessageThread[] {
  return Array.isArray(data) ? data : (data.items ?? []);
}

function unwrapThreadMessages(
  data: BackendChatMessage[] | PaginatedChatMessages | BackendThreadDetail,
): BackendChatMessage[] {
  if (Array.isArray(data)) {
    return data;
  }

  if ('messages' in data && Array.isArray(data.messages)) {
    return data.messages;
  }

  if ('items' in data && Array.isArray(data.items)) {
    return data.items;
  }

  return [];
}

export function mapBackendThread(thread: BackendMessageThread): MessageThread {
  const participantKind = getMessageParticipantKind(thread);
  const participantName = resolveThreadParticipantName(thread);

  return {
    id: thread.id,
    participantName,
    participantLogoUri: thread.participantLogoUrl ?? '',
    participantKind,
    participantLabel: getMessageParticipantLabel(participantKind),
    lastMessage: thread.lastMessage,
    lastMessageAt: thread.lastMessageAt,
    unreadCount: thread.unreadCount,
    agencyId: thread.agencyId ?? null,
    supplierId: thread.supplierId ?? null,
    customerId: thread.customerId ?? null,
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
      .get<ApiResponse<BackendMessageThread[] | PaginatedMessageThreads>>('/api/messages/threads')
      .then((response) => unwrapThreads(unwrapApiResponse(response.data)).map(mapBackendThread)),
  );
}

export async function startThread(input: StartThreadRequest): Promise<ApiResult<MessageThread>> {
  if (!input.agencyId && !input.supplierId) {
    return {
      ok: false,
      error: {
        message: 'Choose an agency or supplier to start a conversation.',
        statusCode: 400,
        code: 'VALIDATION',
      },
    };
  }

  if (input.supplierId && !input.agencyId) {
    return {
      ok: false,
      error: {
        message:
          'Direct supplier messaging is not available yet. Open a construction agency and tap Message Us.',
        statusCode: 400,
        code: 'VALIDATION',
      },
    };
  }

  return toApiResult(
    apiClient
      .post<ApiResponse<BackendMessageThread>>('/api/messages/threads', {
        agencyId: input.agencyId,
      })
      .then((response) => mapBackendThread(unwrapApiResponse(response.data))),
  );
}

export async function getThreadMessages(threadId: string): Promise<ApiResult<ChatMessage[]>> {
  return toApiResult(
    apiClient
      .get<ApiResponse<BackendChatMessage[] | PaginatedChatMessages | BackendThreadDetail>>(
        `/api/messages/threads/${threadId}`,
      )
      .then((response) =>
        unwrapThreadMessages(unwrapApiResponse(response.data)).map(mapBackendMessage),
      ),
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
