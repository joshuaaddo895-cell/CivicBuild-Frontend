import type { MessageThread } from '@appTypes/messages';

export const MESSAGE_THREADS: MessageThread[] = [
  {
    id: 'thread-buildstrong',
    participantName: 'BuildStrong Ltd',
    participantLogoUri:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC1lV8yWOSrjZWyPs5UsgUw2BLnMm0JvBP3wrrt50t4V5SIw9JMRRjDLIuCDUCB2z1-xGfotX6gygCZKpspKM4dHK5ZKFZ3S8Y8evF8wfb2_T9Z_QfvwACgk-KcNH8-sNo9vjCHeqRK9FjhCixhxYeF30aWg2UKczBkYNigxLYGOOw8dVqdZuOm8pg4K1Jnx0wmu4rBbTCnjRQU_cQ8yFTruLhn11JM1eegRBqiGG5aVi_BlcSRMjmj',
    lastMessage: 'Your cement quote is ready for review.',
    lastMessageAt: '2026-07-06T10:30:00Z',
    unreadCount: 2,
  },
  {
    id: 'thread-west-africa-cement',
    participantName: 'West Africa Cement',
    participantLogoUri:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDU6z37ivgb9E8BnrC7zMlkwk_Sa3sYQanhVtqGz4DlVXcp-fp42BFblf2MDj-Yf_IKRKMwGIQ27MgrPGN7o43_WR1ya6CYD5NGhpNb7GtQkHUyhe5TfzBtRoo1PbweNnGwH5ZK9K5QwKFp0Elc9x2nUi1W7nDrooqcIcE5fsg_NMPU-8qjLi94eLwyMhOMZSSbKRFhCH8YtpUwgcNt40-kMsoJ0NPw0v33fhDoXqgDKUMWv2jGth9W',
    lastMessage: 'Thanks — we can deliver tomorrow morning.',
    lastMessageAt: '2026-07-05T16:45:00Z',
    unreadCount: 0,
  },
];

export const CHAT_MESSAGES_BY_THREAD: Record<
  string,
  { id: string; text: string; sentAt: string; isOutgoing: boolean }[]
> = {
  'thread-buildstrong': [
    {
      id: 'm1',
      text: 'Hi, I need a quote for 200 bags of cement.',
      sentAt: '2026-07-06T09:00:00Z',
      isOutgoing: true,
    },
    {
      id: 'm2',
      text: 'Thanks for reaching out! We are preparing your quote now.',
      sentAt: '2026-07-06T09:15:00Z',
      isOutgoing: false,
    },
    {
      id: 'm3',
      text: 'Your cement quote is ready for review.',
      sentAt: '2026-07-06T10:30:00Z',
      isOutgoing: false,
    },
  ],
  'thread-west-africa-cement': [
    {
      id: 'm4',
      text: 'Can you deliver sand to East Legon this week?',
      sentAt: '2026-07-05T15:00:00Z',
      isOutgoing: true,
    },
    {
      id: 'm5',
      text: 'Thanks — we can deliver tomorrow morning.',
      sentAt: '2026-07-05T16:45:00Z',
      isOutgoing: false,
    },
  ],
};

export function findMessageThread(threadId: string): MessageThread | undefined {
  return MESSAGE_THREADS.find((thread) => thread.id === threadId);
}

export function formatMessageTimestamp(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
