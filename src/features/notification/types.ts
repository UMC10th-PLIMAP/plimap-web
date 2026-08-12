export type NotificationType = 'FOLLOW' | 'PIN_CREATED' | 'PIN_LIKED';

export type Notification = {
  notificationId: number;
  type: NotificationType;
  actorId: number;
  actorNickname: string;
  actorProfileImageUrl: string | null;
  isFollowing: boolean;
  isFollowingViewer: boolean;
  pinId: number | null;
  placeName: string | null;
  albumImageUrl: string | null;
  read: boolean;
  createdAt: string;
};

export type NotificationPage = {
  data: Notification[];
  nextCursor: string | null;
  hasNext: boolean;
  pageSize: number;
};
