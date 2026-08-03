import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/api/types';
import type { NotificationPage } from '@/features/notification/types';

const ENDPOINT = '/api/v1/notifications';

type GetNotificationsParams = {
  cursor?: string;
  pageSize: number;
};

type NotificationSubscriptionHandlers = {
  onNotification: () => void;
  onOpen?: () => void;
  onTerminalError?: () => void;
};

export async function getNotifications({ cursor, pageSize }: GetNotificationsParams) {
  const { data } = await apiClient.get<ApiResponse<NotificationPage>>(ENDPOINT, {
    params: { cursor, pageSize },
  });

  return data.result;
}

export function subscribeToNotifications({
  onNotification,
  onOpen,
  onTerminalError,
}: NotificationSubscriptionHandlers) {
  const apiBaseUrl = apiClient.defaults.baseURL || window.location.origin;
  const url = new URL(`${ENDPOINT}/subscribe`, new URL(apiBaseUrl, window.location.origin));
  const eventSource = new EventSource(url, { withCredentials: true });

  eventSource.addEventListener('notification', onNotification);
  eventSource.addEventListener('open', () => onOpen?.());
  eventSource.addEventListener('error', () => {
    // The server intentionally ends the stream periodically. EventSource enters
    // CONNECTING for those normal reconnects; CLOSED means it will not recover.
    if (eventSource.readyState === EventSource.CLOSED) {
      onTerminalError?.();
    }
  });
  return eventSource;
}
