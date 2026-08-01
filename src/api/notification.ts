import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/api/types';
import type { NotificationPage } from '@/features/notification/types';

const ENDPOINT = '/api/v1/notifications';

type GetNotificationsParams = {
  cursor?: string;
  pageSize: number;
};

export async function getNotifications({ cursor, pageSize }: GetNotificationsParams) {
  const { data } = await apiClient.get<ApiResponse<NotificationPage>>(ENDPOINT, {
    params: { cursor, pageSize },
  });

  return data.result;
}

export function subscribeToNotifications(onNotification: () => void) {
  const apiBaseUrl = apiClient.defaults.baseURL || window.location.origin;
  const url = new URL(`${ENDPOINT}/subscribe`, new URL(apiBaseUrl, window.location.origin));
  const eventSource = new EventSource(url, { withCredentials: true });

  eventSource.addEventListener('notification', onNotification);
  return eventSource;
}
