export type NotificationType = 'FOLLOW' | 'PIN_CREATED' | 'PIN_LIKED';

export type Notification = {
  notificationId: number;
  type: NotificationType;
  actorId: number;
  actorNickname: string;
  actorProfileImageUrl: string | null;
  pinId: number | null;
  pinPlaceName: string | null;
  pinAlbumImageUrl: string | null;
  isFollowing: boolean;
  read: boolean;
  createdAt: string;
};

export type NotificationPage = {
  data: Notification[];
  nextCursor: string | null;
  hasNext: boolean;
  pageSize: number;
};
