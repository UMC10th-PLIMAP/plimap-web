export type FollowNotificationRelation = 'follow-back' | 'following';

export type FollowNotification = {
  id: string;
  actorNickname: string;
  actorProfileImageUrl: string;
  createdAtLabel: string;
  relation: FollowNotificationRelation;
};

export type FollowNotificationsPage = {
  data: FollowNotification[];
  nextCursor?: string;
  hasNext: boolean;
  pageSize: number;
};
